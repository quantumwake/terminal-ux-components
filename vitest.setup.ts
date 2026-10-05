import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// @testing-library/react's auto-cleanup registers itself via the global
// afterEach — which we don't enable (see vitest.config.ts: globals: false,
// to keep `tsc --noEmit` clean without a vitest/globals types dependency).
// Unmount explicitly after every test instead.
afterEach(cleanup);

// Studio colours are CSS variables with a fallback (theme/studio.ts), which
// jsdom keeps on the element's own style but not in its computed style, so
// colour assertions read the inline style: toHaveInlineStyle({ color: studio.link }).
expect.extend({
    toHaveInlineStyle(el: HTMLElement, want: Record<string, string>) {
        const wrong = Object.entries(want).filter(([k, v]) => (el.style as unknown as Record<string, string>)[k] !== v);
        return {
            pass: wrong.length === 0,
            message: () =>
                wrong.map(([k, v]) => `${k}: expected ${v}, got ${(el.style as unknown as Record<string, string>)[k] || '(none)'}`).join('\n'),
        };
    },
});
