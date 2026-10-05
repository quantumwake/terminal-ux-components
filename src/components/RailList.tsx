import React from 'react';
import { studio } from '../theme/studio';
import type { Job } from './AgentBadge';

// The waiting row on board 5. Same warm border as a yours card.
const waiting = { background: studio.waitingSurface, border: studio.accentLine, detail: studio.link };

const stateColor: Record<string, string> = {
    working: studio.accent,
    listening: studio.job.reviewer,
    online: studio.job.person,
};

export interface RailWork {
    title: string;
    detail: string;
    yours?: boolean;
}

export interface RailMember {
    glyph: string;
    person?: boolean;
    job?: Job;
    name: string;
    state: string;
}

export interface RailListProps {
    work: RailWork[];
    members: RailMember[];
    onOpen?: (index: number) => void;
}

function Badge({ glyph, person, job = 'builder' }: { glyph: string; person?: boolean; job?: Job }) {
    return (
        <span
            aria-hidden
            style={{
                width: 22,
                height: 22,
                flexShrink: 0,
                borderRadius: person ? '50%' : 5,
                background: person ? studio.job.person : studio.job[job],
                color: studio.ink,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: studio.mono,
                fontWeight: 600,
                fontSize: 9,
            }}
        >
            {glyph}
        </span>
    );
}

// RailList is the right rail on board 5: the work open on this channel,
// and who hears it. Titles and names are plain strings.
export const RailList: React.FC<RailListProps> = ({ work, members, onOpen }) => (
    <aside
        aria-label="On this channel"
        style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            flexShrink: 0,
            borderLeft: `1px solid ${studio.line}`,
            background: studio.inspector,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            fontFamily: studio.font,
            color: studio.text,
        }}
    >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: studio.textFaint }}>
                Open work here · {work.length}
            </span>
            {work.map((item, index) => (
                <button
                    key={item.title}
                    type="button"
                    onClick={() => onOpen?.(index)}
                    style={{
                        margin: 0,
                        padding: '9px 10px',
                        borderRadius: 8,
                        background: item.yours ? waiting.background : studio.panel,
                        borderWidth: 1, borderStyle: 'solid', borderColor: item.yours ? waiting.border : studio.line,
                        color: studio.text,
                        fontFamily: studio.font,
                        fontSize: 13,
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    {item.title}
                    <span style={{ fontSize: 11, color: item.yours ? waiting.detail : studio.textFaint }}>{item.detail}</span>
                </button>
            ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: studio.textFaint }}>
                Who hears this channel
            </span>
            {members.map((member) => (
                <span key={member.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Badge glyph={member.glyph} person={member.person} job={member.job} />
                        <span style={{ fontFamily: studio.mono }}>{member.name}</span>
                    </span>
                    <span style={{ fontSize: 12, color: stateColor[member.state] ?? studio.textFaint }}>{member.state}</span>
                </span>
            ))}
        </div>
    </aside>
);

export default RailList;
