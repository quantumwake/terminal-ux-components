import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { studio } from '../theme/studio';
import { AGENT_STATES, AGENT_STATE_CSS, AgentStateDot, AgentStateLabel, isAgentState, shownText, type AgentStateName } from './AgentState';

const ALL: AgentStateName[] = ['starting', 'thinking', 'working', 'waiting', 'listening', 'gone'];

describe('agent states', () => {
    it('gives every state its own colour and its own word', () => {
        const colours = ALL.map((s) => AGENT_STATES[s].color);
        const words = ALL.map((s) => AGENT_STATES[s].word);
        expect(new Set(colours).size).toBe(ALL.length);
        expect(new Set(words).size).toBe(ALL.length);
        expect(AGENT_STATES.working.color).toBe(studio.accent);
        expect(AGENT_STATES.listening.color).toBe(studio.job.person);
        expect(AGENT_STATES.waiting.color).toBe(studio.waiting);
    });

    it('marks only starting, thinking and working as busy', () => {
        expect(ALL.filter((s) => AGENT_STATES[s].busy)).toEqual(['starting', 'thinking', 'working']);
    });

    it('knows its states and nothing else', () => {
        for (const s of ALL) expect(isAgentState(s)).toBe(true);
        expect(isAgentState('here')).toBe(false);
        expect(isAgentState('toString')).toBe(false);
        expect(isAgentState(undefined)).toBe(false);
    });
});

describe('AgentStateDot', () => {
    it('is an image named by its state, and still unless asked', () => {
        render(<AgentStateDot state="thinking" />);
        const dot = screen.getByRole('img', { name: 'thinking' });
        expect(dot).toHaveAttribute('data-state', 'thinking');
        expect(dot.className).toBe('');
    });

    it('moves the four states that should, and never listening or gone', () => {
        const { container } = render(
            <>
                {ALL.map((s) => (
                    <AgentStateDot key={s} state={s} animate />
                ))}
            </>,
        );
        const cls = (s: AgentStateName) => container.querySelector(`[data-state="${s}"]`)?.className;
        expect(cls('starting')).toBe('tuxc-state-starting');
        expect(cls('thinking')).toBe('tuxc-state-thinking');
        expect(cls('working')).toBe('tuxc-state-working');
        expect(cls('waiting')).toBe('tuxc-state-waiting');
        expect(cls('listening')).toBe('');
        expect(cls('gone')).toBe('');
    });

    it('draws each state as a different shape, so they differ without colour or motion', () => {
        const { container } = render(
            <>
                {ALL.map((s) => (
                    <AgentStateDot key={s} state={s} />
                ))}
            </>,
        );
        const style = (s: AgentStateName) => (container.querySelector(`[data-state="${s}"]`) as HTMLElement).style;
        expect(style('working').background).toContain('studio-accent');
        expect(style('starting').borderTopColor).toBe('transparent');
        expect(style('thinking').background).toContain('linear-gradient');
        expect(style('waiting').boxShadow).not.toBe('');
        expect(style('gone').borderStyle).toBe('dashed');
        expect(style('gone').background).toBe('');
    });

    it('never lets a working dot look empty mid-pulse: its trough stays at 60% and 85% size (champion @1316)', () => {
        const pulse = AGENT_STATE_CSS.match(/@keyframes tuxc-state-pulse \{([^\n]*)\}/)?.[1] ?? '';
        const trough = pulse.match(/50% \{ opacity: ([\d.]+); transform: scale\(([\d.]+)\); \}/);
        expect(trough).not.toBeNull();
        expect(Number(trough![1])).toBeGreaterThanOrEqual(0.6);
        expect(Number(trough![2])).toBeGreaterThanOrEqual(0.85);
    });

    it('keeps its motions off for reduced motion', () => {
        expect(AGENT_STATE_CSS).toContain('@keyframes tuxc-state-pulse');
        expect(AGENT_STATE_CSS).toContain('@keyframes tuxc-state-breathe');
        expect(AGENT_STATE_CSS).toContain('@keyframes tuxc-state-spin');
        expect(AGENT_STATE_CSS).toContain('@keyframes tuxc-state-blink');
        expect(AGENT_STATE_CSS).toMatch(/prefers-reduced-motion: reduce\)[\s\S]*animation: none/);
    });
});

describe('AgentStateLabel', () => {
    it('says the state, in its colour, and how long', () => {
        render(<AgentStateLabel state="working" since="2m" />);
        expect(screen.getByRole('img', { name: 'working' })).toBeInTheDocument();
        expect(screen.getByText('working')).toHaveInlineStyle({ color: studio.accent });
        expect(screen.getByText('2m')).toBeInTheDocument();
    });

    it('takes an activity word in place of its own', () => {
        render(<AgentStateLabel state="working" word="writing" />);
        expect(screen.getByText('writing')).toBeInTheDocument();
        expect(screen.queryByText('working')).toBeNull();
    });

    it('draws an agent’s text as isolated plain text, without controls', () => {
        const { container } = render(<AgentStateLabel state="thinking" word={'‮evil\u0007'} since={'<b>4m</b> '} />);
        expect(container.querySelector('b')).toBeNull();
        const [word, since] = Array.from(container.querySelectorAll('bdi'));
        expect(word.textContent).toBe('evil');
        expect(since.textContent).toBe('<b>4m</b>');
    });
});

describe('shownText', () => {
    it('drops control, format and separator characters, and keeps the joiners', () => {
        expect(shownText('a\u0000b​c‮d e f')).toBe('abcdef');
        expect(shownText('क्‍ष')).toBe('क्‍ष');
        expect(shownText('a‌b')).toBe('a‌b');
        expect(shownText(undefined)).toBe('');
        expect(shownText('  working  ')).toBe('working');
    });
});

describe('an unknown state (security @1295)', () => {
    it('draws as listening, never throws', () => {
        const odd = 'rate-limited' as unknown as AgentStateName;
        render(<AgentStateDot state={odd} />);
        expect(screen.getByRole('img', { name: 'listening' })).toHaveAttribute('data-state', 'listening');
        render(<AgentStateLabel state={odd} since="1m" />);
        expect(screen.getByText('1m')).toBeInTheDocument();
    });
});
