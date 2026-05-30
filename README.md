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
- `@quantumwake/kgraph` (optional) — required only for the `studio` exports

## Studio (read-only kgraph graph)

Shared light-theme, read-only graph renderers (used by `alethic-ism-publish-ui`
and available to the enterprise studio for previews):

- `StudioGraph` — a read-only `KGraphCanvas` (white bg, fit-to-view, no
  drag/connect) that renders every node as `StudioNode` and every edge as
  `CleanEdge`. Pass pre-mapped `nodes`/`edges`; put `{kind, typeLabel, title,
  subtitle}` (`StudioNodeData`) on each `node.data`.
- `StudioNode`, `CleanEdge`, `NODE_WIDTH`/`NODE_HEIGHT`, and helpers
  `kindForNodeType(nodeType)` / `displayType(nodeType)`.

## Components

Current export set (`useTheme()`-based, fully typed):

- **Theme:** `ThemeProvider`, `useTheme`
- **Primitives:** `TerminalButton`, `TerminalLabel`, `TerminalInput`,
  `TerminalCheckbox`, `TerminalToggle`, `TerminalContainer`, `TerminalSection`,
  `TerminalTagField`, `TerminalInfoButton`, `TerminalDropdown`

## Migration status

Incremental extraction (dogfooded by enterprise consuming each release):

- **0.1.0 (current)** — theme plumbing + the 10 leaf primitives above.
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
```

No environment variables — this is a presentational component library with no
network or app-state dependencies.

