import React from 'react';
import { studio } from '../theme/studio';

// An agent's state, as Studio draws it everywhere an agent appears (the
// channel rail, the Agents page, a pane header). Each state has its own
// colour, its own motion and a word, so it reads at a glance, in greyscale
// and for colour-blind people (Kasra, product proposals @1251).
//
//   starting   the session is coming up
//   thinking   a prompt is in, no tool running yet
//   working    running a tool
//   waiting    its work waits on a person (an approval, a review)
//   listening  stopped, waiting for posts
//   gone       no ping for a while, or the shell isn't running
export type AgentStateName = 'starting' | 'thinking' | 'working' | 'waiting' | 'listening' | 'gone';

export interface AgentStateLook {
    // The dot's colour; for gone, the colour of its hollow ring.
    color: string;
    // The state's word, drawn after the dot.
    word: string;
    // True when the state is someone acting (starting, thinking, working).
    busy: boolean;
}

export const AGENT_STATES: Record<AgentStateName, AgentStateLook> = {
    starting: { color: studio.job.reviewer, word: 'starting', busy: true },
    thinking: { color: studio.job.security, word: 'thinking', busy: true },
    working: { color: studio.accent, word: 'working', busy: true },
    waiting: { color: studio.waiting, word: 'waiting on you', busy: false },
    listening: { color: studio.job.person, word: 'listening', busy: false },
    gone: { color: studio.textQuiet, word: 'gone', busy: false },
};

// shownText is text an agent set (an activity word, a since), made safe to
// draw next to other people's: control, format and line/paragraph separator
// characters are dropped, except the zero-width joiners that some scripts
// need (security, product proposals @1289). bdi around it keeps its
// direction from spilling.
export function shownText(s: string | undefined): string {
    return (s ?? '').replace(/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu, (c) => (c === '\u200C' || c === '\u200D' ? c : '')).trim();
}

export function isAgentState(s: unknown): s is AgentStateName {
    return typeof s === 'string' && Object.prototype.hasOwnProperty.call(AGENT_STATES, s);
}

// The motions. Each is opacity, transform or a box-shadow, so nothing moves
// the layout; class names are prefixed so a host's styles never collide.
// Under prefers-reduced-motion nothing moves, and the states keep apart by
// shape: working and listening are filled, thinking is half filled, starting
// is a ring, waiting is filled with a halo, gone is a hollow dashed ring.
export const AGENT_STATE_CSS = `
.tuxc-state-working { animation: tuxc-state-pulse 1.2s ease-in-out infinite; }
.tuxc-state-thinking { animation: tuxc-state-breathe 2.4s ease-in-out infinite; }
.tuxc-state-starting { animation: tuxc-state-spin 1s linear infinite; }
.tuxc-state-waiting { animation: tuxc-state-blink 1s steps(2, jump-none) infinite; }
@keyframes tuxc-state-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.85); } }
@keyframes tuxc-state-breathe { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
@keyframes tuxc-state-spin { to { transform: rotate(360deg); } }
@keyframes tuxc-state-blink { 0% { opacity: 1; } 100% { opacity: 0.25; } }
@media (prefers-reduced-motion: reduce) {
  .tuxc-state-working, .tuxc-state-thinking, .tuxc-state-starting, .tuxc-state-waiting { animation: none; }
}
`;

// knownState is a state as given, or fallback for a name this library does
// not know: a typo, or a newer parley's state. A presence state comes from an
// agent, so an unknown one must draw something, never throw and blank the
// list (security @1295).
export function knownState(state: unknown, fallback: AgentStateName = 'listening'): AgentStateName {
    return isAgentState(state) ? state : fallback;
}

function dotStyle(state: AgentStateName, size: number): React.CSSProperties {
    const { color } = AGENT_STATES[state];
    // Round even under --studio-radius: 0. A state dot is a signal, not a
    // container's corner, and round keeps starting's open ring and thinking's
    // half fill legible (champion @1293). radius.test.ts allows this one.
    const base: React.CSSProperties = { display: 'inline-block', width: size, height: size, borderRadius: '50%' /* state dot */, flexShrink: 0, boxSizing: 'border-box' };
    switch (state) {
        case 'starting':
            return { ...base, border: `2px solid ${color}`, borderTopColor: 'transparent' };
        case 'thinking':
            return { ...base, border: `1.5px solid ${color}`, background: `linear-gradient(to top, ${color} 50%, transparent 50%)` };
        case 'waiting':
            return { ...base, background: color, boxShadow: `0 0 0 2px ${studio.ground}, 0 0 0 3.5px ${color}` };
        case 'gone':
            return { ...base, borderWidth: 1, borderStyle: 'dashed', borderColor: color };
        default:
            return { ...base, background: color };
    }
}

export interface AgentStateDotProps {
    state: AgentStateName;
    size?: number;
    // animate gives a busy or waiting state its motion. Off, the dot is still.
    animate?: boolean;
    // The accessible name; the state's word when not given.
    label?: string;
}

// AgentStateDot is the state on its own: a dot with the state's colour and,
// with animate, its motion. It is an image whose name is the state's word.
export const AgentStateDot: React.FC<AgentStateDotProps> = ({ state: given, size = 9, animate = false, label }) => {
    const state = knownState(given);
    const moving = animate && state !== 'listening' && state !== 'gone';
    return (
        <span
            role="img"
            aria-label={label ?? AGENT_STATES[state].word}
            data-state={state}
            className={moving ? `tuxc-state-${state}` : undefined}
            style={dotStyle(state, size)}
        />
    );
};

export interface AgentStateLabelProps {
    state: AgentStateName;
    // since is how long it has been in this state, or its last activity, as
    // the host words it ("2m", "last post 4m ago"). Drawn after the word.
    since?: string;
    // word replaces the state's own word (an agent's activity, "writing").
    word?: string;
    animate?: boolean;
    size?: number;
}

// AgentStateLabel is the dot, the word in the state's colour and, faint, the
// since: "● working · 2m". Text is plain, and drawn isolated (bdi), since a
// word or since can come from an agent.
export const AgentStateLabel: React.FC<AgentStateLabelProps> = ({ state: given, since, word, animate = false, size = 9 }) => {
    const state = knownState(given);
    const look = AGENT_STATES[state];
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: studio.font, fontSize: 12, minWidth: 0 }}>
            <AgentStateDot state={state} size={size} animate={animate} />
            <bdi style={{ color: state === 'gone' ? studio.textFaint : look.color }}>{shownText(word) || look.word}</bdi>
            {shownText(since) ? (
                <span style={{ color: studio.textFaint }}>
                    {' · '}
                    <bdi>{shownText(since)}</bdi>
                </span>
            ) : null}
        </span>
    );
};

// AgentStateStyles adds the motions once, for a screen that draws dots with
// animate. Components in this library that animate add it themselves.
export const AgentStateStyles: React.FC = () => <style>{AGENT_STATE_CSS}</style>;

export default AgentStateLabel;
