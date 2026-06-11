# Theme & Component Consistency Audit

**Date:** 2026-06-11
**Trigger:** consuming the design system from `terminal-ux-dashboard-components` surfaced two problems —
(1) some components hardcode `midnight-*` classes while others read `theme.*`, and
(2) the `ThemeProvider` default is `{}`, so any component that dereferences a
deep theme path (e.g. `theme.input.primary`) **crashes** when rendered without a
provider (e.g. in the published viewer, which has no ThemeProvider).

## The decision

> "We should be using the theme provider across all components. If the theme
> provider is blank, use midnight."

The package ships a **complete default midnight theme**. `useTheme()` is never
blank: no provider ⇒ midnight; a provider shallow-overrides it. Every component
reads `theme.*` uniformly. "Provider-free" special-casing is removed.

## Theme keys components dereference (audit)

`grep -rhoE "theme\.[a-zA-Z0-9_.]+" src` →

```
theme.bg                       theme.hover
theme.bgSecondary              theme.hoverMenu.{trigger,content,item,subItems.content,subItems.item}
theme.border                   theme.icon
theme.button.{primary,secondary,ghost,danger,success,warning,info,disabled}
theme.datatable.header         theme.input.{primary,secondary,danger,success,warning,info,ghost,disabled}
theme.default.text.{primary,secondary,muted,danger,accent}
theme.effects.{crtClass,scanlineClass}   theme.tab.section.{header,hover}
theme.font                     theme.text
theme.glowColor                theme.textAccent
                               theme.textMuted
```

Source of truth for values: `alethic-ism-ui-enterprise/src/themes/midnightlab.js`
(+ `midnightlab/components/input.js`). The package default is lifted from there
(only the keys components reference), so provider-less === the studio's look.

## Component inventory — theming status

| Component            | Reads theme? | Notes |
|----------------------|--------------|-------|
| TerminalInput        | ✅ theme.input.* | crashes w/o provider (FIXED by default theme) |
| TerminalLabel        | ✅ theme.default/font | ditto |
| TerminalButton       | ✅ theme.button.* | ditto |
| TerminalDropdown     | ✅ theme.dropdown.* | also needs @headlessui/react (host dep) |
| TerminalToggle       | ⚠️ hardcoded `midnight-*` | renders fine but inconsistent — TODO normalize |
| TerminalSlider (new) | ✅ theme.input.* | added this pass |
| TerminalSelect (new) | ✅ theme.input.* | added this pass; native <select>, no headlessui |
| TerminalDataTable2   | ✅ theme.datatable.* | |
| (others)             | ✅ | TabBar/Footer/Header/ContextMenu/HoverMenu/Dialog |

`TerminalDropdown` is the only control with a HARD external dep
(`@headlessui/react` + `@heroicons/react`). The published viewer (publish-ui)
doesn't ship those, so the new **TerminalSelect** (native, dep-free) is the
choice for simple option pickers consumed by both hosts.

## Plan / checklist

### terminal-ux-components (this repo)
- [x] Audit theme keys + values (this doc)
- [x] Add `TerminalSlider` (range + editable value box)
- [x] Add `TerminalSelect` (native styled select, no headlessui)
- [ ] Add `src/theme/defaultTheme.ts` — complete midnight default
- [ ] `ThemeProvider`: context default = defaultTheme; shallow-merge a provided theme over it
- [ ] Make `TerminalSlider`/`TerminalSelect` read `theme.*` (consistent with TerminalInput)
- [ ] Build + bump (0.3.3) + publish
- [ ] (later) normalize `TerminalToggle` to read theme instead of hardcoded midnight

### terminal-ux-dashboard-components (consumer)
- [ ] Add `@quantumwake/terminal-ux-components` as peer + dev dep
- [ ] Rewrite `ChartStyleControls` using TerminalToggle/Slider/Select/Input/Label/Section
- [ ] Axis ticks: WRAP (default on) + fix Y-angle (route grouped-bar through the shared axis helper) + truncate
- [ ] Table: cell wrap (default) + numeric precision (default 2 dp for float/decimal) + truncate
- [ ] Chart "fill": per-panel `config.fill`; single-panel dashboard auto-maximizes (esp. published)
- [ ] Build + bump (0.1.16)

### apps
- [ ] ui-enterprise + publish-ui: bump terminal-ux-components → ^0.3.3, dashboard → ^0.1.16, install
- [ ] (no new headlessui/provider needed — default theme + native TerminalSelect)

## Notes / decisions
- Hosts already wrap their app in `<ThemeProvider theme={…}>` (ui-enterprise `App.tsx`).
  The default only matters where there is NO provider (publish-ui's chart builder).
- Shallow-merge (`{...defaultTheme, ...hostTheme}`) is enough because hosts supply
  a FULL theme; deep partials aren't a real case. Revisit with deep-merge only if
  a host ships a partial theme.
