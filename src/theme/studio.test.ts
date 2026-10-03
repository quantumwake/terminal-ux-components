import { describe, it, expect } from 'vitest';
import { studio } from './studio';

describe('studio tokens', () => {
    it('matches the app v2 mockup colours', () => {
        expect(studio.ground).toBe('#0f0e0d');
        expect(studio.header).toBe('#141210');
        expect(studio.panel).toBe('#151311');
        expect(studio.card).toBe('#1a1714');
        expect(studio.line).toBe('#2a2622');
        expect(studio.text).toBe('#ece6df');
        expect(studio.textMuted).toBe('#c9c0b6');
        expect(studio.textFaint).toBe('#a39a90');
        expect(studio.accent).toBe('#e8743b');
        expect(studio.job).toEqual({
            coordinator: '#f2b35b',
            builder: '#e8743b',
            reviewer: '#6ea8d9',
            security: '#c79bd8',
            person: '#9fd39b',
        });
    });
});
