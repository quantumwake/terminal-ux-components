import type { Theme } from './ThemeProvider';

// defaultTheme — the package's built-in MIDNIGHT theme. It is the value
// useTheme() returns when no <ThemeProvider> is present, so every component reads
// `theme.*` uniformly and "no provider" simply means midnight (no crashes, no
// hardcoded-vs-themed inconsistency).
//
// Values are lifted from the canonical host theme
// (alethic-ism-ui-enterprise/src/themes/midnightlab.js + components/input.js) so
// provider-less rendering matches the studio. Only the keys components actually
// dereference are included (see docs/THEME_AND_COMPONENT_AUDIT.md). Hosts still
// override the whole thing via <ThemeProvider theme={…}>.
export const defaultTheme: Theme = {
    bg: 'bg-midnight-base',
    bgSecondary: 'bg-midnight-surface',
    text: 'text-midnight-text-body text-xs',
    textMuted: 'text-midnight-accent',
    textAccent: 'text-midnight-accent-bright',
    glowColor: 'rgb(99, 102, 241)',
    border: 'border-midnight-border',
    hover: 'hover:bg-midnight-elevated hover:text-midnight-text-primary',
    icon: 'text-midnight-text-subdued',
    font: 'font-ibm-plex',

    input: {
        primary: 'bg-midnight-base border-midnight-border text-midnight-text-body placeholder-midnight-text-disabled focus:border-midnight-info-bright focus:ring-1 focus:ring-midnight-info/50 transition-all duration-200',
        secondary: 'bg-midnight-surface border-midnight-border-subtle text-midnight-text-secondary placeholder-midnight-text-disabled focus:border-midnight-accent focus:ring-1 focus:ring-midnight-accent/50 transition-all duration-200',
        danger: 'bg-midnight-base border-midnight-danger text-midnight-text-secondary placeholder-midnight-text-disabled focus:border-midnight-danger-bright focus:ring-1 focus:ring-midnight-danger/50 transition-all duration-200',
        success: 'bg-midnight-base border-midnight-success text-midnight-text-secondary placeholder-midnight-text-disabled focus:border-midnight-success-bright focus:ring-1 focus:ring-midnight-success/50 transition-all duration-200',
        warning: 'bg-midnight-base border-midnight-warning text-midnight-text-secondary placeholder-midnight-text-disabled focus:border-midnight-warning-bright focus:ring-1 focus:ring-midnight-warning/50 transition-all duration-200',
        info: 'bg-midnight-base border-midnight-info text-midnight-text-secondary placeholder-midnight-text-disabled focus:border-midnight-info-bright focus:ring-1 focus:ring-midnight-info/50 transition-all duration-200',
        ghost: 'bg-transparent border-midnight-border text-midnight-text-body placeholder-midnight-text-disabled focus:border-midnight-accent focus:ring-1 focus:ring-midnight-accent/50 transition-all duration-200',
        disabled: 'bg-midnight-surface border-midnight-border text-midnight-text-disabled placeholder-midnight-text-hint cursor-not-allowed',
    },

    button: {
        primary: 'bg-midnight-info hover:bg-midnight-info-bright hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] text-white border border-midnight-info-bright/50 hover:border-midnight-info-bright active:bg-midnight-info transition-all duration-150',
        secondary: 'bg-midnight-surface hover:bg-midnight-raised hover:border-midnight-accent/60 hover:text-midnight-accent-bright text-midnight-text-secondary border border-midnight-border active:bg-midnight-elevated transition-all duration-150',
        ghost: 'bg-transparent hover:bg-midnight-elevated hover:text-midnight-accent-bright hover:border-midnight-accent text-midnight-text-body border border-midnight-border active:bg-midnight-raised transition-all duration-150',
        danger: 'bg-midnight-danger hover:bg-midnight-danger-bright hover:shadow-[0_0_12px_rgba(239,68,68,0.5)] text-white border border-midnight-danger-bright/50 hover:border-midnight-danger-bright active:bg-midnight-danger transition-all duration-150',
        success: 'bg-midnight-success hover:bg-midnight-success-bright hover:shadow-[0_0_12px_rgba(34,197,94,0.5)] text-white border border-midnight-success-bright/50 hover:border-midnight-success-bright active:bg-midnight-success transition-all duration-150',
        warning: 'bg-midnight-warning hover:bg-midnight-warning-bright hover:shadow-[0_0_12px_rgba(234,179,8,0.4)] text-midnight-base border border-midnight-warning-bright/50 hover:border-midnight-warning-bright active:bg-midnight-warning transition-all duration-150',
        info: 'bg-midnight-info hover:bg-midnight-info-bright hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] text-white border border-midnight-info-bright/50 hover:border-midnight-info-bright active:bg-midnight-info transition-all duration-150',
        disabled: 'bg-midnight-surface text-midnight-text-disabled cursor-not-allowed border border-midnight-border',
    },

    default: {
        text: {
            primary: 'text-midnight-text-primary',
            secondary: 'text-midnight-text-secondary',
            muted: 'text-midnight-text-subdued',
            danger: 'text-midnight-danger',
            accent: 'text-midnight-accent',
        },
    },

    hoverMenu: {
        trigger: 'text-midnight-text-secondary hover:bg-midnight-elevated hover:text-midnight-text-primary',
        content: 'bg-midnight-surface border border-midnight-border shadow-midnight-glow',
        item: 'text-midnight-text-secondary hover:bg-midnight-elevated hover:text-midnight-accent-bright focus:bg-midnight-elevated',
        subItems: {
            content: 'bg-midnight-surface border border-midnight-border-subtle shadow-midnight-glow-sm',
            item: 'text-midnight-text-secondary hover:bg-midnight-elevated hover:text-midnight-accent-bright focus:bg-midnight-elevated',
        },
    },

    tab: {
        section: {
            header: 'bg-midnight-surface',
            hover: 'hover:bg-midnight-elevated',
        },
    },

    datatable: {
        header: 'bg-midnight-elevated hover:bg-midnight-raised border-b border-r border-midnight-border px-2 py-2 text-left text-midnight-text-label transition-colors duration-150',
    },

    effects: {
        enableScanlines: false,
        enableCrt: false,
        scanlineClass: '',
        crtClass: '',
    },
};

export default defaultTheme;
