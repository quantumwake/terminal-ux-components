// Studio tokens from the app v2 mockups (docs/design/mockups/app-v2).
// Components that draw those screens read these values directly, so a
// missing Tailwind colour cannot drift them.
export const studio = {
    ground: '#0f0e0d',
    header: '#141210',
    panel: '#151311',
    card: '#1a1714',
    line: '#2a2622',
    text: '#ece6df',
    textMuted: '#c9c0b6',
    textFaint: '#a39a90',
    accent: '#e8743b',
    job: {
        coordinator: '#f2b35b',
        builder: '#e8743b',
        reviewer: '#6ea8d9',
        security: '#c79bd8',
        person: '#9fd39b',
    },
    font: '"IBM Plex Sans", sans-serif',
    mono: '"IBM Plex Mono", monospace',
} as const;

export type StudioTokens = typeof studio;
