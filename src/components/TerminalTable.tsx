// TerminalTable.tsx — the compact INLINE data table: a dense, theme-styled
// table for dashboards, drawers, and status panels (members, nodes, query
// results). Unlike TerminalDataTable2 (the modal result browser with search/
// pagination/JSON trees), this renders in place with zero chrome.
//
// Every cell carries its own padding and stays on one line — the two defects
// dense hand-rolled tables reliably develop (naked <th>s colliding, ids
// wrapping mid-name). Wide tables scroll inside the component's own frame,
// never the page. Cells only ELIDE (…) when the host asks for it (`truncate`),
// so the plain table keeps the scrolling behaviour it always had.
//
// Selection and paging are both OPTIONAL and CONTROLLED — the table never
// owns either. Pass `selectedKeys`/`onSelectionChange` to get a checkbox
// column (header tri-state over the current page, shift-click range within
// the page); pass `page`/`pageSize`/`onPageChange` to get a First/Prev/Next/
// Last footer. Both survive re-renders driven entirely by the host, which is
// what lets selection survive paging: the host just keeps the same Set while
// swapping `rows` for a new page.
//
// Pass NONE of the new props and the DOM is byte-for-byte the table of
// v0.3.12 — same single scrolling <div>, same class strings, no checkbox
// column, no footer, no tab stop. See TerminalTable.test.tsx ("back-compat").
import React, { ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTheme } from '../theme';
import { TerminalCheckbox } from './TerminalCheckbox';
import { TerminalButton } from './TerminalButton';
import { TerminalSelect } from './TerminalSelect';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface TerminalTableColumn<T> {
    key: string;
    /** Header text; defaults to `key`, '' for an action column. */
    label?: string;
    width?: number | string;
    align?: 'left' | 'right' | 'center';
    /** Cell renderer; defaults to String(row[key] ?? '—'). */
    render?: (row: T, index: number) => ReactNode;
    /** Extra classes on every body cell (e.g. a color token). */
    className?: string;
    headerClassName?: string;
    /** Renders a clickable, aria-sort header; only meaningful with `sort`/`onSortChange`. */
    sortable?: boolean;
    /** Elide this cell with `…` (+ a `title`) instead of widening the table. Overrides the table-level `truncate`. */
    truncate?: boolean;
}

export type TerminalTableSortDirection = 'asc' | 'desc';

export interface TerminalTableSort {
    key: string;
    direction: TerminalTableSortDirection;
}

export interface TerminalTableProps<T> {
    columns: TerminalTableColumn<T>[];
    rows: T[];
    /**
     * Stable row identity; defaults to the row index. Keys are compared as
     * strings, so selection needs one that is globally stable (not just stable
     * within a page) for it to survive paging.
     */
    rowKey?: (row: T, index: number) => React.Key;
    /** Rendered as a full-width row when `rows` is empty (and not loading/error). */
    empty?: ReactNode;
    /** Keep the header visible while the body scrolls. */
    stickyHeader?: boolean;
    /** Scroll the table past this height (px or any CSS length). */
    maxHeight?: number | string;
    onRowClick?: (row: T, index: number) => void;
    /** Extra classes per row, e.g. to dim an already-chosen row. */
    rowClassName?: (row: T, index: number) => string;
    /** A trailing, unlabeled cell per row (icon buttons, a menu trigger). */
    rowActions?: (row: T, index: number) => ReactNode;
    /**
     * A row's plain-text name, used for the selection checkbox's accessible
     * label. Defaults to the first column's text (when it renders a string)
     * or the row key.
     */
    rowLabel?: (row: T, index: number) => string;
    className?: string;
    /** Replaces the `<thead>` background (default: the theme's surface) — e.g. the elevated band a pane header wants. */
    headerClassName?: string;
    /** Extra classes on the paging footer, e.g. to sit it on an elevated band. */
    footerClassName?: string;
    /** Tight row padding. Default true. */
    dense?: boolean;
    /**
     * Elide every cell with `…` (+ a `title` with the full text) rather than
     * letting a wide table scroll sideways. Default false — the historical
     * behaviour. A column's own `truncate` overrides this.
     */
    truncate?: boolean;

    /** Keeps the previous `rows` on screen, dimmed, instead of collapsing the table while a page loads. */
    loading?: boolean;
    /** Replaces the body with an error message and a retry button. */
    error?: string | null;
    onRetry?: () => void;

    // ---- Paging: controlled, server-driven. Omit `page` for no footer. ----
    /** 0-based current page. */
    page?: number;
    pageSize?: number;
    /** Total row count; omit when unknown (footer shows "N–M" and enables Next while `hasMore`, hides Last). */
    total?: number;
    /** Whether a further page exists, when `total` is unknown. */
    hasMore?: boolean;
    onPageChange?: (page: number) => void;
    pageSizeOptions?: number[];
    onPageSizeChange?: (pageSize: number) => void;

    // ---- Selection: controlled, survives paging. Omit `selectedKeys` for no selection column. ----
    selectedKeys?: Set<string> | string[];
    onSelectionChange?: (next: Set<string>) => void;
    /** A row that cannot be selected (already chosen, locked, …). */
    isRowSelectable?: (row: T) => boolean;
    /** Tooltip explaining why a row's checkbox is disabled. */
    selectionDisabledReason?: (row: T) => string | undefined;

    // ---- Sorting: optional, controlled. Omit either half to skip it entirely. ----
    sort?: TerminalTableSort;
    onSortChange?: (sort: TerminalTableSort) => void;
}

function toSet(keys: Set<string> | string[] | undefined): Set<string> {
    if (keys instanceof Set) return keys;
    return new Set(keys ?? []);
}

function defaultRowKey<T>(_row: T, index: number): React.Key {
    return index;
}

function pageBounds(page: number, pageSize: number, rowCount: number) {
    if (rowCount === 0) return { start: 0, end: 0 };
    const start = page * pageSize + 1;
    return { start, end: page * pageSize + rowCount };
}

interface PagingFooterProps {
    page: number;
    pageSize: number;
    total?: number;
    hasMore?: boolean;
    rowCount: number;
    onPageChange: (page: number) => void;
    pageSizeOptions?: number[];
    onPageSizeChange?: (pageSize: number) => void;
    className?: string;
}

function PagingFooter({ page, pageSize, total, hasMore, rowCount, onPageChange, pageSizeOptions, onPageSizeChange, className }: PagingFooterProps) {
    const theme = useTheme();
    const { start, end } = pageBounds(page, pageSize, rowCount);
    const totalKnown = total !== undefined;
    const lastPage = totalKnown ? Math.max(0, Math.ceil(total / pageSize) - 1) : undefined;
    const atFirst = page <= 0;
    const atLast = totalKnown ? page >= (lastPage as number) : !hasMore;
    const rangeText = totalKnown ? `${start}–${end} of ${total.toLocaleString()}` : `${start}–${end}`;

    // A page-size change keeps the first visible row in view: the new page is
    // whichever one now contains it. Without this, "50 → 250" on page 40 jumps
    // to row 10,000 of a list that now only has 40 pages' worth of rows.
    const changePageSize = (next: number) => {
        const firstIndex = page * pageSize;
        onPageSizeChange?.(next);
        const nextPage = Math.floor(firstIndex / next);
        if (nextPage !== page) onPageChange(nextPage);
    };

    return (
        <div className={cx('flex flex-none flex-wrap items-center justify-between gap-2 border-t px-2 py-1.5', theme.border, theme.default.text.muted, className)}>
            <span className="text-[11px] tabular-nums">{rangeText}</span>
            <div className="flex items-center gap-3">
                {pageSizeOptions && pageSizeOptions.length > 0 && onPageSizeChange && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px]">rows</span>
                        <TerminalSelect
                            size="small"
                            value={String(pageSize)}
                            options={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
                            onChange={(v) => changePageSize(Number(v))}
                            className="w-16"
                        />
                    </div>
                )}
                <div className="flex items-center gap-1">
                    <TerminalButton size="small" variant="ghost" disabled={atFirst} onClick={() => onPageChange(0)} title="First page" aria-label="First page">First</TerminalButton>
                    <TerminalButton size="small" variant="ghost" disabled={atFirst} onClick={() => onPageChange(page - 1)} title="Previous page" aria-label="Previous page">Prev</TerminalButton>
                    <TerminalButton size="small" variant="ghost" disabled={atLast} onClick={() => onPageChange(page + 1)} title="Next page" aria-label="Next page">Next</TerminalButton>
                    {totalKnown && (
                        <TerminalButton size="small" variant="ghost" disabled={atLast} onClick={() => onPageChange(lastPage as number)} title="Last page" aria-label="Last page">Last</TerminalButton>
                    )}
                </div>
            </div>
        </div>
    );
}

export function TerminalTable<T>({
    columns,
    rows,
    rowKey = defaultRowKey,
    empty = 'no rows',
    stickyHeader = false,
    maxHeight,
    onRowClick,
    rowClassName,
    rowActions,
    rowLabel,
    className = '',
    headerClassName,
    footerClassName,
    dense = true,
    truncate = false,

    loading = false,
    error = null,
    onRetry,

    page,
    pageSize,
    total,
    hasMore,
    onPageChange,
    pageSizeOptions,
    onPageSizeChange,

    selectedKeys,
    onSelectionChange,
    isRowSelectable,
    selectionDisabledReason,

    sort,
    onSortChange,
}: TerminalTableProps<T>) {
    const theme = useTheme();
    const idBase = useId();
    // The shift-range anchor is remembered by KEY as well as index: an index
    // alone survives a page change and would then anchor a range on a row the
    // user never clicked.
    const [anchor, setAnchor] = useState<{ index: number; key: string } | null>(null);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const rowRefs = useRef(new Map<number, HTMLTableRowElement>());

    const hasSelection = selectedKeys !== undefined && !!onSelectionChange;
    const hasPaging = page !== undefined && pageSize !== undefined && !!onPageChange;
    const selectedSet = useMemo(() => toSet(selectedKeys), [selectedKeys]);

    const keyOf = useCallback((row: T, index: number) => String(rowKey(row, index)), [rowKey]);
    const isSelectable = useCallback((row: T) => (isRowSelectable ? isRowSelectable(row) : true), [isRowSelectable]);

    const selectablePageKeys = useMemo(
        () => rows.map((r, i) => (isSelectable(r) ? keyOf(r, i) : null)).filter((k): k is string => k !== null),
        [rows, isSelectable, keyOf],
    );
    const selectedOnPage = selectablePageKeys.filter((k) => selectedSet.has(k));
    const allOnPageSelected = selectablePageKeys.length > 0 && selectedOnPage.length === selectablePageKeys.length;
    const someOnPageSelected = selectedOnPage.length > 0 && !allOnPageSelected;

    const commitSelection = (next: Set<string>) => onSelectionChange?.(next);

    const toggleAllOnPage = () => {
        const next = new Set(selectedSet);
        if (allOnPageSelected) selectablePageKeys.forEach((k) => next.delete(k));
        else selectablePageKeys.forEach((k) => next.add(k));
        commitSelection(next);
    };

    // The anchor only counts while the row it was set on is still the row at
    // that index — i.e. within the page it was clicked on.
    const anchorIndex = anchor !== null && anchor.index < rows.length && keyOf(rows[anchor.index], anchor.index) === anchor.key
        ? anchor.index
        : null;

    const toggleRow = (index: number, shiftKey: boolean) => {
        const row = rows[index];
        if (!isSelectable(row)) return;
        const key = keyOf(row, index);
        const next = new Set(selectedSet);
        const targetSelected = !selectedSet.has(key);

        if (shiftKey && anchorIndex !== null) {
            const from = Math.min(anchorIndex, index);
            const to = Math.max(anchorIndex, index);
            for (let i = from; i <= to; i += 1) {
                const r = rows[i];
                if (!isSelectable(r)) continue; // an unselectable row inside the range is skipped, not forced
                const k = keyOf(r, i);
                if (targetSelected) next.add(k);
                else next.delete(k);
            }
        } else if (targetSelected) {
            next.add(key);
        } else {
            next.delete(key);
        }

        setAnchor({ index, key });
        commitSelection(next);
    };

    const toggleSort = (col: TerminalTableColumn<T>) => {
        if (!col.sortable || !onSortChange) return;
        const direction: TerminalTableSortDirection = sort?.key === col.key && sort.direction === 'asc' ? 'desc' : 'asc';
        onSortChange({ key: col.key, direction });
    };

    const lastPage = hasPaging && total !== undefined
        ? Math.max(0, Math.ceil(total / (pageSize as number)) - 1)
        : undefined;

    // `total` can shrink under the current page (a filter narrowed the set, or
    // rows were deleted). Ask the host — ONCE per value — to move to the last
    // valid page; a host that ignores it must not be looped over.
    const correctedTo = useRef<number | null>(null);
    const onPageChangeRef = useRef(onPageChange);
    onPageChangeRef.current = onPageChange;
    useEffect(() => {
        if (!hasPaging || lastPage === undefined) return;
        if ((page as number) <= lastPage) {
            correctedTo.current = null;
            return;
        }
        if (correctedTo.current === lastPage) return;
        correctedTo.current = lastPage;
        onPageChangeRef.current?.(lastPage);
    }, [hasPaging, page, lastPage]);

    // Focus never falls off the end when the page shrinks — it lands on the
    // new last row, so removing a row keeps the keyboard where the user was.
    useEffect(() => {
        setFocusedIndex((i) => (i === null ? null : rows.length === 0 ? null : Math.min(i, rows.length - 1)));
    }, [rows]);

    useEffect(() => {
        if (focusedIndex === null) return;
        rowRefs.current.get(focusedIndex)?.scrollIntoView?.({ block: 'nearest' });
    }, [focusedIndex]);

    const canPageForward = total !== undefined
        ? (page as number) < Math.ceil(total / (pageSize as number)) - 1
        : !!hasMore;

    const focusable = hasSelection || hasPaging;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!focusable || rows.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedIndex((i) => Math.min(rows.length - 1, i === null ? 0 : i + 1));
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIndex((i) => Math.max(0, i === null ? 0 : i - 1));
            return;
        }
        if (e.key === 'Home') {
            e.preventDefault();
            setFocusedIndex(0);
            return;
        }
        if (e.key === 'End') {
            e.preventDefault();
            setFocusedIndex(rows.length - 1);
            return;
        }
        if (e.key === ' ' && hasSelection && focusedIndex !== null) {
            e.preventDefault();
            toggleRow(focusedIndex, e.shiftKey);
            return;
        }
        if (e.key === 'PageDown' && hasPaging) {
            e.preventDefault();
            if (canPageForward) onPageChange?.((page as number) + 1);
            return;
        }
        if (e.key === 'PageUp' && hasPaging) {
            e.preventDefault();
            if ((page as number) > 0) onPageChange?.((page as number) - 1);
        }
    };

    const labelOf = (row: T, index: number): string => {
        if (rowLabel) return rowLabel(row, index);
        const first = columns[0];
        if (first) {
            const rendered = first.render ? first.render(row, index) : (row as Record<string, unknown>)[first.key];
            if (typeof rendered === 'string' || typeof rendered === 'number') return String(rendered);
        }
        return keyOf(row, index);
    };

    const alignClass = (c: TerminalTableColumn<T>) => (c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left');
    const cellPad = dense ? 'px-2 py-1' : 'px-3 py-2';
    const headerPad = dense ? 'px-2 py-1.5' : 'px-3 py-2.5';
    const colSpan = columns.length + (hasSelection ? 1 : 0) + (rowActions ? 1 : 0);

    const body = (
        <table className="w-full font-mono text-xs">
            {columns.some((c) => c.width) && (
                <colgroup>
                    {hasSelection && <col style={{ width: 32 }} />}
                    {columns.map((c) => (
                        <col key={c.key} style={c.width != null ? { width: c.width } : undefined} />
                    ))}
                    {rowActions && <col />}
                </colgroup>
            )}
            <thead className={cx(headerClassName ?? theme.bgSecondary, stickyHeader && 'sticky top-0 z-10')}>
                <tr>
                    {hasSelection && (
                        <th scope="col" className={cx(headerPad, 'w-8')}>
                            <TerminalCheckbox
                                checked={allOnPageSelected}
                                indeterminate={someOnPageSelected}
                                disabled={selectablePageKeys.length === 0}
                                onChange={toggleAllOnPage}
                                aria-label="Select all rows on this page"
                            />
                        </th>
                    )}
                    {columns.map((c) => {
                        const isSorted = sort?.key === c.key;
                        const ariaSort = c.sortable ? (isSorted ? (sort!.direction === 'asc' ? 'ascending' : 'descending') : 'none') : undefined;
                        return (
                            <th
                                key={c.key}
                                aria-sort={ariaSort}
                                className={cx('whitespace-nowrap', headerPad, 'text-[10px] font-normal uppercase tracking-wider', theme.default.text.muted, alignClass(c), c.headerClassName)}
                            >
                                {c.sortable && onSortChange ? (
                                    <button
                                        type="button"
                                        onClick={() => toggleSort(c)}
                                        aria-label={`Sort by ${c.label ?? c.key}`}
                                        className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-midnight-accent-bright"
                                    >
                                        {c.label ?? c.key}
                                        {isSorted && <span aria-hidden="true">{sort!.direction === 'asc' ? '▲' : '▼'}</span>}
                                    </button>
                                ) : (
                                    c.label ?? c.key
                                )}
                            </th>
                        );
                    })}
                    {rowActions && <th className={headerPad} aria-label="Row actions" />}
                </tr>
            </thead>
            <tbody className={loading ? 'opacity-50 transition-opacity duration-150' : undefined}>
                {error != null && (
                    <tr>
                        <td colSpan={colSpan} className={cx(cellPad, 'text-center')}>
                            <div className={cx('flex items-center justify-center gap-3 py-2', theme.default.text.danger)}>
                                <span>{error}</span>
                                {onRetry && (
                                    <TerminalButton size="small" variant="secondary" onClick={onRetry}>retry</TerminalButton>
                                )}
                            </div>
                        </td>
                    </tr>
                )}
                {error == null && rows.length === 0 && (
                    <tr>
                        <td colSpan={colSpan} className={cx(dense ? 'px-2 py-2' : 'px-3 py-2', 'italic', theme.default.text.muted)}>{empty}</td>
                    </tr>
                )}
                {error == null && rows.map((row, i) => {
                    const key = keyOf(row, i);
                    const selectable = isSelectable(row);
                    const selected = hasSelection && selectedSet.has(key);
                    const disabledReason = !selectable ? selectionDisabledReason?.(row) : undefined;
                    const isFocused = focusedIndex === i;

                    return (
                        <tr
                            key={key}
                            id={focusable ? `${idBase}row-${i}` : undefined}
                            ref={(el) => {
                                if (el) rowRefs.current.set(i, el);
                                else rowRefs.current.delete(i);
                            }}
                            onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                            aria-selected={hasSelection ? selected : undefined}
                            className={cx(
                                'border-t',
                                theme.border,
                                onRowClick && `cursor-pointer ${theme.hover}`,
                                selected && 'bg-midnight-elevated',
                                isFocused && 'ring-1 ring-inset ring-midnight-accent/50',
                                rowClassName && rowClassName(row, i),
                            )}
                        >
                            {hasSelection && (
                                <td className={cellPad} onClick={(e) => e.stopPropagation()} title={disabledReason}>
                                    <TerminalCheckbox
                                        checked={selected}
                                        disabled={!selectable}
                                        onChange={(e) => toggleRow(i, !!e.shiftKey)}
                                        aria-label={`Select ${labelOf(row, i)}`}
                                    />
                                </td>
                            )}
                            {columns.map((c) => {
                                const rendered = c.render ? c.render(row, i) : String((row as Record<string, unknown>)[c.key] ?? '—');
                                const isPlainText = typeof rendered === 'string' || typeof rendered === 'number';
                                const elide = c.truncate ?? truncate;
                                return (
                                    <td
                                        key={c.key}
                                        title={elide && isPlainText ? String(rendered) : undefined}
                                        className={cx(
                                            elide ? 'max-w-0 truncate' : 'whitespace-nowrap',
                                            cellPad,
                                            theme.default.text.secondary,
                                            alignClass(c),
                                            c.className,
                                        )}
                                    >
                                        {rendered}
                                    </td>
                                );
                            })}
                            {rowActions && (
                                <td className={cx('whitespace-nowrap', cellPad, 'text-right')} onClick={(e) => e.stopPropagation()}>
                                    {rowActions(row, i)}
                                </td>
                            )}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );

    const scrollProps = {
        style: maxHeight != null ? { maxHeight } : undefined,
        tabIndex: focusable ? 0 : undefined,
        role: focusable ? 'group' : undefined,
        'aria-busy': loading || undefined,
        'aria-activedescendant': focusable && focusedIndex !== null ? `${idBase}row-${focusedIndex}` : undefined,
        onKeyDown: handleKeyDown,
    };

    // No footer → the component IS the scrolling div, exactly as it was before
    // paging existed. Anything else would change the layout of every existing
    // consumer for a feature they don't use.
    if (!hasPaging) {
        return (
            <div
                {...scrollProps}
                className={cx('overflow-auto', focusable && 'focus:outline-none focus:ring-1 focus:ring-inset focus:ring-midnight-accent/50', className)}
            >
                {body}
            </div>
        );
    }

    return (
        <div className={cx('flex flex-col', className)}>
            <div
                {...scrollProps}
                className={cx('min-h-0 flex-1 overflow-auto', focusable && 'focus:outline-none focus:ring-1 focus:ring-inset focus:ring-midnight-accent/50')}
            >
                {body}
            </div>
            <PagingFooter
                page={page as number}
                pageSize={pageSize as number}
                total={total}
                hasMore={hasMore}
                rowCount={rows.length}
                onPageChange={onPageChange as (page: number) => void}
                pageSizeOptions={pageSizeOptions}
                onPageSizeChange={onPageSizeChange}
                className={footerClassName}
            />
        </div>
    );
}

export default TerminalTable;
