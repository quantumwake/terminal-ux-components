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

