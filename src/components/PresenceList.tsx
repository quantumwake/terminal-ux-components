import React from 'react';
import { studio, radius } from '../theme/studio';
import type { Job } from './AgentBadge';

// Board 1's rail. Agents appear while they listen on this channel and leave
// when they stop. Nobody is added by hand.
const footnote =
    'Click one to see what it is doing. From presence: agents show up when they listen here and drop off when they stop. Nobody is added by hand. An agent with no persona given is General: it can do anything until it is given one.';

export interface PresenceHere {
    id: string;
    glyph: string;
    person?: boolean;
    job?: Job;
    handle: string;
    note: string;
    state: 'here' | 'working';
    href?: string;
    // activity is what a working seat is doing, as one word from presence
    // (thinking, writing, working, starting). It is drawn after the note.
    activity?: string;
}

export interface PresenceRecent {
    id: string;
    glyph: string;
    person?: boolean;
    job?: Job;
    handle: string;
    note: string;
}

export interface PresenceListProps {
    here: PresenceHere[];
    recent?: PresenceRecent[];
    onSelect?: (id: string) => void;
    // selected is the id of the row a screen has picked (a channel filtered
    // to that seat's posts). It is ringed and marked pressed or current.
    selected?: string;
    // rowTitle is a here-now row's tooltip, for what a click does on this
    // screen (a channel filters to the seat's posts). Without it a row says
    // it opens the seat's terminal.
    rowTitle?: (row: PresenceHere) => string;
    // heading replaces the default "Here now · N" row, in the same place and
    // gap, so a screen can draw its own row (a fold button beside the count).
    heading?: React.ReactNode;
    // animate makes a working seat look busy at a glance: its dot pulses and
    // its activity sweeps the accent across the word with running dots.
    // Under prefers-reduced-motion only a slow pulse is left. Off, the rail
    // draws as it always has.
    animate?: boolean;
}

// The busy look, ported from the portal's Classic presence (index.css
// .presence-busy, .presence-dot-busy, .presence-ellipsis). Class names are
// prefixed so a host's own styles never collide. Every effect is opacity,
// transform or a background, so nothing moves the layout.
export const PRESENCE_BUSY_CSS = `
.tuxc-presence-pulse { animation: tuxc-presence-pulse 1.2s ease-in-out infinite; }
.tuxc-presence-sweep {
  color: ${studio.accent};
  background: linear-gradient(90deg, ${studio.textFaint} 0%, ${studio.accent} 45%, ${studio.accent} 55%, ${studio.textFaint} 100%);
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: tuxc-presence-sweep 1.6s linear infinite;
}
.tuxc-presence-dots::after {
  content: '';
  display: inline-block;
  width: 1.5ch;
  text-align: left;
  color: ${studio.accent};
  -webkit-text-fill-color: ${studio.accent};
  animation: tuxc-presence-dots 1.2s steps(4, end) infinite;
}
@keyframes tuxc-presence-sweep { from { background-position: 100% 0; } to { background-position: -150% 0; } }
@keyframes tuxc-presence-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.35; transform: scale(0.7); } }
@keyframes tuxc-presence-dots { 0% { content: ''; } 25% { content: '.'; } 50% { content: '..'; } 75% { content: '...'; } }
@media (prefers-reduced-motion: reduce) {
  .tuxc-presence-sweep { animation: none; background: none; -webkit-text-fill-color: ${studio.accent}; }
  .tuxc-presence-dots::after { animation: none; content: '\\2026'; }
  .tuxc-presence-pulse { animation-duration: 2.4s; }
}
`;

function Badge({ glyph, person, job = 'builder' }: { glyph: string; person?: boolean; job?: Job }) {
    return (
        <span
            aria-hidden
            style={{
                width: 28,
                height: 28,
                flexShrink: 0,
                borderRadius: radius(person ? '50%' : 7),
                background: person ? studio.job.person : studio.job[job],
                color: studio.ink,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: studio.mono,
                fontWeight: 600,
                fontSize: 11,
            }}
        >
            {glyph}
        </span>
    );
}

function Heading({ children, lift }: { children: React.ReactNode; lift?: boolean }) {
    return (
        <span
            style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: studio.textFaint,
                marginTop: lift ? 4 : 0,
            }}
        >
            {children}
        </span>
    );
}

function Row({
    glyph,
    person,
    job,
    handle,
    note,
    state,
    href,
    onClick,
    selected,
    title = 'Open its terminal, recorded session and work',
    activity,
    animate,
}: {
    glyph: string;
    person?: boolean;
    job?: Job;
    handle: string;
    note: string;
    state?: 'here' | 'working';
    href?: string;
    onClick?: () => void;
    selected?: boolean;
    title?: string;
    activity?: string;
    animate?: boolean;
}) {
    const busy = state === 'working';
    const word = busy ? activity?.trim() : '';
    const body = (
        <>
            <Badge glyph={glyph} person={person} job={job} />
            <span style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
                <span style={{ fontFamily: studio.mono, fontSize: 13 }}>{handle}</span>
                <span style={{ fontSize: 11, color: studio.textFaint }}>
                    {note}
                    {word ? (
                        <>
                            {note ? ' · ' : null}
                            <span className={animate ? 'tuxc-presence-sweep' : undefined} style={animate ? undefined : { color: studio.accent }}>
                                {word}
                            </span>
                            {animate ? <span className="tuxc-presence-dots" aria-hidden /> : null}
                        </>
                    ) : null}
                </span>
            </span>
            {state ? (
                <span
                    aria-label={state}
                    className={animate && busy ? 'tuxc-presence-pulse' : undefined}
                    style={{
                        width: 9,
                        height: 9,
                        borderRadius: radius('50%'),
                        flexShrink: 0,
                        background: state === 'working' ? studio.accent : studio.job.person,
                    }}
                />
            ) : null}
        </>
    );
    const shared: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        color: studio.text,
        textDecoration: 'none',
        padding: state ? 4 : 0,
        borderRadius: radius(8),
        font: 'inherit',
        textAlign: 'left',
        background: selected ? studio.selected : 'none',
        border: 'none',
        boxShadow: selected ? `inset 0 0 0 1px ${studio.accent}` : 'none',
        width: '100%',
        boxSizing: 'border-box',
    };
    if (!state) {
        return (
            <div style={{ ...shared, opacity: 0.6, cursor: 'default' }}>
                {body}
            </div>
        );
    }
    if (href) {
        return (
            <a href={href} title={title} aria-current={selected ? 'true' : undefined} onClick={onClick} style={{ ...shared, cursor: 'pointer' }}>
                {body}
            </a>
        );
    }
    return (
        <button type="button" title={title} aria-pressed={selected === undefined ? undefined : selected} onClick={onClick} style={{ ...shared, cursor: 'pointer' }}>
            {body}
        </button>
    );
}

// PresenceList is the Here now rail on board 1. here is listening now;
// recent has dropped off. A row with a person draws a circle; an agent draws
// a square in its job colour. text is plain.
export const PresenceList: React.FC<PresenceListProps> = ({ here, recent = [], onSelect, heading, selected, rowTitle, animate = false }) => (
    <section
        aria-label="Who is here"
        style={{
            boxSizing: 'border-box',
            width: '100%',
            background: studio.inspector,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            fontFamily: studio.font,
            color: studio.text,
        }}
    >
        {animate && here.some((a) => a.state === 'working') ? <style>{PRESENCE_BUSY_CSS}</style> : null}
        {heading ?? <Heading>Here now · {here.length}</Heading>}
        {here.map((a) => (
            <Row
                key={a.id}
                glyph={a.glyph}
                person={a.person}
                job={a.job}
                handle={a.handle}
                note={a.note}
                state={a.state}
                href={a.href}
                onClick={onSelect ? () => onSelect(a.id) : undefined}
                selected={selected === undefined ? undefined : selected === a.id}
                title={rowTitle?.(a)}
                activity={a.activity}
                animate={animate}
            />
        ))}
        {recent.length ? <Heading lift>Recently here</Heading> : null}
        {recent.map((a) => (
            <Row key={a.id} glyph={a.glyph} person={a.person} job={a.job} handle={a.handle} note={a.note} />
        ))}
        <span style={{ fontSize: 12, color: studio.textFaint, lineHeight: 1.5 }}>{footnote}</span>
    </section>
);

export default PresenceList;
