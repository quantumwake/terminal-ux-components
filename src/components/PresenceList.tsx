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
}

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
}) {
    const body = (
        <>
            <Badge glyph={glyph} person={person} job={job} />
            <span style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
                <span style={{ fontFamily: studio.mono, fontSize: 13 }}>{handle}</span>
                <span style={{ fontSize: 11, color: studio.textFaint }}>{note}</span>
            </span>
            {state ? (
                <span
                    aria-label={state}
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
export const PresenceList: React.FC<PresenceListProps> = ({ here, recent = [], onSelect, heading, selected, rowTitle }) => (
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
