import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { TerminalTransferList, TerminalTransferListItem } from './TerminalTransferList';
import { TerminalTableColumn } from './TerminalTable';

interface Row {
    id: string;
    name: string;
}

const columns: TerminalTableColumn<Row>[] = [{ key: 'name', label: 'Name' }];
const rowKey = (r: Row) => r.id;
const toItem = (r: Row) => ({ label: r.name });

const allRows: Row[] = [
    { id: '1', name: 'alpha' },
    { id: '2', name: 'bravo' },
    { id: '3', name: 'charlie' },
];

// Controlled harness mirroring how a real host wires the component: selection
// and chosen list both live outside, updated only through the callbacks.
function Harness({
    onAddAllMatching,
    initialChosen = [],
}: {
    onAddAllMatching?: () => Promise<TerminalTransferListItem[]>;
    initialChosen?: TerminalTransferListItem[];
}) {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [chosen, setChosen] = useState<TerminalTransferListItem[]>(initialChosen);

    return (
        <TerminalTransferList<Row>
            table={{ columns, rows: allRows, rowKey }}
            toItem={toItem}
            selectedKeys={selected}
            onSelectedKeysChange={setSelected}
            chosen={chosen}
            onChosenChange={setChosen}
            onAddAllMatching={onAddAllMatching}
        />
    );
}

describe('TerminalTransferList', () => {
    it('adds the selected available rows to chosen and clears the selection', () => {
        render(<Harness />);
        const rowCheckboxes = screen.getAllByRole('checkbox');
        fireEvent.click(rowCheckboxes[1]); // alpha
        fireEvent.click(rowCheckboxes[3]); // charlie

        fireEvent.click(screen.getByText('add selected →'));

        expect(screen.getByText('2 chosen')).toBeInTheDocument();
        // "alpha"/"charlie" also appear as available rows on the left; the
        // chosen-list entry is the one inside a checkbox <label>.
        expect(screen.getAllByText('alpha').some((el) => el.closest('label'))).toBe(true);
        expect(screen.getAllByText('charlie').some((el) => el.closest('label'))).toBe(true);
    });

    it('"add page" adds every row currently rendered by the table', () => {
        render(<Harness />);
        fireEvent.click(screen.getByText('add page →'));
        expect(screen.getByText('3 chosen')).toBeInTheDocument();
    });

    it('a chosen row is dimmed and not selectable in the left table', () => {
        render(<Harness initialChosen={[{ key: '2', label: 'bravo' }]} />);
        const rowCheckboxes = screen.getAllByRole('checkbox').slice(1); // drop header
        // alpha(0), bravo(1), charlie(2) — bravo is already chosen
        expect(rowCheckboxes[1]).toBeDisabled();
        expect(rowCheckboxes[0]).not.toBeDisabled();
    });

    it('hides "add all matching" when the prop is absent, and shows a busy state while it resolves', async () => {
        const { rerender } = render(<Harness />);
        expect(screen.queryByText(/add all matching/)).not.toBeInTheDocument();

        let resolveFn!: (items: TerminalTransferListItem[]) => void;
        const onAddAllMatching = vi.fn(() => new Promise<TerminalTransferListItem[]>((res) => { resolveFn = res; }));
        rerender(<Harness onAddAllMatching={onAddAllMatching} />);

        fireEvent.click(screen.getByText(/add all matching/));
        expect(onAddAllMatching).toHaveBeenCalled();
        expect(screen.getByText('adding…')).toBeInTheDocument();

        resolveFn([{ key: '9', label: 'zulu' }]);
        await waitFor(() => expect(screen.getByText('1 chosen')).toBeInTheDocument());
        expect(screen.getByText('zulu')).toBeInTheDocument();
    });

    it('removes only the checked chosen rows via "remove selected"', () => {
        render(<Harness initialChosen={[{ key: '1', label: 'alpha' }, { key: '2', label: 'bravo' }]} />);
        const alphaRow = screen.getAllByText('alpha').find((el) => el.closest('label'))!.closest('label') as HTMLElement;
        fireEvent.click(alphaRow.querySelector('[role="checkbox"]') as HTMLElement);

        fireEvent.click(screen.getByText('← remove selected'));

        expect(screen.getAllByText('alpha').some((el) => el.closest('label'))).toBe(false);
        expect(screen.getAllByText('bravo').some((el) => el.closest('label'))).toBe(true);
        expect(screen.getByText('1 chosen')).toBeInTheDocument();
    });

    it('"clear" empties the whole chosen list', () => {
        render(<Harness initialChosen={[{ key: '1', label: 'alpha' }, { key: '2', label: 'bravo' }]} />);
        fireEvent.click(screen.getByText('← clear'));
        expect(screen.getByText('0 chosen')).toBeInTheDocument();
        expect(screen.getByText('nothing chosen yet')).toBeInTheDocument();
    });

    it('does not add duplicate keys already in chosen', () => {
        render(<Harness initialChosen={[{ key: '1', label: 'alpha' }]} />);
        fireEvent.click(screen.getByText('add page →'));
        expect(screen.getByText('3 chosen')).toBeInTheDocument(); // alpha stays once, bravo+charlie added
    });
});

// ── selection across pages ─────────────────────────────────────────────────
// The rows of an earlier page are not in memory when "add selected" runs, so
// the component caches every row it renders while that row is selected. This
// is the case the OPERATOR console lives on: tens of thousands of namespaces,
// a few picked per page.
const pageA: Row[] = [{ id: '1', name: 'alpha' }, { id: '2', name: 'bravo' }];
const pageB: Row[] = [{ id: '3', name: 'charlie' }, { id: '4', name: 'delta' }];

function PagedHarness({ initialSelected = new Set<string>() }: { initialSelected?: Set<string> }) {
    const [selected, setSelected] = useState<Set<string>>(initialSelected);
    const [chosen, setChosen] = useState<TerminalTransferListItem[]>([]);
    const [page, setPage] = useState(0);

    return (
        <TerminalTransferList<Row>
            table={{ columns, rows: page === 0 ? pageA : pageB, rowKey, page, pageSize: 2, total: 4, onPageChange: setPage }}
            toItem={toItem}
            selectedKeys={selected}
            onSelectedKeysChange={setSelected}
            chosen={chosen}
            onChosenChange={setChosen}
        />
    );
}

describe('TerminalTransferList — selection across pages', () => {
    it('adds rows selected on an earlier page as well as the current one', () => {
        render(<PagedHarness />);

        fireEvent.click(screen.getAllByRole('checkbox')[1]); // alpha, page 1
        fireEvent.click(screen.getByTitle('Next page'));
        expect(screen.getByText('charlie')).toBeInTheDocument();
        fireEvent.click(screen.getAllByRole('checkbox')[1]); // charlie, page 2

        fireEvent.click(screen.getByText('add selected →'));

        expect(screen.getByText('2 chosen')).toBeInTheDocument();
        const chosenLabels = screen.getAllByText(/alpha|charlie/).filter((el) => el.closest('label'));
        expect(chosenLabels.map((el) => el.textContent).sort()).toEqual(['alpha', 'charlie']);
    });

    it('keeps a key it cannot resolve selected, and says so, instead of dropping it', () => {
        render(<PagedHarness initialSelected={new Set(['99'])} />);
        fireEvent.click(screen.getByText('add selected →'));

        expect(screen.getByText('0 chosen')).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent('1 selected row could not be added');
        // still selected: "add selected" stays enabled for a retry
        expect(screen.getByRole('button', { name: /add 1 selected/ })).toBeEnabled();
    });

    it('uses resolveRow for a key it has never rendered', () => {
        function ResolveHarness() {
            const [selected, setSelected] = useState<Set<string>>(new Set(['9']));
            const [chosen, setChosen] = useState<TerminalTransferListItem[]>([]);
            return (
                <TerminalTransferList<Row>
                    table={{ columns, rows: pageA, rowKey }}
                    toItem={toItem}
                    selectedKeys={selected}
                    onSelectedKeysChange={setSelected}
                    resolveRow={(k) => (k === '9' ? { id: '9', name: 'zulu' } : undefined)}
                    chosen={chosen}
                    onChosenChange={setChosen}
                />
            );
        }
        render(<ResolveHarness />);
        fireEvent.click(screen.getByText('add selected →'));
        expect(screen.getByText('1 chosen')).toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
});

// ── add all matching ───────────────────────────────────────────────────────
describe('TerminalTransferList — add all matching', () => {
    it('disables every button while it is busy and re-enables them after', async () => {
        let resolveFn!: (items: TerminalTransferListItem[]) => void;
        const onAddAllMatching = vi.fn(() => new Promise<TerminalTransferListItem[]>((res) => { resolveFn = res; }));
        render(<Harness onAddAllMatching={onAddAllMatching} initialChosen={[{ key: '1', label: 'alpha' }]} />);

        fireEvent.click(screen.getByText(/add all matching/));
        expect(screen.getByText('adding…')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /rows on this page/ })).toBeDisabled();
        expect(screen.getByRole('button', { name: /clear all/ })).toBeDisabled();

        resolveFn([{ key: '7', label: 'golf' }]);
        await waitFor(() => expect(screen.getByRole('button', { name: /clear all/ })).toBeEnabled());
        expect(screen.getByText('2 chosen')).toBeInTheDocument();
    });

    it('shows a rejected promise inline and recovers', async () => {
        const onAddAllMatching = vi.fn(() => Promise.reject(new Error('server said no')));
        render(<Harness onAddAllMatching={onAddAllMatching} />);

        fireEvent.click(screen.getByText(/add all matching/));
        await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('server said no'));
        expect(screen.getByRole('button', { name: /add everything matching/ })).toBeEnabled();
        expect(screen.getByText('0 chosen')).toBeInTheDocument();
    });

    it('de-duplicates by key and keeps the order stable', async () => {
        const onAddAllMatching = vi.fn(async () => [
            { key: '2', label: 'bravo' },   // already chosen
            { key: '5', label: 'echo' },
            { key: '5', label: 'echo again' }, // duplicate inside the batch
            { key: '4', label: 'delta' },
        ]);
        const { container } = render(<Harness onAddAllMatching={onAddAllMatching} initialChosen={[{ key: '2', label: 'bravo' }]} />);

        fireEvent.click(screen.getByText(/add all matching/));
        await waitFor(() => expect(screen.getByText('3 chosen')).toBeInTheDocument());

        const chosenPane = container.querySelectorAll('section')[1] as HTMLElement;
        const labels = within(chosenPane).getAllByRole('checkbox').map((b) => b.getAttribute('aria-label'));
        expect(labels).toEqual(['Select bravo', 'Select echo', 'Select delta']);
        expect(screen.getByRole('status')).toHaveTextContent('added 2 of 4 matching');
    });

    it('leaves the chosen list to the consumer when it resolves to nothing', async () => {
        function VoidHarness() {
            const [selected, setSelected] = useState<Set<string>>(new Set());
            const [chosen, setChosen] = useState<TerminalTransferListItem[]>([]);
            return (
                <TerminalTransferList<Row>
                    table={{ columns, rows: allRows, rowKey }}
                    toItem={toItem}
                    selectedKeys={selected}
                    onSelectedKeysChange={setSelected}
                    chosen={chosen}
                    onChosenChange={setChosen}
                    onAddAllMatching={() => { setChosen([{ key: 'x', label: 'from the consumer' }]); }}
                />
            );
        }
        render(<VoidHarness />);
        fireEvent.click(screen.getByText(/add all matching/));
        await waitFor(() => expect(screen.getByText('1 chosen')).toBeInTheDocument());
        expect(screen.getByText('from the consumer')).toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
});

// ── large chosen lists ─────────────────────────────────────────────────────
const bigChosen: TerminalTransferListItem[] = Array.from({ length: 5000 }, (_, i) => ({
    key: `k${i}`,
    label: `item-${i}`,
    sublabel: i % 2 === 0 ? 'even' : 'odd',
}));

function BigHarness({ chosen = bigChosen }: { chosen?: TerminalTransferListItem[] }) {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [list, setList] = useState(chosen);
    return (
        <TerminalTransferList<Row>
            table={{ columns, rows: allRows, rowKey }}
            toItem={toItem}
            selectedKeys={selected}
            onSelectedKeysChange={setSelected}
            chosen={list}
            onChosenChange={setList}
        />
    );
}

describe('TerminalTransferList — 5,000 chosen', () => {
    it('caps the rendering and says so', () => {
        render(<BigHarness />);
        expect(screen.getByText('5,000 chosen')).toBeInTheDocument();
        expect(screen.getByText(/showing first 500 of 5,000/)).toBeInTheDocument();
        expect(screen.getAllByRole('checkbox').filter((b) => b.getAttribute('aria-label')?.startsWith('Select item-'))).toHaveLength(500);
    });

    it('filters the chosen list without touching the cap logic', () => {
        render(<BigHarness />);
        fireEvent.change(screen.getByPlaceholderText('filter chosen'), { target: { value: 'item-123' } });
        // item-123, item-1230..1239 → 11 matches, under the cap
        expect(screen.getByText('11 shown')).toBeInTheDocument();
        expect(screen.queryByText(/showing first/)).not.toBeInTheDocument();
    });

    it('touches only the toggled row when one of 5,000 is checked', () => {
        // Rows are keyed and React.memo'd on their own identity, so a toggle
        // updates one row: every other row keeps the very same DOM node (a
        // rebuilt or re-keyed list would swap them) and its checked state.
        const { container } = render(<BigHarness />);
        const pane = container.querySelectorAll('section')[1] as HTMLElement;
        const rowsOf = (el: HTMLElement) => [...el.querySelectorAll('label')].filter((l) => !l.parentElement?.closest('label'));
        const rowsBefore = rowsOf(pane);
        expect(rowsBefore).toHaveLength(500); // the cap, not 5,000

        fireEvent.click(screen.getByRole('checkbox', { name: 'Select item-0' }));

        const rowsAfter = rowsOf(pane);
        expect(rowsAfter).toHaveLength(500);
        rowsAfter.forEach((row, i) => expect(row).toBe(rowsBefore[i])); // no remounts
        expect(within(rowsAfter[0]).getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
        expect(within(rowsAfter[1]).getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
    });
});

// ── dense chosen rows ──────────────────────────────────────────────────────
describe('TerminalTransferList — chosen row density', () => {
    const withMeta = [{ key: '1', label: 'alpha', sublabel: 'namespace', meta: '12 KB' }];

    it('is one line by default, with the sublabel dimmed and the meta trailing', () => {
        render(<Harness initialChosen={withMeta} />);
        const row = screen.getAllByText('alpha').find((el) => el.closest('label'))!.closest('label')!;
        expect(row).toHaveTextContent('alphanamespace12 KB');
        expect(row.querySelector('.block')).toBeNull(); // no stacked lines
        expect(screen.getByText('12 KB')).toBeInTheDocument();
    });

    it('stacks label over sublabel only when twoLine asks', () => {
        function TwoLineHarness() {
            const [chosen, setChosen] = useState<TerminalTransferListItem[]>(withMeta);
            return (
                <TerminalTransferList<Row>
                    table={{ columns, rows: allRows, rowKey }}
                    toItem={toItem}
                    selectedKeys={new Set()}
                    onSelectedKeysChange={vi.fn()}
                    chosen={chosen}
                    onChosenChange={setChosen}
                    twoLine
                />
            );
        }
        render(<TwoLineHarness />);
        const row = screen.getAllByText('alpha').find((el) => el.closest('label'))!.closest('label')!;
        expect(row.querySelectorAll('.block')).toHaveLength(2);
    });
});

describe('TerminalTransferList — layout', () => {
    it('is a fixed-height workbench that both panes fill', () => {
        const { container } = render(<Harness />);
        const root = container.firstElementChild as HTMLElement;
        expect(root.style.getPropertyValue('--tux-transfer-h')).toBe('28rem');
        expect(root.className).toContain('md:h-[var(--tux-transfer-h)]');

        const panes = container.querySelectorAll('section');
        expect(panes).toHaveLength(2);
        panes.forEach((p) => {
            expect(p.className).toContain('bg-midnight-surface'); // the ladder, not an outline per box
            expect(p.className).toContain('min-h-0');
        });
        expect(panes[0].className).toContain('flex-1');        // available takes the rest
        expect(panes[1].className).toContain('md:w-2/5');      // chosen takes a fixed share
    });

    it('accepts any CSS length for height', () => {
        function TallHarness() {
            return (
                <TerminalTransferList<Row>
                    table={{ columns, rows: allRows, rowKey }}
                    toItem={toItem}
                    selectedKeys={new Set()}
                    onSelectedKeysChange={vi.fn()}
                    chosen={[]}
                    onChosenChange={vi.fn()}
                    height={640}
                />
            );
        }
        const { container } = render(<TallHarness />);
        expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--tux-transfer-h')).toBe('640px');
    });
});

describe('TerminalTransferList — add page', () => {
    it('skips rows that are already chosen', () => {
        render(<Harness initialChosen={[{ key: '2', label: 'bravo' }]} />);
        fireEvent.click(screen.getByText('add page →'));
        expect(screen.getByText('3 chosen')).toBeInTheDocument();
        // every row on the page is chosen now — nothing left to add
        const addPage = screen.getByRole('button', { name: /rows on this page/ });
        expect(addPage).toHaveAccessibleName('add the 0 rows on this page to the chosen list');
        expect(addPage).toBeDisabled();
    });
});
