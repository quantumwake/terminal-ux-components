import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { TerminalTable, TerminalTableColumn } from './TerminalTable';

interface Row {
    id: string;
    name: string;
}

const columns: TerminalTableColumn<Row>[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
];

const rowKey = (r: Row) => r.id;

const page1: Row[] = [{ id: '1', name: 'alpha' }, { id: '2', name: 'bravo' }, { id: '3', name: 'charlie' }];
const page2: Row[] = [{ id: '4', name: 'delta' }, { id: '5', name: 'echo' }];

// A small controlled harness: the table never owns selection or paging, so
// tests exercise it the way a real host would — state lives here, and every
// callback re-renders with the updated props.
function Harness({
    initialSelected = new Set<string>(),
    initialPage = 0,
    total,
    hasMore,
    onPageChangeSpy,
}: {
    initialSelected?: Set<string>;
    initialPage?: number;
    total?: number;
    hasMore?: boolean;
    onPageChangeSpy?: (page: number) => void;
}) {
    const [selected, setSelected] = useState(initialSelected);
    const [page, setPage] = useState(initialPage);
    const rows = page === 0 ? page1 : page2;

    return (
        <TerminalTable
            columns={columns}
            rows={rows}
            rowKey={rowKey}
            selectedKeys={selected}
            onSelectionChange={setSelected}
            page={page}
            pageSize={3}
            total={total}
            hasMore={hasMore}
            onPageChange={(p) => {
                setPage(p);
                onPageChangeSpy?.(p);
            }}
        />
    );
}

describe('TerminalTable — selection', () => {
    it('keeps selected keys across a page change', () => {
        render(<Harness initialSelected={new Set(['2'])} total={5} />);

        // row 2 (bravo) starts checked
        const checkboxes = screen.getAllByRole('checkbox');
        // index 0 = header, 1..3 = rows on page 1
        expect(checkboxes[2]).toHaveAttribute('aria-checked', 'true');

        // move to page 2 via the Next button
        fireEvent.click(screen.getByTitle('Next page'));
        expect(screen.getByText('delta')).toBeInTheDocument();

        // selection (key "2") isn't on this page, but is preserved in state —
        // going back should show it checked again.
        fireEvent.click(screen.getByTitle('Previous page'));
        const afterReturn = screen.getAllByRole('checkbox');
        expect(afterReturn[2]).toHaveAttribute('aria-checked', 'true');
    });

    it('header checkbox is tri-state: unchecked, mixed, then checked', () => {
        render(<Harness />);
        const header = screen.getByRole('checkbox', { name: 'Select all rows on this page' });
        expect(header).toHaveAttribute('aria-checked', 'false');

        const rowCheckboxes = screen.getAllByRole('checkbox').slice(1);
        fireEvent.click(rowCheckboxes[0]);
        expect(screen.getByRole('checkbox', { name: 'Select all rows on this page' })).toHaveAttribute('aria-checked', 'mixed');

        fireEvent.click(screen.getAllByRole('checkbox').slice(1)[1]);
        fireEvent.click(screen.getAllByRole('checkbox').slice(1)[2]);
        expect(screen.getByRole('checkbox', { name: 'Select all rows on this page' })).toHaveAttribute('aria-checked', 'true');
    });

    it('header checkbox selects/deselects every row on the current page only', () => {
        const onSelectionChange = vi.fn();
        render(
            <TerminalTable
                columns={columns}
                rows={page1}
                rowKey={rowKey}
                selectedKeys={new Set()}
                onSelectionChange={onSelectionChange}
            />,
        );
        fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
        expect(onSelectionChange).toHaveBeenCalledWith(new Set(['1', '2', '3']));
    });

    it('shift-clicking a row checkbox selects the range within the page', () => {
        const onSelectionChange = vi.fn();
        render(
            <TerminalTable
                columns={columns}
                rows={page1}
                rowKey={rowKey}
                selectedKeys={new Set()}
                onSelectionChange={onSelectionChange}
            />,
        );
        const rowCheckboxes = screen.getAllByRole('checkbox').slice(1);
        fireEvent.click(rowCheckboxes[0]); // anchor at row 0
        // onSelectionChange fired with {1}; simulate the host committing it by
        // re-rendering isn't needed for the anchor to be remembered internally.
        fireEvent.click(rowCheckboxes[2], { shiftKey: true });
        const lastCall = onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1][0] as Set<string>;
        expect([...lastCall].sort()).toEqual(['1', '2', '3']);
    });

    it('a row that fails isRowSelectable cannot be toggled and shows the disabled reason', () => {
        const onSelectionChange = vi.fn();
        render(
            <TerminalTable
                columns={columns}
                rows={page1}
                rowKey={rowKey}
                selectedKeys={new Set()}
                onSelectionChange={onSelectionChange}
                isRowSelectable={(r) => r.id !== '2'}
                selectionDisabledReason={(r) => (r.id === '2' ? 'locked' : undefined)}
            />,
        );
        const rowCheckboxes = screen.getAllByRole('checkbox').slice(1);
        expect(rowCheckboxes[1]).toBeDisabled();
        fireEvent.click(rowCheckboxes[1]);
        expect(onSelectionChange).not.toHaveBeenCalled();
        expect(screen.getByTitle('locked')).toBeInTheDocument();
    });
});

describe('TerminalTable — paging', () => {
    it('shows "N–M of TOTAL" and hides Last when total is known', () => {
        render(<Harness total={5} />);
        expect(screen.getByText('1–3 of 5')).toBeInTheDocument();
        expect(screen.getByTitle('Last page')).toBeInTheDocument();
    });

    it('shows "N–M" with no total and enables Next while hasMore, hiding Last', () => {
        render(<Harness hasMore />);
        expect(screen.getByText('1–3')).toBeInTheDocument();
        expect(screen.queryByText(/of/)).not.toBeInTheDocument();
        expect(screen.queryByTitle('Last page')).not.toBeInTheDocument();
        expect(screen.getByTitle('Next page')).toBeEnabled();
    });

    it('disables Next when hasMore is false and total is unknown', () => {
        render(<Harness hasMore={false} />);
        expect(screen.getByTitle('Next page')).toBeDisabled();
    });

    it('PageDown/PageUp on the table change the page', () => {
        const onPageChangeSpy = vi.fn();
        render(<Harness total={5} onPageChangeSpy={onPageChangeSpy} />);
        const table = screen.getByRole('group');
        fireEvent.keyDown(table, { key: 'PageDown' });
        expect(onPageChangeSpy).toHaveBeenCalledWith(1);
        fireEvent.keyDown(table, { key: 'PageUp' });
        expect(onPageChangeSpy).toHaveBeenCalledWith(0);
    });
});

describe('TerminalTable — states', () => {
    it('renders the error message with a retry button', () => {
        const onRetry = vi.fn();
        render(
            <TerminalTable columns={columns} rows={[]} rowKey={rowKey} error="fetch failed" onRetry={onRetry} />,
        );
        expect(screen.getByText('fetch failed')).toBeInTheDocument();
        fireEvent.click(screen.getByText('retry'));
        expect(onRetry).toHaveBeenCalled();
    });

    it('dims the body while loading without dropping the previous rows', () => {
        const { container } = render(
            <TerminalTable columns={columns} rows={page1} rowKey={rowKey} loading />,
        );
        expect(screen.getByText('alpha')).toBeInTheDocument();
        expect(container.querySelector('tbody')).toHaveClass('opacity-50');
    });

    it('renders a custom empty node when there are no rows', () => {
        render(<TerminalTable columns={columns} rows={[]} rowKey={rowKey} empty={<span>nothing here</span>} />);
        expect(screen.getByText('nothing here')).toBeInTheDocument();
    });
});

const lastSelection = (spy: { mock: { calls: unknown[][] } }) => spy.mock.calls[spy.mock.calls.length - 1][0] as Set<string>;

// ── back-compat ────────────────────────────────────────────────────────────
// Every prop that existed on v0.3.12 must behave exactly as it did when none
// of the new props are passed. Consumers (statefs ui/user-ui) render the old
// shape today, so this pins the DOM it produced: one scrolling <div>, no tab
// stop, no checkbox column, no footer, cells that keep their full width and
// scroll rather than eliding.
describe('TerminalTable — back-compat with the pre-selection table', () => {
    const classesOf = (el: Element) => [...el.classList].sort();

    it('renders the historical DOM for the historical props', () => {
        const onRowClick = vi.fn();
        const { container } = render(
            <TerminalTable
                className="border border-midnight-border"
                columns={[{ key: 'id', label: 'ID' }, { key: 'name', align: 'right', className: 'text-midnight-accent' }]}
                rows={page1}
                rowKey={rowKey}
                empty="no nodes"
                stickyHeader
                maxHeight={224}
                onRowClick={onRowClick}
            />,
        );

        // the component IS the scrolling div — no wrapper, no tab stop, no role
        const root = container.firstElementChild as HTMLElement;
        expect(root.tagName).toBe('DIV');
        expect(classesOf(root)).toEqual(['border', 'border-midnight-border', 'overflow-auto'].sort());
        expect(root).not.toHaveAttribute('tabindex');
        expect(root).not.toHaveAttribute('role');
        expect(root).not.toHaveAttribute('aria-busy');
        expect(root.style.maxHeight).toBe('224px');

        // no selection column and no pager
        expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
        expect(screen.queryByTitle('Next page')).not.toBeInTheDocument();

        expect(classesOf(container.querySelector('thead')!)).toEqual(['bg-midnight-surface', 'sticky', 'top-0', 'z-10'].sort());
        expect(classesOf(container.querySelector('th')!)).toEqual(
            ['whitespace-nowrap', 'px-2', 'py-1.5', 'text-[10px]', 'font-normal', 'uppercase', 'tracking-wider', 'text-midnight-text-subdued', 'text-left'].sort(),
        );

        const tr = container.querySelector('tbody tr')!;
        expect(classesOf(tr)).toEqual(
            ['border-t', 'border-midnight-border', 'cursor-pointer', 'hover:bg-midnight-elevated', 'hover:text-midnight-text-primary'].sort(),
        );

        const tds = tr.querySelectorAll('td');
        expect(classesOf(tds[0])).toEqual(['whitespace-nowrap', 'px-2', 'py-1', 'text-midnight-text-secondary', 'text-left'].sort());
        expect(tds[0]).not.toHaveAttribute('title'); // cells only elide when `truncate` asks
        expect(classesOf(tds[1])).toEqual(['whitespace-nowrap', 'px-2', 'py-1', 'text-midnight-text-secondary', 'text-right', 'text-midnight-accent'].sort());

        fireEvent.click(tr);
        expect(onRowClick).toHaveBeenCalledWith(page1[0], 0);
    });

    it('defaults rowKey to the index and renders header/empty exactly as before', () => {
        const { container } = render(<TerminalTable columns={columns} rows={[]} />);
        const td = container.querySelector('tbody td')!;
        expect(classesOf(td)).toEqual(['px-2', 'py-2', 'italic', 'text-midnight-text-subdued'].sort());
        expect(td).toHaveTextContent('no rows');
        expect(td).toHaveAttribute('colspan', '2');
    });

    it('opts into eliding only when asked', () => {
        const { container } = render(<TerminalTable columns={columns} rows={page1} rowKey={rowKey} truncate />);
        const td = container.querySelector('tbody td')!;
        expect(classesOf(td)).toEqual(['max-w-0', 'truncate', 'px-2', 'py-1', 'text-midnight-text-secondary', 'text-left'].sort());
        expect(td).toHaveAttribute('title', '1');
    });
});

// ── selection edge cases ───────────────────────────────────────────────────
describe('TerminalTable — selection edge cases', () => {
    it('a shift range skips rows that are not selectable', () => {
        const onSelectionChange = vi.fn();
        render(
            <TerminalTable
                columns={columns}
                rows={page1}
                rowKey={rowKey}
                selectedKeys={new Set()}
                onSelectionChange={onSelectionChange}
                isRowSelectable={(r) => r.id !== '2'}
            />,
        );
        const boxes = screen.getAllByRole('checkbox').slice(1);
        fireEvent.click(boxes[0]);
        fireEvent.click(boxes[2], { shiftKey: true });
        const calls = onSelectionChange.mock.calls;
        const last = calls[calls.length - 1][0] as Set<string>;
        expect([...last].sort()).toEqual(['1', '3']); // "2" is locked and stays out
    });

    it('does not carry the shift anchor across a page change', () => {
        const onSelectionChange = vi.fn();
        const { rerender } = render(
            <TerminalTable columns={columns} rows={page1} rowKey={rowKey} selectedKeys={new Set()} onSelectionChange={onSelectionChange} />,
        );
        fireEvent.click(screen.getAllByRole('checkbox')[1]); // anchor on page 1, row 0

        rerender(<TerminalTable columns={columns} rows={page2} rowKey={rowKey} selectedKeys={new Set()} onSelectionChange={onSelectionChange} />);
        fireEvent.click(screen.getAllByRole('checkbox')[2], { shiftKey: true }); // page 2, row 1

        const calls = onSelectionChange.mock.calls;
        const last = calls[calls.length - 1][0] as Set<string>;
        expect([...last]).toEqual(['5']); // just the clicked row, not a range from a page that is gone
    });

    it('labels each row checkbox with the row it selects', () => {
        render(
            <TerminalTable columns={columns} rows={page1} rowKey={rowKey} selectedKeys={new Set()} onSelectionChange={vi.fn()} />,
        );
        expect(screen.getByRole('checkbox', { name: 'Select 1' })).toBeInTheDocument();
    });

    it('rowLabel overrides the derived checkbox label', () => {
        render(
            <TerminalTable
                columns={columns}
                rows={page1}
                rowKey={rowKey}
                rowLabel={(r) => r.name}
                selectedKeys={new Set()}
                onSelectionChange={vi.fn()}
            />,
        );
        expect(screen.getByRole('checkbox', { name: 'Select alpha' })).toBeInTheDocument();
    });

    it('the header checkbox counts only selectable rows on the page', () => {
        render(
            <TerminalTable
                columns={columns}
                rows={page1}
                rowKey={rowKey}
                selectedKeys={new Set(['1', '3'])}
                onSelectionChange={vi.fn()}
                isRowSelectable={(r) => r.id !== '2'}
            />,
        );
        // 1 and 3 are the only selectable rows and both are selected → fully checked
        expect(screen.getByRole('checkbox', { name: 'Select all rows on this page' })).toHaveAttribute('aria-checked', 'true');
    });
});

// ── keyboard ───────────────────────────────────────────────────────────────
describe('TerminalTable — keyboard', () => {
    const renderKeyboard = (onSelectionChange = vi.fn()) => {
        render(
            <TerminalTable columns={columns} rows={page1} rowKey={rowKey} selectedKeys={new Set()} onSelectionChange={onSelectionChange} />,
        );
        return { table: screen.getByRole('group'), onSelectionChange };
    };

    it('is a single tab stop', () => {
        const { table } = renderKeyboard();
        expect(table).toHaveAttribute('tabindex', '0');
        expect(screen.getAllByRole('row').every((r) => !r.hasAttribute('tabindex'))).toBe(true);
    });

    it('Space toggles the focused row; Arrow/Home/End move the roving focus', () => {
        const { table, onSelectionChange } = renderKeyboard();
        fireEvent.keyDown(table, { key: 'ArrowDown' }); // row 0
        fireEvent.keyDown(table, { key: 'ArrowDown' }); // row 1
        fireEvent.keyDown(table, { key: ' ' });
        expect(onSelectionChange).toHaveBeenCalledWith(new Set(['2']));

        fireEvent.keyDown(table, { key: 'End' });
        fireEvent.keyDown(table, { key: ' ' });
        expect(lastSelection(onSelectionChange)).toEqual(new Set(['3']));

        fireEvent.keyDown(table, { key: 'Home' });
        fireEvent.keyDown(table, { key: ' ' });
        expect(lastSelection(onSelectionChange)).toEqual(new Set(['1']));
    });

    it('points aria-activedescendant at the focused row', () => {
        const { table } = renderKeyboard();
        expect(table).not.toHaveAttribute('aria-activedescendant');
        fireEvent.keyDown(table, { key: 'ArrowDown' });
        const active = table.getAttribute('aria-activedescendant')!;
        expect(document.getElementById(active)).toBe(screen.getAllByRole('row')[1]); // [0] is the header row
    });

    it('keeps the focus on a real row when the page shrinks under it', () => {
        const { rerender } = render(
            <TerminalTable columns={columns} rows={page1} rowKey={rowKey} selectedKeys={new Set()} onSelectionChange={vi.fn()} />,
        );
        const table = screen.getByRole('group');
        fireEvent.keyDown(table, { key: 'End' }); // row 2 of 3
        rerender(<TerminalTable columns={columns} rows={page1.slice(0, 2)} rowKey={rowKey} selectedKeys={new Set()} onSelectionChange={vi.fn()} />);
        const active = table.getAttribute('aria-activedescendant')!;
        expect(document.getElementById(active)).toBe(screen.getAllByRole('row')[2]); // the new last row, not a hole
    });

    it('PageDown stops at the end when total is unknown and hasMore is false', () => {
        const onPageChange = vi.fn();
        render(
            <TerminalTable columns={columns} rows={page1} rowKey={rowKey} page={0} pageSize={3} hasMore={false} onPageChange={onPageChange} />,
        );
        fireEvent.keyDown(screen.getByRole('group'), { key: 'PageDown' });
        expect(onPageChange).not.toHaveBeenCalled();
    });

    it('PageDown advances when total is unknown but hasMore is true', () => {
        const onPageChange = vi.fn();
        render(
            <TerminalTable columns={columns} rows={page1} rowKey={rowKey} page={0} pageSize={3} hasMore onPageChange={onPageChange} />,
        );
        fireEvent.keyDown(screen.getByRole('group'), { key: 'PageDown' });
        expect(onPageChange).toHaveBeenCalledWith(1);
    });
});

// ── controlled paging edge cases ───────────────────────────────────────────
describe('TerminalTable — paging edge cases', () => {
    const paged = (props: Partial<React.ComponentProps<typeof TerminalTable<Row>>>) => (
        <TerminalTable columns={columns} rows={page1} rowKey={rowKey} page={0} pageSize={3} onPageChange={vi.fn()} {...props} />
    );

    it('asks for the last valid page exactly once when total shrinks under the current page', () => {
        const onPageChange = vi.fn();
        const { rerender } = render(paged({ page: 5, total: 100, onPageChange }));
        expect(onPageChange).not.toHaveBeenCalled();

        // the filter narrowed: 12 rows → pages 0..3, and we are on page 5
        rerender(paged({ page: 5, total: 12, onPageChange }));
        expect(onPageChange).toHaveBeenCalledTimes(1);
        expect(onPageChange).toHaveBeenCalledWith(3);

        // a host that ignores it must not be asked again in a loop
        rerender(paged({ page: 5, total: 12, onPageChange }));
        rerender(paged({ page: 5, total: 12, onPageChange }));
        expect(onPageChange).toHaveBeenCalledTimes(1);
    });

    it('keeps the first visible row in view when the page size changes', () => {
        const onPageChange = vi.fn();
        const onPageSizeChange = vi.fn();
        render(paged({ page: 4, pageSize: 25, total: 1000, onPageChange, onPageSizeChange, pageSizeOptions: [25, 50, 100] }));
        // row 100 is the first on screen; at 50/page that is page 2
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '50' } });
        expect(onPageSizeChange).toHaveBeenCalledWith(50);
        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('leaves the page alone when the first visible row stays on it', () => {
        const onPageChange = vi.fn();
        render(paged({ page: 0, pageSize: 25, total: 1000, onPageChange, onPageSizeChange: vi.fn(), pageSizeOptions: [25, 50] }));
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '50' } });
        expect(onPageChange).not.toHaveBeenCalled();
    });
});
