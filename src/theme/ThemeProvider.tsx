import React, { createContext, useContext, ReactNode } from 'react';

// Theme is intentionally loosely typed: it mirrors the consuming app's rich
// theme object (bg, text, border, hover, icon, font, button.*, input,
// default.text.*, hoverMenu.*, effects.*, ...). The package owns the plumbing
// (context + hook); the host app supplies the concrete theme value. This lets
// components be extracted without first lifting the entire theme system.
export type Theme = Record<string, any>;

const ThemeContext = createContext<Theme>({});

export interface ThemeProviderProps {
    theme: Theme;
    children: ReactNode;
}

/**
 * ThemeProvider makes a theme object available to all terminal-ux components
 * via useTheme(). Wrap your app once:
 *
 *   <ThemeProvider theme={useStore(s => s.getCurrentTheme())}>...</ThemeProvider>
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);

/** useTheme returns the current theme provided by the nearest ThemeProvider. */
export const useTheme = (): Theme => useContext(ThemeContext);
