// Studio tokens from the app v2 mockups (docs/design/mockups/app-v2).
// Components that draw those screens read these values directly, so a
// missing Tailwind colour cannot drift them.
//
// Each colour is a CSS variable (--studio-<name>) whose fallback is the
// dark (Oxide) value, so a page that sets no variables draws exactly as
// before, and a theme is the variables set on an ancestor (studioThemeVars).

type Palette = {
    ground: string;
    header: string;
    panel: string;
    card: string;
    // A picked row (board 4's selected shell).
    selected: string;
    // The selected segment of a segmented control (the header nav, a tab
    // strip), on the track. Its own token, so a light theme can make it
    // stand off the track while cards keep selected.
    segment: string;
    line: string;
    text: string;
    textMuted: string;
    textFaint: string;
    textQuiet: string;
    // A post's body text (board 1).
    textBody: string;
    // The faintest text: positions, an inactive chevron.
    textDim: string;
    accent: string;
    // The border of something waiting on you, or with no objective.
    accentLine: string;
    // Text on an accent or person-green fill.
    ink: string;
    personInk: string;
    notice: string;
    link: string;
    inspector: string;
    terminal: string;
    dashed: string;
    // A segmented control's track, a milestone strip.
    track: string;
    // A row waiting on you (RailList).
    waitingSurface: string;
    // The picked row of a table, and a table's row rule.
    rowSelected: string;
    rule: string;
    // A thread's reply rule.
    threadRule: string;
    // A workflow row that is on.
    activeSurface: string;
    // A splitter's line between panes at rest: at least 3:1 against every
    // surface a divider sits between (statefs.ai v3-3). Not the pane grip
    // icon's colour, which hosts set as --studio-grip.
    splitter: string;
    job: {
        coordinator: string;
        builder: string;
        reviewer: string;
        security: string;
        person: string;
    };
};

// The dark (Oxide) palette: the values every board was drawn with.
export const studioDark: Palette = {
    ground: '#0f0e0d',
    header: '#141210',
    panel: '#151311',
    card: '#1a1714',
    selected: '#2b2520',
    segment: '#2b2520',
    line: '#2a2622',
    text: '#ece6df',
    textMuted: '#c9c0b6',
    textFaint: '#a39a90',
    textQuiet: '#8a8178',
    textBody: '#e2dbd2',
    textDim: '#6a6158',
    accent: '#e8743b',
    accentLine: '#6a3e22',
    ink: '#160d07',
    personInk: '#0d1a0c',
    notice: '#f3d2b0',
    link: '#f0a070',
    inspector: '#131110',
    terminal: '#0a0908',
    dashed: '#3a342e',
    track: '#1c1a17',
    waitingSurface: '#1a1612',
    rowSelected: '#221d19',
    rule: '#221f1b',
    threadRule: '#1d1a17',
    activeSurface: '#1f1a16',
    splitter: '#7d7369',
    job: {
        coordinator: '#f2b35b',
        builder: '#e8743b',
        reviewer: '#6ea8d9',
        security: '#c79bd8',
        person: '#9fd39b',
    },
};

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

// varName is a token's CSS variable: textMuted is --studio-text-muted, and
// job.reviewer is --studio-job-reviewer.
export function varName(token: string): string {
    return `--studio-${token.split('.').map(kebab).join('-')}`;
}

const asVar = (token: string, fallback: string) => `var(${varName(token)}, ${fallback})`;

const colours = Object.fromEntries(
    Object.entries(studioDark)
        .filter(([, v]) => typeof v === 'string')
        .map(([k, v]) => [k, asVar(k, v as string)]),
) as Omit<Palette, 'job'>;

const job = Object.fromEntries(
    Object.entries(studioDark.job).map(([k, v]) => [k, asVar(`job.${k}`, v)]),
) as Palette['job'];

export const studio = {
    ...colours,
    job,
    font: '"IBM Plex Sans", sans-serif',
    mono: '"IBM Plex Mono", monospace',
} as const;

export type StudioTokens = typeof studio;

// studioThemeVars is a palette as the CSS variables that apply it: set them
// on :root (or any ancestor) and every Studio component below takes them.
export function studioThemeVars(palette: Palette): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(palette)) {
        if (k === 'job') continue;
        out[varName(k)] = v as string;
    }
    for (const [k, v] of Object.entries(palette.job)) out[varName(`job.${k}`)] = v;
    return out;
}

export type StudioPalette = Palette;
