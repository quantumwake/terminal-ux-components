// TerminalTable.tsx — the compact INLINE data table: a dense, theme-styled
// table for dashboards, drawers, and status panels (members, nodes, query
// results). Unlike TerminalDataTable2 (the modal result browser with search/
// pagination/JSON trees), this renders in place with zero chrome.
//
// Every cell carries its own padding and stays on one line — the two defects
// dense hand-rolled tables reliably develop (naked <th>s colliding, ids
// wrapping mid-name). Wide tables scroll inside the component's own frame.
import React, { ReactNode } from 'react';
import { useTheme } from '../theme';

export interface TerminalTableColumn<T> {
    key: string;
    /** Header text; defaults to `key`, '' for an action column. */
    label?: string;
    align?: 'left' | 'right';
    /** Cell renderer; defaults to String(row[key] ?? '—'). */
    render?: (row: T, index: number) => ReactNode;
    /** Extra classes on every body cell (e.g. a color token). */
    className?: string;
    headerClassName?: string;
}

export interface TerminalTableProps<T> {
    columns: TerminalTableColumn<T>[];
    rows: T[];
    /** Stable row identity; defaults to the row index. */
    rowKey?: (row: T, index: number) => React.Key;
    /** Rendered as a full-width row when `rows` is empty. */
    empty?: ReactNode;
    /** Keep the header visible while the body scrolls. */
    stickyHeader?: boolean;
    /** Scroll the table past this height (px or any CSS length). */
    maxHeight?: number | string;
    onRowClick?: (row: T, index: number) => void;
    className?: string;
}

export function TerminalTable<T>({
    columns,
    rows,
    rowKey,
    empty = 'no rows',
    stickyHeader = false,
    maxHeight,
    onRowClick,
    className = '',
}: TerminalTableProps<T>) {
    const theme = useTheme();
    const alignClass = (c: TerminalTableColumn<T>) => (c.align === 'right' ? 'text-right' : 'text-left');

    return (
        <div className={`overflow-auto ${className}`} style={maxHeight != null ? { maxHeight } : undefined}>
            <table className="w-full font-mono text-xs">
                <thead className={`${theme.bgSecondary} ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
                    <tr>
                        {columns.map((c) => (
                            <th
                                key={c.key}
                                className={`whitespace-nowrap px-2 py-1.5 text-[10px] font-normal uppercase tracking-wider ${theme.default.text.muted} ${alignClass(c)} ${c.headerClassName || ''}`}
                            >
                                {c.label ?? c.key}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className={`px-2 py-2 italic ${theme.default.text.muted}`}>{empty}</td>
                        </tr>
                    )}
                    {rows.map((row, i) => (
                        <tr
                            key={rowKey ? rowKey(row, i) : i}
                            onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                            className={`border-t ${theme.border} ${onRowClick ? `cursor-pointer ${theme.hover}` : ''}`}
                        >
                            {columns.map((c) => (
                                <td
                                    key={c.key}
                                    className={`whitespace-nowrap px-2 py-1 ${theme.default.text.secondary} ${alignClass(c)} ${c.className || ''}`}
                                >
                                    {c.render ? c.render(row, i) : String((row as Record<string, unknown>)[c.key] ?? '—')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TerminalTable;
