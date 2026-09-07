// TerminalPagedList.tsx — a SERVER-PAGED list behind a search box: the shape
// every "there may be millions of these" surface takes (namespaces, sessions,
// audit rows). The host owns the fetch; this owns the chrome — the search
// input, the rows, the "more" button, the empty state, and the page-cap
// notice ("showing the first 1,000 — refine the search") a capped server
// returns instead of an endless scroll.
//
// `usePagedList` is the matching hook: reset on key change, append on more,
// stop at the server's cap. Use them together or bring your own page state.
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { useTheme } from '../theme';
import { TerminalInput } from './TerminalInput';
import { TerminalButton } from './TerminalButton';

export interface PagedResult<T> {
    items: T[];
    /** The server's hard cap on offset + limit; the list stops there. */
    pageCap?: number;
}

export interface PagedListState<T> {
    rows: T[];
    /** No further page: the last page was short, or the cap was reached. */
    done: boolean;
    busy: boolean;
    /** Rows stopped at the server's cap — invite the user to refine. */
    capped: boolean;
    more: () => void;
    reload: () => void;
}

/**
 * usePagedList — one server-paged list. `fetchPage(limit, offset)` is the
 * host's call; `key` resets the list (a new search term, a new parent id).
 */
export function usePagedList<T>(
    fetchPage: (limit: number, offset: number) => Promise<PagedResult<T>>,
    key: unknown,
    pageSize = 50,
): PagedListState<T> {
    const [rows, setRows] = useState<T[]>([]);
    const [done, setDone] = useState(false);
    const [capped, setCapped] = useState(false);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async (offset: number, replace: boolean) => {
        setBusy(true);
        try {
            const out = await fetchPage(pageSize, offset);
            const page = out.items || [];
            const cap = out.pageCap ?? Infinity;
            const atCap = offset + page.length >= cap;
            setRows((r) => (replace ? page : [...r, ...page]));
            setDone(page.length < pageSize || atCap);
            setCapped(atCap && page.length >= pageSize);
        } catch {
            setDone(true);
        }
        setBusy(false);
    }, [fetchPage, pageSize]);

    useEffect(() => {
        setRows([]);
        setDone(false);
        setCapped(false);
        load(0, true);
    }, [key, load]);

    return {
        rows, done, busy, capped,
        more: () => load(rows.length, false),
        reload: () => load(0, true),
    };
}

export interface TerminalPagedListProps<T> {
    page: PagedListState<T>;
    renderRow: (row: T, index: number) => ReactNode;
    rowKey: (row: T, index: number) => React.Key;
    /** Search box; omit for a list with no search. */
    search?: {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
        /** Rendered to the right of the box (a "new" button, a filter). */
        trailing?: ReactNode;
    };
    /** A line above the search box (a count, a hint). */
    header?: ReactNode;
    /** Shown when there are no rows; a function receives whether a search is active. */
    empty?: ReactNode | ((searching: boolean) => ReactNode);
    /** The cap notice; receives the row count reached. */
    capNotice?: (count: number) => ReactNode;
    moreLabel?: string;
    className?: string;
}

export function TerminalPagedList<T>({
    page,
    renderRow,
    rowKey,
    search,
    header,
    empty = 'nothing here',
    capNotice = (n) => `showing the first ${n.toLocaleString()} — refine the search`,
    moreLabel = 'more',
    className = '',
}: TerminalPagedListProps<T>) {
    const theme = useTheme();
    const muted = `text-[11px] leading-relaxed ${theme.default.text.muted}`;
    const searching = !!(search && search.value);
    const emptyNode = typeof empty === 'function' ? empty(searching) : empty;

    return (
        <div className={`flex h-full min-h-0 flex-col ${className}`}>
            {header && <div className={`px-3 py-2 ${muted}`}>{header}</div>}
            {search && (
                <div className="flex items-center gap-2 px-3 pb-2">
                    <TerminalInput
                        size="small"
                        placeholder={search.placeholder || 'search'}
                        value={search.value}
                        onChange={(e) => search.onChange(e.target.value)}
                        className="flex-1"
                    />
                    {search.trailing}
                </div>
            )}
            <div className="min-h-0 flex-1 overflow-auto">
                {page.rows.length === 0 ? (
                    <div className={`m-3 border border-dashed ${theme.border} p-4 text-center text-[11px] italic ${theme.default.text.muted}`}>
                        {page.busy ? 'loading…' : emptyNode}
                    </div>
                ) : (
                    page.rows.map((row, i) => <React.Fragment key={rowKey(row, i)}>{renderRow(row, i)}</React.Fragment>)
                )}
                {page.capped && <div className={`px-3 py-2 ${muted}`}>{capNotice(page.rows.length)}</div>}
                {!page.done && (
                    <div className="px-3 py-2">
                        <TerminalButton size="small" variant="ghost" disabled={page.busy} onClick={page.more}>
                            {page.busy ? 'loading…' : moreLabel}
                        </TerminalButton>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TerminalPagedList;
