# @quantumwake/terminal-ux-components

Terminal-style React UX components extracted from `alethic-ism-ui-enterprise`,
so the enterprise app and the read-only `alethic-ism-publish-ui` can share one
component library (mirrors how `@quantumwake/kgraph` was extracted).

## Theme

The package owns the theme **plumbing**; the host app supplies the theme
**value** (its existing rich theme object). Wrap your app once:

```tsx
import { ThemeProvider } from '@quantumwake/terminal-ux-components';

<ThemeProvider theme={useStore(s => s.getCurrentTheme())}>
  <App />
</ThemeProvider>
```

Components read it via `useTheme()`. The Tailwind token contract
(`midnight`/etc. colors + shadows) still lives in the host's Tailwind config; a
shippable `tailwind-preset` is a planned follow-up.

## Peer dependencies

Provided by the host app (not bundled):

- `react`, `react-dom` (>=17)
- `lucide-react` (optional) — icons used by Checkbox/TagField/InfoButton
- `@headlessui/react`, `@heroicons/react` (optional) — used by `TerminalDropdown`

> The read-only kgraph studio renderers (StudioGraph/StudioNode/CleanEdge) live
> in **`@quantumwake/kgraph/ism`**, not here — this package is graph-free.

## Components

Current export set (`useTheme()`-based, fully typed):

- **Theme:** `ThemeProvider`, `useTheme`
- **Primitives:** `TerminalButton`, `TerminalLabel`, `TerminalInput`,
  `TerminalCheckbox`, `TerminalToggle`, `TerminalContainer`, `TerminalSection`,
  `TerminalTagField`, `TerminalInfoButton`, `TerminalDropdown`, `TerminalMeter`
- **Layout:** `TerminalSplit`

### `TerminalTabViewSection`

A collapsible, titled group of items. Uncontrolled by default (starts open,
manages its own open/closed state); pass `collapsed` to drive it from the
host instead.

```tsx
<TerminalTabViewSection
  title="Applications"
  items={items}
  count={items.length}
  defaultCollapsed
  collapsed={isOpen}
  onToggle={(collapsed) => setIsOpen(collapsed)}
  footer={<ShowMoreButton />}
/>
```

- `defaultCollapsed` — initial state when uncontrolled (default: open).
- `collapsed` — controlled state; once passed, the section never changes it
  on its own, so the host must update it from `onToggle`.
- `onToggle(collapsed)` — called with the state a header click asks for, in
  both controlled and uncontrolled use.
- `count` — an optional count rendered beside the title.
- `footer` — rendered after the items, e.g. a "show more" row.
- The header is a real `<button>` with `aria-expanded`, so it is keyboard
  reachable and toggles on Enter/Space for free.

### `TerminalMeter`

A horizontal meter for a ratio in `[0, 1]` — disk/memory usage, quota
consumed, etc. Values outside the range are clamped for display; an absent
(`undefined` or `NaN`) value renders an em dash and an empty bar, never 0%.

```tsx
<TerminalMeter
  label="Memory"
  value={usedBytes / totalBytes}
  caption={`${formatGiB(usedBytes)} / ${formatGiB(totalBytes)}`}
  threshold={0.85}
/>
```

- `threshold` — a tick mark at that ratio; the bar switches to the theme's
  warning colour once `value` reaches it.
- `size` — `'small' | 'medium'` (default `'medium'`).
- `showPercent` — renders `NN%` after the bar (default `true`); the percent is
  still reflected in `aria-label` even when hidden.
- Renders with `role="meter"` and `aria-valuenow`/`aria-valuemin`/
  `aria-valuemax`, so assistive tech reads it like any other meter.

### `TerminalSplit`

Any number of panes, side by side or stacked, with a draggable divider
between each pair. Dragging a divider trades space between the two panes
next to it only.

```tsx
<TerminalSplit
  direction="horizontal"          // or "vertical" (stacked)
  sizes={sizes}                    // optional: controlled fractions, one per pane
  onSizesChange={setSizes}
  minSize={160}
  dividerClassName="bg-border hover:bg-accent/50"
>
  {panes.map((p) => <Pane key={p.id} {...p} />)}
</TerminalSplit>
```

- Uncontrolled by default (equal shares, or `defaultSizes`); pass `sizes` to
  drive it from the host. When the pane count changes and the sizes no longer
  fit, it falls back to equal shares.
- `minSize` — the smallest a pane may get, in pixels (default 120).
- Dividers are `role="separator"`: arrow keys move a focused divider by 2%,
  and a double-click evens its two panes out.
- Layout is inline styles, so it works under any stylesheet. The divider's
  default look uses the midnight classes; hosts with their own palette pass
  `dividerClassName` (and `paneClassName` for the pane wrappers).

### `TerminalTable`

The dense inline data table (members, nodes, query results). Selection, sorting
and paging are all **optional** and **controlled** — the table never owns any
of them. Pass none of them and you get, byte for byte, the table of v0.3.12:
one scrolling `<div>`, no tab stop, no checkbox column, no footer.

```tsx
<TerminalTable
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'size', label: 'Size', align: 'right', width: 96 },
  ]}
  rows={pageOfRows}
  rowKey={(row) => row.id}

  // Paging — server-driven, controlled.
  page={page}
  pageSize={pageSize}
  total={total}              // omit when unknown: footer shows "N–M", Last is hidden
  hasMore={hasMore}          // used instead of `total` to enable/disable Next
  onPageChange={setPage}
  pageSizeOptions={[25, 50, 100]}
  onPageSizeChange={setPageSize}

  // Selection — controlled, survives paging (the host just keeps the same
  // Set while swapping `rows` for a new page).
  selectedKeys={selected}
  onSelectionChange={setSelected}
  isRowSelectable={(row) => !row.locked}
  selectionDisabledReason={(row) => (row.locked ? 'locked' : undefined)}

  loading={isFetching}       // dims the current `rows` instead of collapsing the table
  error={fetchError}
  onRetry={refetch}
/>
```

- A header checkbox selects/deselects every **selectable** row on the **current
  page only** (tri-state when the page is partially selected); shift-click a
  row checkbox to select the range between it and the last-clicked row, within
  the page, skipping rows `isRowSelectable` rejects. The range anchor is
  dropped when the page changes.
- Keys are compared as strings. `rowKey` may return any `React.Key`; for
  selection it must be globally stable, not merely stable within a page.
- Controlled-paging edges: with `total` unknown, Next follows `hasMore` and
  Last is hidden. If `total` shrinks below the current page, the table calls
  `onPageChange` **once** with the last valid page (a host that ignores it is
  not looped over). A page-size change keeps the first visible row in view —
  the new page is `floor(firstIndex / newSize)`.
- `loading` dims the current rows in place rather than collapsing the table;
  `error` + `onRetry` replace the body with a message and a retry button.
- Keyboard: the table is ONE tab stop. ArrowUp/ArrowDown move a roving focus
  (`aria-activedescendant`), Home/End jump to the first/last row, Space toggles
  the focused row's selection, PageUp/PageDown change the page. Focus never
  falls into a hole when rows are removed under it.
- Row checkboxes are labelled with the row (`Select <name>`); `rowLabel` sets
  that text when the first column isn't plain text.
- `rowClassName(row, index)` — extra classes per row. `rowActions(row, index)`
  — a trailing, unlabeled cell (icon buttons, a menu trigger).
- `sort`/`onSortChange` (provide both) plus `column.sortable` render a
  clickable, `aria-sort`-correct header.
- `truncate` (table-wide) or `column.truncate` elides a cell with `…` and a
  `title`. **Default off** — without it, wide tables scroll sideways inside
  the component's frame, exactly as they always have.
- `headerClassName` replaces the `<thead>` background, `footerClassName` adds
  to the pager band — for hosts putting the table inside their own panel.
- `dense` (default `true`), `stickyHeader`, `maxHeight` (scrolls inside the
  component, never the page) are unchanged from before.

### `TerminalTransferList`

The classic two-pane "available → chosen" control, built on `TerminalTable`
for the left pane. Paging and filtering of the available rows stay entirely
with the host — passed straight through via `table`, unmodified — and this
component wires the table's selection to a host-held `chosen` list.

It is a **fixed-height workbench**: `height` (default `28rem`, any CSS length)
is the whole component, both panes fill it and scroll inside themselves, and
nothing here grows the page — whether `chosen` holds three ids or fifty
thousand.

```tsx
<TerminalTransferList
  filterBar={<MyFilterBar value={q} onChange={setQ} />}
  table={{
    columns: [{ key: 'name', label: 'Name' }],
    rows: pageOfAvailableRows,
    rowKey: (row) => row.id,
    page, pageSize, total, onPageChange: setPage,
    loading, error, onRetry,
  }}
  toItem={(row) => ({ label: row.name, sublabel: row.email, meta: row.size })}

  selectedKeys={selected}
  onSelectedKeysChange={setSelected}

  chosen={chosen}
  onChosenChange={setChosen}

  height="32rem"

  onAddAllMatching={async () => {
    const ids = await fetchAllMatchingIds(q);           // may reject — shown inline
    return ids.map((id) => ({ key: id, label: labelFor(id) }));
  }}
/>
```

- **Selection survives paging.** The host owns `selectedKeys`, but "add
  selected →" needs the ROW behind each key and rows from other pages are not
  in memory. Every row rendered while it was selected is cached (key → row);
  "add selected" reads that cache first, then `resolveRow` if you gave one.
  A key that still can't be resolved **stays selected** and the component says
  so inline ("3 selected rows could not be added") — it never drops a
  selection silently.
- **`onAddAllMatching`** may be sync or async and may return items or nothing:
  items are merged into `chosen` via `onChosenChange` (de-duplicated by key,
  existing order kept, new items appended in arrival order); `void` means the
  consumer updated `chosen` itself. Every button is disabled while it runs,
  and a rejected promise is caught and shown inline rather than escaping.
- Middle buttons: "add selected →", "add page →" (skipping rows already
  chosen), "add all matching →" (hidden when the prop is absent), "← remove
  selected", "← clear". Each carries an `aria-label` with its count ("add 3
  selected to the chosen list"). The column is only as wide as its buttons and
  is centred in the component's height.
- A row already in `chosen` renders dimmed and unselectable in the left table.
  `isRowSelectable`/`selectionDisabledReason`/`rowKey`/`maxHeight`/`className`
  are owned by this component and are not part of `table`.
- Chosen rows are **one line** — label, dimmed truncated sublabel,
  right-aligned `meta`. Pass `twoLine` for label over sublabel. Rows are keyed
  and memoised, so one toggle in a 5,000-row list touches one row; the chosen
  filter uses a Set for membership and is memoised. No virtualisation
  dependency — rendering is capped (`chosenRenderCap`, default 500) with a
  "showing first N of M" note. Give an item `text` when its `label` is not a
  plain string, so the filter still matches it.
- Layout: the left pane takes the remaining width (`flex-1`, `min-w-0`), the
  right pane about 2/5 with a minimum. Below `md` the panes stack and the
  buttons become a horizontal row between them, `height` capping each pane.
- Boundaries come from the background ladder (base → surface → elevated), not
  from an outline round every box: each pane is one `surface` card, its header
  and pager sit on an `elevated` band, rows are separated by a hairline.

## Migration status

Incremental extraction (dogfooded by enterprise consuming each release):

- **0.2.0 (current)** — theme plumbing + the 10 leaf primitives above.
- **next** — composites (`TerminalDialog`, `TerminalContextMenu`,
  `TerminalHoverMenu`, `TerminalTabView`, …), then the stateful
  `TerminalDataTable`. `canvas/` and the `ism|ismql|statefs` domain components
  stay in the app.

## Usage

```bash
npm install
npm run build      # tsup → dist/ (esm + cjs + .d.ts)
npm run dev        # tsup --watch
npm run lint       # tsc --noEmit
npm run test       # vitest run
```

No environment variables — this is a presentational component library with no
network or app-state dependencies.

