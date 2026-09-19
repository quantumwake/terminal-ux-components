// demo.js — a zero-build harness for eyeballing TerminalTable and
// TerminalTransferList in the real "midnight" dark theme. No JSX (there is
// no transpiler in this page), so everything below is React.createElement.
//
// Imports the ACTUAL BUILT ARTIFACT (`../../dist/index.js`), not source —
// run `npm run build` in the package root first. Open index.html via any
// static file server (browsers block `file://` module imports):
//   npx --yes http-server . -p 4173     (from this directory)
// then visit http://localhost:4173/
//
// The URL hash picks a scenario, so every reviewable state is one link away:
//   (none)            both components, nothing chosen
//   #transfer         the transfer list alone, 0 chosen
//   #transfer-chosen  …with two pages (50) already chosen
//   #transfer-busy    …with the left filter active and "add all matching" hung
//   #transfer-big     …with 5,000 chosen (the render cap + its note)
//   #table            the table alone, plus buttons to force loading / error

import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, TerminalTable, TerminalTransferList, TerminalInput, TerminalButton } from '../../dist/index.js';

const h = React.createElement;
const { useState, useCallback, useEffect } = React;

// ---- an in-memory "server" of 25,000 fake rows ----------------------------
const ADJ = ['swift', 'quiet', 'amber', 'cobalt', 'lunar', 'brisk', 'terse', 'stony', 'vivid', 'plain', 'muted', 'sharp'];
const NOUN = ['falcon', 'harbor', 'cinder', 'meadow', 'quartz', 'ember', 'ridge', 'basin', 'thicket', 'anchor', 'lantern', 'summit'];
const CATEGORIES = ['namespace', 'session', 'index', 'processor', 'route'];

const ALL_ROWS = Array.from({ length: 25000 }, (_, i) => {
    const adj = ADJ[i % ADJ.length];
    const noun = NOUN[(i * 7) % NOUN.length];
    return {
        id: `row-${i}`,
        name: `${adj}-${noun}-${i}`,
        category: CATEGORIES[i % CATEGORIES.length],
        size: ((i * 2654435761) % 1000000) / 1000,
    };
});

const asItem = (r) => ({ key: r.id, label: r.name, sublabel: r.category, meta: `${r.size.toFixed(1)} KB` });

function matching(filter) {
    const q = (filter || '').trim().toLowerCase();
    return q ? ALL_ROWS.filter((r) => r.name.includes(q)) : ALL_ROWS;
}

function serverFetch({ filter, page, pageSize }) {
    const matched = matching(filter);
    const start = page * pageSize;
    const rows = matched.slice(start, start + pageSize);
    return new Promise((resolve) => {
        setTimeout(() => resolve({ rows, total: matched.length }), 150);
    });
}

function resolveAllMatchingIds(filter) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(matching(filter).map(asItem)), 300);
    });
}

const mode = (location.hash || '').replace(/^#/, '');

// ---- shared columns ---------------------------------------------------
const columns = [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category', width: 120 },
    {
        key: 'size', label: 'Size (KB)', align: 'right', width: 110,
        render: (row) => row.size.toFixed(1),
    },
];

const heading = (text) => h('h2', { className: 'text-sm uppercase tracking-wider text-midnight-text-muted' }, text);

// ---- Section 1: TerminalTable on its own -------------------------------
function TableDemo() {
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(50);
    const [selected, setSelected] = useState(new Set());
    const [data, setData] = useState({ rows: [], total: 0 });
    const [loading, setLoading] = useState(false);
    const [stuckLoading, setStuckLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let live = true;
        setLoading(true);
        serverFetch({ filter, page, pageSize }).then((result) => {
            if (!live) return;
            setData(result);
            setLoading(false);
        });
        return () => { live = false; };
    }, [filter, page, pageSize]);

    return h('section', { className: 'space-y-3' },
        heading('TerminalTable — 25,000 rows, server-paged'),
        h('div', { className: 'flex items-center gap-3' },
            h('div', { className: 'w-64' },
                h(TerminalInput, {
                    size: 'small',
                    placeholder: 'filter by name…',
                    value: filter,
                    onChange: (e) => { setFilter(e.target.value); setPage(0); },
                }),
            ),
            h('span', { className: 'text-xs text-midnight-text-muted', 'data-testid': 'selected-count' }, `${selected.size} selected`),
            h(TerminalButton, { size: 'small', variant: 'ghost', onClick: () => setStuckLoading((v) => !v) }, 'toggle loading'),
            h(TerminalButton, { size: 'small', variant: 'ghost', onClick: () => setError((e) => (e ? null : 'GET /namespaces failed: 503 upstream unavailable')) }, 'toggle error'),
        ),
        h('div', { className: 'border border-midnight-border bg-midnight-surface' },
            h(TerminalTable, {
                columns,
                rows: data.rows,
                rowKey: (r) => r.id,
                loading: loading || stuckLoading,
                error,
                onRetry: () => setError(null),
                stickyHeader: true,
                headerClassName: 'bg-midnight-elevated/70',
                footerClassName: 'bg-midnight-elevated/70',
                truncate: true,
                maxHeight: 420,
                page,
                pageSize,
                total: data.total,
                onPageChange: setPage,
                pageSizeOptions: [25, 50, 100, 250],
                onPageSizeChange: setPageSize,
                selectedKeys: selected,
                onSelectionChange: setSelected,
            }),
        ),
    );
}

// ---- Section 2: TerminalTransferList -----------------------------------
function TransferDemo() {
    const preset = {
        'transfer-chosen': { chosen: ALL_ROWS.slice(0, 50).map(asItem), filter: '' },
        'transfer-busy': { chosen: [], filter: 'falcon' },
        'transfer-big': { chosen: ALL_ROWS.slice(0, 5000).map(asItem), filter: '' },
    }[mode] || { chosen: [], filter: '' };

    const [filter, setFilter] = useState(preset.filter);
    const [page, setPage] = useState(0);
    const pageSize = 25;
    const [selected, setSelected] = useState(new Set());
    const [chosen, setChosen] = useState(preset.chosen);
    const [data, setData] = useState({ rows: [], total: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let live = true;
        setLoading(true);
        serverFetch({ filter, page, pageSize }).then((result) => {
            if (!live) return;
            setData(result);
            setLoading(false);
        });
        return () => { live = false; };
    }, [filter, page]);

    const toItem = useCallback((row) => ({ label: row.name, sublabel: row.category, meta: `${row.size.toFixed(1)} KB` }), []);

    // "#transfer-busy" hangs the resolve so the busy state can be photographed.
    const onAddAllMatching = useCallback(
        () => (mode === 'transfer-busy' ? new Promise(() => {}) : resolveAllMatchingIds(filter)),
        [filter],
    );

    return h('section', { className: 'space-y-3' },
        heading('TerminalTransferList — pick from 25,000, move thousands'),
        h(TerminalTransferList, {
            filterBar: h('div', { className: 'w-64' },
                h(TerminalInput, {
                    size: 'small',
                    placeholder: 'filter available…',
                    value: filter,
                    onChange: (e) => { setFilter(e.target.value); setPage(0); },
                }),
            ),
            table: {
                columns,
                rows: data.rows,
                rowKey: (r) => r.id,
                loading,
                page,
                pageSize,
                total: data.total,
                onPageChange: setPage,
            },
            toItem,
            selectedKeys: selected,
            onSelectedKeysChange: setSelected,
            chosen,
            onChosenChange: setChosen,
            onAddAllMatching,
        }),
    );
}

function App() {
    const showTable = mode === '' || mode === 'table';
    const showTransfer = mode === '' || mode.startsWith('transfer');
    return h(ThemeProvider, null,
        h('div', { className: 'max-w-6xl mx-auto space-y-10 pb-16' },
            h('h1', { className: 'text-lg text-midnight-text-primary' }, '@quantumwake/terminal-ux-components — TerminalTable & TerminalTransferList'),
            showTable && h(TableDemo, null),
            showTransfer && h(TransferDemo, null),
        ),
    );
}

createRoot(document.getElementById('root')).render(h(App, null));
