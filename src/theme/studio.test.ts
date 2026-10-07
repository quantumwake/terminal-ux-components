import { describe, it, expect } from 'vitest';
import { radius, studio, studioDark, studioThemeVars, varName } from './studio';

describe('studio tokens', () => {
    it('keeps the app v2 mockup colours as the dark palette', () => {
        expect(studioDark.ground).toBe('#0f0e0d');
        expect(studioDark.header).toBe('#141210');
        expect(studioDark.panel).toBe('#151311');
        expect(studioDark.card).toBe('#1a1714');
        expect(studioDark.line).toBe('#2a2622');
        expect(studioDark.segment).toBe(studioDark.selected);
        expect(studioDark.text).toBe('#ece6df');
        expect(studioDark.textMuted).toBe('#c9c0b6');
        expect(studioDark.textFaint).toBe('#a39a90');
        expect(studioDark.accent).toBe('#e8743b');
        expect(studioDark.ink).toBe('#160d07');
        expect(studioDark.notice).toBe('#f3d2b0');
        expect(studioDark.link).toBe('#f0a070');
        expect(studioDark.inspector).toBe('#131110');
        expect(studioDark.terminal).toBe('#0a0908');
        expect(studioDark.dashed).toBe('#3a342e');
        expect(studioDark.textQuiet).toBe('#8a8178');
        expect(studioDark.job).toEqual({
            coordinator: '#f2b35b',
            builder: '#e8743b',
            reviewer: '#6ea8d9',
            security: '#c79bd8',
            person: '#9fd39b',
        });
    });

    it('is a CSS variable per colour, falling back to the dark value, so nothing changes until a theme sets them', () => {
        expect(studio.ground).toBe('var(--studio-ground, #0f0e0d)');
        expect(studio.textMuted).toBe('var(--studio-text-muted, #c9c0b6)');
        expect(studio.job.reviewer).toBe('var(--studio-job-reviewer, #6ea8d9)');
        expect(studio.font).toBe('"IBM Plex Sans", sans-serif');
        for (const [k, v] of Object.entries(studioDark)) {
            if (k !== 'job') expect((studio as Record<string, unknown>)[k]).toBe(`var(${varName(k)}, ${v})`);
        }
    });

    it('turns a palette into the variables that apply it', () => {
        const vars = studioThemeVars({ ...studioDark, ground: '#ffffff', job: { ...studioDark.job, person: '#2a7a2a' } });
        expect(vars['--studio-ground']).toBe('#ffffff');
        expect(vars['--studio-job-person']).toBe('#2a7a2a');
        expect(vars['--studio-accent-line']).toBe('#6a3e22');
        expect(Object.keys(vars)).toHaveLength(Object.keys(studioDark).length - 1 + Object.keys(studioDark.job).length);
    });
});

describe('radius', () => {
    it('scales a corner by --studio-radius, so one variable set to 0 squares every corner', () => {
        expect(radius(8)).toBe('calc(var(--studio-radius, 1) * 8px)');
        expect(radius('50%')).toBe('calc(var(--studio-radius, 1) * 50%)');
    });
});
