import React, { createContext, useContext, ReactNode } from 'react';
import { defaultTheme } from './defaultTheme';

// Theme is intentionally loosely typed: it mirrors the consuming app's rich
// theme object (bg, text, border, hover, icon, font, button.*, input,
// default.text.*, hoverMenu.*, effects.*, ...). The package owns the plumbing
// (context + hook) and ships a complete MIDNIGHT default; the host app supplies
// a concrete theme to override it.
export type Theme = Record<string, any>;

// The context default is the full midnight theme — NOT {} — so a component
// rendered without a <ThemeProvider> still resolves every `theme.*` path it
// reads (no crashes) and looks like midnight. See docs/THEME_AND_COMPONENT_AUDIT.md.
const ThemeContext = createContext<Theme>(defaultTheme);

export interface ThemeProviderProps {
    theme: Theme;
    children: ReactNode;
}

/**
 * ThemeProvider makes a theme object available to all terminal-ux components
 * via useTheme(). Wrap your app once:
 *
 *   <ThemeProvider theme={useStore(s => s.getCurrentTheme())}>...</ThemeProvider>
 *
 * The provided theme is shallow-merged over the midnight default, so a host that
 * omits a top-level key still falls back to midnight for it.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => (
    <ThemeContext.Provider value={{ ...defaultTheme, ...(theme || {}) }}>{children}</ThemeContext.Provider>
);

/**
 * useTheme returns the active theme — the nearest ThemeProvider's value, or the
 * midnight default when there is no provider.
 */
export const useTheme = (): Theme => useContext(ThemeContext);
