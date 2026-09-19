// TerminalTransferList.tsx — the classic two-pane "available → chosen"
// control, built on TerminalTable for the left (available) pane. Server
// paging and filtering of the available rows stay entirely with the
// consumer (passed straight through via `table`); this component only wires
// selection on that table to a host-held `chosen` list on the right.
//
// LAYOUT: the component is a FIXED-HEIGHT workbench (`height`, default
// 28rem). Both panes fill it and scroll inside themselves — the left under a
// sticky table header with the pager pinned to the pane's bottom edge, the
// right under a pinned count header and filter box. Nothing here ever grows
// the page, whether the chosen list holds three ids or fifty thousand.
// Boundaries come from the background ladder (base → surface → elevated), not
// from an outline around every box: each pane is one `surface` card with an
// `elevated` band for its header and pager, rows separated by a hairline.
//
// SELECTION ACROSS PAGES: the host owns `selectedKeys`, so a selection
// survives paging — but "add selected →" needs the ROW behind each key, and
// rows from other pages are not in memory. Every row this component renders
// while it is selected is cached (key → row); "add selected" reads that cache
// first, then `resolveRow`, and a key it still can't resolve STAYS SELECTED
// with a note saying so. It never silently drops a selection.
//
// The right pane is plain, host-held state (`chosen`/`onChosenChange`) with
// its own client-side filter box — no virtualisation dependency, just a
// render cap ("showing first 500 of N"). Rows are memoised on their own
// identity, so one toggle in a 5,000-row chosen list re-renders one row.
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../theme';
import { TerminalTable, TerminalTableProps } from './TerminalTable';
import { TerminalButton } from './TerminalButton';
import { TerminalInput } from './TerminalInput';
import { TerminalCheckbox } from './TerminalCheckbox';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface TerminalTransferListItem {
    key: string;
    label: ReactNode;
    /** Dimmed, secondary text; on one line with the label unless `twoLine`. */
    sublabel?: ReactNode;
    /** Right-aligned trailing text (a size, a count, a date). */
    meta?: ReactNode;
    /** What the chosen-pane filter matches on, when `label`/`sublabel` aren't plain strings. */
    text?: string;
}

/**
 * What `onAddAllMatching` may return:
 *  - items (sync or via a promise) → this component merges them into `chosen`;
 *  - nothing → the consumer updated `chosen` itself.
 * A rejected promise is caught and shown inline; it never escapes.
 */
export type TerminalTransferListAddAllResult =
    | TerminalTransferListItem[]
    | void
    | Promise<TerminalTransferListItem[] | void>;

export interface TerminalTransferListProps<T> {
    /** The consumer's own filter/search bar for the available rows, pinned to the top of the left pane. */
    filterBar?: ReactNode;
    /**
     * The available-items table config (everything TerminalTable needs except
     * selection, which this component owns, and the size props, which the
     * pane owns). `rows` is just the current page; paging and filtering stay
     * server-side, driven by the consumer through this same config.
     */
    table: Omit<
        TerminalTableProps<T>,
        'selectedKeys' | 'onSelectionChange' | 'isRowSelectable' | 'selectionDisabledReason' | 'rowKey' | 'maxHeight' | 'className'
    > & {
        rowKey: (row: T) => string;
    };
    /** Turns an available row into a chosen-list entry; the key is derived from `table.rowKey`. */
    toItem: (row: T) => Omit<TerminalTransferListItem, 'key'>;

    /** Selection over the available rows. Survives paging as long as the host keeps re-passing the same Set while swapping pages. */
    selectedKeys: Set<string> | string[];
    onSelectedKeysChange: (next: Set<string>) => void;
    /**
     * Last-resort resolver for a selected key whose row this component has
     * never rendered (selection restored from a URL, say). Rarely needed: rows
     * selected in this session are cached. A key that neither the cache nor
     * this resolves stays selected, with a note.
     */
    resolveRow?: (key: string) => T | undefined;

    /** The chosen list, held by the consumer. */
    chosen: TerminalTransferListItem[];
    onChosenChange: (next: TerminalTransferListItem[]) => void;

    /** Resolves everything matching the current (server-side) filter — the consumer's job. The button is hidden when this is omitted. */
    onAddAllMatching?: () => TerminalTransferListAddAllResult;

    /** The component's fixed height, side by side (any CSS length). Default `28rem`. Stacked, it becomes each pane's max height. */
    height?: number | string;
    /** Give each chosen row two lines (label over sublabel) instead of one. Default false. */
    twoLine?: boolean;

    chosenFilterPlaceholder?: string;
    /** How many (filtered) chosen rows to render before capping with a "showing first N of M" note. Default 500. */
    chosenRenderCap?: number;
    className?: string;
}

function toSet(keys: Set<string> | string[]): Set<string> {
    return keys instanceof Set ? keys : new Set(keys);
}

function textOf(node: ReactNode): string {
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    return '';
}

function filterTextOf(item: TerminalTransferListItem): string {
    if (item.text !== undefined) return item.text.toLowerCase();
    return `${textOf(item.label)} ${textOf(item.sublabel)}`.toLowerCase();
}

// ChosenRow is memoised on primitives + the item's own identity: toggling one
// row in a 5,000-row list re-renders that row alone. Class strings are passed
// in rather than read from the theme context here, so a provider re-render
// doesn't invalidate every row either.
interface ChosenRowProps {
    itemKey: string;
    label: ReactNode;
    sublabel?: ReactNode;
    meta?: ReactNode;
    ariaLabel: string;
    checked: boolean;
    twoLine: boolean;
    onToggle: (key: string) => void;
    rowClass: string;
    labelClass: string;
    subClass: string;
}

const ChosenRow = React.memo(function ChosenRow({
    itemKey, label, sublabel, meta, ariaLabel, checked, twoLine, onToggle, rowClass, labelClass, subClass,
}: ChosenRowProps) {
    return (
        <label className={rowClass}>
            <TerminalCheckbox
                checked={checked}
                onChange={() => onToggle(itemKey)}
                aria-label={ariaLabel}
            />
            {twoLine ? (
                <span className="min-w-0 flex-1">
                    <span className={cx('block truncate', labelClass)} title={textOf(label)}>{label}</span>
                    {sublabel !== undefined && (
                        <span className={cx('block truncate', subClass)} title={textOf(sublabel)}>{sublabel}</span>
                    )}
                </span>
            ) : (
                <span className="flex min-w-0 flex-1 items-baseline gap-2">
                    <span className={cx('shrink-0 truncate', labelClass)} title={textOf(label)}>{label}</span>
                    {sublabel !== undefined && (
                        <span className={cx('min-w-0 flex-1 truncate', subClass)} title={textOf(sublabel)}>{sublabel}</span>
                    )}
                </span>
            )}
            {meta !== undefined && <span className={cx('shrink-0 tabular-nums', subClass)}>{meta}</span>}
        </label>
    );
});

export function TerminalTransferList<T>({
    filterBar,
    table,
    toItem,
    selectedKeys,
    onSelectedKeysChange,
    resolveRow,
    chosen,
    onChosenChange,
    onAddAllMatching,
    height = '28rem',
    twoLine = false,
    chosenFilterPlaceholder = 'filter chosen',
    chosenRenderCap = 500,
    className = '',
}: TerminalTransferListProps<T>) {
    const theme = useTheme();
    const [chosenFilter, setChosenFilter] = useState('');
    const [chosenSelected, setChosenSelected] = useState<Set<string>>(new Set());
    const [addingAll, setAddingAll] = useState(false);
    const [note, setNote] = useState<string | null>(null);
    const [addError, setAddError] = useState<string | null>(null);

    const selectedSet = useMemo(() => toSet(selectedKeys), [selectedKeys]);
    const chosenKeySet = useMemo(() => new Set(chosen.map((c) => c.key)), [chosen]);

    const { rows, rowKey } = table;
    const rowsByKey = useMemo(() => {
        const map = new Map<string, T>();
        rows.forEach((r) => map.set(rowKey(r), r));
        return map;
    }, [rows, rowKey]);

    // Every row seen on screen while it was selected, kept so "add selected"
    // can reach rows that have since paged away. Bounded by the selection:
    // deselected keys are dropped on the next pass.
    const rowCache = useRef(new Map<string, T>());
    useEffect(() => {
        const cache = rowCache.current;
        rows.forEach((r) => {
            const k = rowKey(r);
            if (selectedSet.has(k)) cache.set(k, r);
        });
        cache.forEach((_v, k) => {
            if (!selectedSet.has(k)) cache.delete(k);
        });
    }, [rows, rowKey, selectedSet]);

    const busy = addingAll;

    const mergeItems = (additions: TerminalTransferListItem[]) => {
        if (additions.length === 0) return 0;
        const seen = new Set(chosenKeySet);
        const fresh: TerminalTransferListItem[] = [];
        additions.forEach((it) => {
            if (seen.has(it.key)) return; // de-duplicated by key, first occurrence wins
            seen.add(it.key);
            fresh.push(it);
        });
        if (fresh.length > 0) onChosenChange([...chosen, ...fresh]); // order stable: existing first, new in arrival order
        return fresh.length;
    };

    const addRowsToChosen = (toAdd: T[]) => mergeItems(toAdd.map((row) => ({ key: rowKey(row), ...toItem(row) })));

    const handleAddSelected = () => {
        const resolved: T[] = [];
        const unresolved: string[] = [];
        selectedSet.forEach((key) => {
            const row = rowsByKey.get(key) ?? rowCache.current.get(key) ?? resolveRow?.(key);
            if (row) resolved.push(row);
            else unresolved.push(key);
        });
        addRowsToChosen(resolved);
        setAddError(null);
        // Unresolvable keys stay selected — losing them silently is how a
        // "move 900 namespaces" ends up moving 850.
        onSelectedKeysChange(new Set(unresolved));
        setNote(unresolved.length > 0
            ? `${unresolved.length.toLocaleString()} selected ${unresolved.length === 1 ? 'row' : 'rows'} could not be added — they stay selected; page to them and try again`
            : null);
    };

    // Rows on this page that aren't in `chosen` already — both what "add page"
    // adds and what makes the button worth pressing.
    const addablePageRows = useMemo(() => rows.filter((r) => !chosenKeySet.has(rowKey(r))), [rows, rowKey, chosenKeySet]);

    const handleAddPage = () => {
        addRowsToChosen(addablePageRows);
        setNote(null);
        setAddError(null);
    };

    const handleAddAllMatching = async () => {
        if (!onAddAllMatching || busy) return;
        setAddingAll(true);
        setNote(null);
        setAddError(null);
        try {
            const result = await onAddAllMatching();
            if (Array.isArray(result)) {
                const added = mergeItems(result);
                setNote(`added ${added.toLocaleString()} of ${result.length.toLocaleString()} matching`);
            }
            // a void result means the consumer updated `chosen` itself
        } catch (e) {
            setAddError(e instanceof Error ? e.message : String(e));
        } finally {
            setAddingAll(false);
        }
    };

    const handleRemoveSelected = () => {
        if (chosenSelected.size === 0) return;
        onChosenChange(chosen.filter((c) => !chosenSelected.has(c.key)));
        setChosenSelected(new Set());
    };

    const handleClear = () => {
        onChosenChange([]);
        setChosenSelected(new Set());
        setNote(null);
        setAddError(null);
    };

    const filteredChosen = useMemo(() => {
        const q = chosenFilter.trim().toLowerCase();
        if (!q) return chosen;
        return chosen.filter((c) => filterTextOf(c).includes(q));
    }, [chosen, chosenFilter]);

    const visibleChosen = useMemo(() => filteredChosen.slice(0, chosenRenderCap), [filteredChosen, chosenRenderCap]);
    const truncated = filteredChosen.length > visibleChosen.length;

    const toggleChosenRow = useCallback((key: string) => {
        setChosenSelected((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    }, []);

    const isAvailableSelectable = useCallback((row: T) => !chosenKeySet.has(rowKey(row)), [chosenKeySet, rowKey]);
    const availableDisabledReason = useCallback(
        (row: T) => (chosenKeySet.has(rowKey(row)) ? 'already chosen' : undefined),
        [chosenKeySet, rowKey],
    );
    const hostRowClassName = table.rowClassName;
    const availableRowClassName = useCallback(
        (row: T, index: number) => cx(hostRowClassName?.(row, index), chosenKeySet.has(rowKey(row)) && 'opacity-40'),
        [hostRowClassName, chosenKeySet, rowKey],
    );
    const hostRowLabel = table.rowLabel;
    const availableRowLabel = useCallback(
        (row: T, index: number) => hostRowLabel?.(row, index) || textOf(toItem(row).label) || rowKey(row),
        [hostRowLabel, toItem, rowKey],
    );

    // Boundaries come from the background ladder, not outlines: `surface` for
    // a pane, `elevated` for its header/pager bands, one hairline per row.
    const pane = cx('flex min-h-0 flex-col border bg-midnight-surface max-h-[var(--tux-transfer-h)] md:max-h-none', theme.border);
    const band = cx('flex-none border-b bg-midnight-elevated/70', theme.border);
    const micro = cx('text-[10px] uppercase tracking-wider', theme.default.text.muted);

    const rowClass = cx(
        'flex cursor-pointer items-center gap-2 border-b px-2',
        twoLine ? 'py-1' : 'py-0.5',
        theme.border,
        'last:border-b-0',
        theme.hover,
    );
    const labelClass = cx('text-xs', theme.default.text.secondary);
    const subClass = cx('text-[10px]', theme.default.text.muted);

    // A CSS custom property, so the fixed height applies only side by side
    // (md+); stacked, the same value caps each pane instead.
    const heightVar = { '--tux-transfer-h': typeof height === 'number' ? `${height}px` : height } as unknown as React.CSSProperties;

    const selectedCount = selectedSet.size;
    const chosenSelectedCount = chosenSelected.size;

    const buttons = (
        <>
            <TerminalButton
                size="small"
                variant="secondary"
                disabled={selectedCount === 0 || busy}
                onClick={handleAddSelected}
                aria-label={`add ${selectedCount} selected to the chosen list`}
            >
                add selected &rarr;
            </TerminalButton>
            <TerminalButton
                size="small"
                variant="ghost"
                disabled={addablePageRows.length === 0 || busy}
                onClick={handleAddPage}
                aria-label={`add the ${addablePageRows.length} rows on this page to the chosen list`}
            >
                add page &rarr;
            </TerminalButton>
            {onAddAllMatching && (
                <TerminalButton
                    size="small"
                    variant="ghost"
                    disabled={busy}
                    onClick={handleAddAllMatching}
                    aria-label="add everything matching the current filter to the chosen list"
                >
                    {addingAll ? 'adding…' : 'add all matching →'}
                </TerminalButton>
            )}
            <TerminalButton
                size="small"
                variant="ghost"
                disabled={chosenSelectedCount === 0 || busy}
                onClick={handleRemoveSelected}
                aria-label={`remove ${chosenSelectedCount} checked from the chosen list`}
            >
                &larr; remove selected
            </TerminalButton>
            <TerminalButton
                size="small"
                variant="ghost"
                disabled={chosen.length === 0 || busy}
                onClick={handleClear}
                aria-label={`clear all ${chosen.length} chosen`}
            >
                &larr; clear
            </TerminalButton>
        </>
    );

    return (
        <div
            className={cx('flex flex-col gap-2 md:h-[var(--tux-transfer-h)]', className)}
            style={heightVar}
        >
            <div className="flex min-h-0 flex-1 flex-col gap-3 md:flex-row">
                {/* left: the available rows, the consumer's filter bar on top, the pager pinned to the bottom */}
                <section className={cx(pane, 'min-w-0 flex-1')} aria-label="available">
                    {filterBar && <div className={cx(band, 'px-2 py-1.5')}>{filterBar}</div>}
                    <TerminalTable<T>
                        {...table}
                        className="min-h-0 flex-1"
                        headerClassName="bg-midnight-elevated/70"
                        footerClassName="bg-midnight-elevated/70"
                        stickyHeader={table.stickyHeader ?? true}
                        truncate={table.truncate ?? true}
                        rowKey={(row) => rowKey(row)}
                        rowLabel={availableRowLabel}
                        rowClassName={availableRowClassName}
                        selectedKeys={selectedKeys}
                        onSelectionChange={onSelectedKeysChange}
                        isRowSelectable={isAvailableSelectable}
                        selectionDisabledReason={availableDisabledReason}
                    />
                </section>

                {/* middle: only as wide as its buttons, centred in the component's height */}
                <div className="flex shrink-0 flex-row flex-wrap items-center justify-center gap-2 md:w-auto md:flex-col md:items-stretch md:self-center">
                    {buttons}
                </div>

                {/* right: the chosen list, count header + filter pinned, rows scrolling under them */}
                <section className={cx(pane, 'md:w-2/5 md:min-w-[14rem]')} aria-label="chosen">
                    <div className={cx(band, 'flex h-8 items-center justify-between gap-2 px-2')}>
                        <span className={micro}>{chosen.length.toLocaleString()} chosen</span>
                        {filteredChosen.length !== chosen.length && (
                            <span className={micro}>{filteredChosen.length.toLocaleString()} shown</span>
                        )}
                    </div>
                    <div className={cx(band, 'px-2 py-1.5')}>
                        <TerminalInput
                            size="small"
                            placeholder={chosenFilterPlaceholder}
                            value={chosenFilter}
                            onChange={(e) => setChosenFilter(e.target.value)}
                        />
                    </div>
                    <div className="min-h-0 flex-1 overflow-auto">
                        {visibleChosen.length === 0 && (
                            <div className={cx('m-2 border border-dashed p-4 text-center text-[11px] italic', theme.border, theme.default.text.muted)}>
                                {chosen.length === 0 ? 'nothing chosen yet' : 'no matches'}
                            </div>
                        )}
                        {visibleChosen.map((item) => (
                            <ChosenRow
                                key={item.key}
                                itemKey={item.key}
                                label={item.label}
                                sublabel={item.sublabel}
                                meta={item.meta}
                                ariaLabel={`Select ${item.text || textOf(item.label) || item.key}`}
                                checked={chosenSelected.has(item.key)}
                                twoLine={twoLine}
                                onToggle={toggleChosenRow}
                                rowClass={rowClass}
                                labelClass={labelClass}
                                subClass={subClass}
                            />
                        ))}
                    </div>
                    {truncated && (
                        <div className={cx('flex-none border-t bg-midnight-elevated/70 px-2 py-1 text-[11px]', theme.border, theme.default.text.muted)}>
                            showing first {visibleChosen.length.toLocaleString()} of {filteredChosen.length.toLocaleString()} — filter to narrow
                        </div>
                    )}
                </section>
            </div>

            {(addError || note) && (
                <div
                    role="status"
                    aria-live="polite"
                    className={cx(
                        'flex-none border px-2 py-1 text-[11px]',
                        addError
                            ? 'border-midnight-danger/50 bg-midnight-danger/10 text-midnight-danger-bright'
                            : cx('bg-midnight-elevated', theme.border, theme.default.text.muted),
                    )}
                >
                    {addError ?? note}
                </div>
            )}
        </div>
    );
}

export default TerminalTransferList;
