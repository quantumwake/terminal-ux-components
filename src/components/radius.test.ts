/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';

// Every Studio corner goes through radius(), so --studio-radius: 0 squares
// them all (statefs.ai v3-2). A raw borderRadius in one component would stay
// rounded under straight edges and no rendering test would notice
// (reviewer, #50). The Terminal* components are Classic's and keep their own
// classes.
const sources = import.meta.glob('./*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

describe('studio corners', () => {
    it('every borderRadius in the Studio components goes through radius()', () => {
        const raw: string[] = [];
        let scanned = 0;
        for (const [path, text] of Object.entries(sources)) {
            const file = path.replace('./', '');
            if (file.includes('.test.') || file.startsWith('Terminal')) continue;
            scanned += 1;
            text.split('\n').forEach((line, i) => {
                for (const m of line.matchAll(/borderRadius:\s*([^,}\n]+)/g)) {
                    if (!m[1].trim().startsWith('radius(')) raw.push(`${file}:${i + 1} ${m[0].trim()}`);
                }
            });
        }
        expect(scanned).toBeGreaterThan(20);
        expect(raw).toEqual([]);
    });
});
