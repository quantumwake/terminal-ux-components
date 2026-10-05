import React from 'react';
import { studio } from '../theme/studio';
import type { Job } from './AgentBadge';
import { postKindColor } from './PostItem';

// Board 1 draws a pass in the reviewer's colour. PostItem has no pass kind.
const kindColor = (kind: string) => (kind === 'pass' ? studio.job.reviewer : postKindColor(kind));

const ink = studio.ink;
const body = studio.textBody;
const posColor = studio.textDim;

export interface ThreadReply {
    glyph: string;
    person?: boolean;
    job?: Job;
    handle: string;
    kind: string;
    at: string;
    text: string;
}

export interface ThreadRowProps {
    pos: string | number;
    glyph: string;
    person?: boolean;
    job?: Job;
    handle: string;
    kind: string;
    at: string;
    text: string;
    state?: string;
    warn?: boolean;
    replies?: ThreadReply[];
    open?: boolean;
    onToggle?: () => void;
    draft?: string;
    onDraft?: (value: string) => void;
    onReply?: () => void;
}

function Badge({ glyph, person, job = 'builder', size }: { glyph: string; person?: boolean; job?: Job; size: number }) {
    return (
        <span
            aria-hidden
            style={{
                width: size,
                height: size,
                flexShrink: 0,
                borderRadius: person ? '50%' : 7,
                background: person ? studio.job.person : studio.job[job],
                color: ink,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: studio.mono,
                fontWeight: 600,
                fontSize: size < 28 ? 9 : 11,
            }}
        >
            {glyph}
        </span>
    );
}

function Kind({ kind }: { kind: string }) {
    return (
        <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 999, border: `1px solid ${studio.dashed}`, color: kindColor(kind) }}>{kind}</span>
    );
}

// ThreadRow is one post on board 1. Replies stay under it, opened in place,
// and the reply field is the line under them. text and draft are plain strings.
export const ThreadRow: React.FC<ThreadRowProps> = ({
    pos,
    glyph,
    person,
    job,
    handle,
    kind,
    at,
    text,
    state,
    warn,
    replies = [],
    open = false,
    onToggle,
    draft = '',
    onDraft,
    onReply,
}) => {
    const last = replies[replies.length - 1];
    const send = () => {
        if (!draft.trim()) return;
        onReply?.();
    };
    return (
        <article
            style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '8px 0',
                borderBottom: `1px solid ${studio.threadRule}`,
                fontFamily: studio.font,
                color: studio.text,
                boxSizing: 'border-box',
            }}
        >
            <div style={{ display: 'grid', gridTemplateColumns: '44px 30px minmax(0, 1fr)', gap: 10 }}>
                <span style={{ fontFamily: studio.mono, fontSize: 10, color: posColor, textAlign: 'right', paddingTop: 6 }}>{pos}</span>
                <Badge glyph={glyph} person={person} job={job} size={30} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: studio.mono, fontSize: 13, fontWeight: 600 }}>{handle}</span>
                        <Kind kind={kind} />
                        <span style={{ fontSize: 12, color: studio.textFaint }}>{at}</span>
                    </span>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: body }}>{text}</p>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
                        {replies.length ? (
                            <button
                                type="button"
                                aria-expanded={open}
                                onClick={onToggle}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '3px 9px',
                                    borderRadius: 6,
                                    border: `1px solid ${studio.line}`,
                                    background: studio.panel,
                                    color: studio.link,
                                    cursor: 'pointer',
                                    font: 'inherit',
                                    fontFamily: studio.font,
                                    fontSize: 12,
                                }}
                            >
                                {open ? 'Hide ' : ''}
                                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                                <span style={{ color: studio.textFaint }}>· last {last.at}</span>
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={onToggle}
                            style={{ border: 'none', background: 'none', color: studio.textFaint, cursor: 'pointer', padding: 0, font: 'inherit', fontFamily: studio.font, fontSize: 12 }}
                        >
                            Reply
                        </button>
                        {state ? <span style={{ fontSize: 12, marginLeft: 'auto', color: warn ? studio.link : studio.textFaint }}>{state}</span> : null}
                    </span>
                </div>
            </div>
            {open ? (
                <div style={{ margin: '8px 0 2px 84px', paddingLeft: 14, borderLeft: `2px solid ${studio.dashed}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {replies.length ? (
                    <ol aria-label="Replies" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {replies.map((reply, index) => (
                            <li key={`${reply.handle}-${reply.at}-${index}`} style={{ display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr)', gap: 10 }}>
                                <Badge glyph={reply.glyph} person={reply.person} job={reply.job} size={24} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                                    <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                                        <span style={{ fontFamily: studio.mono, fontSize: 12, fontWeight: 600 }}>{reply.handle}</span>
                                        <Kind kind={reply.kind} />
                                        <span style={{ fontSize: 11, color: studio.textFaint }}>{reply.at}</span>
                                    </span>
                                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: body }}>{reply.text}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                    ) : null}
                    <form
                        aria-label="Reply to this post"
                        onSubmit={(event) => {
                            event.preventDefault();
                            send();
                        }}
                    >
                        <input
                            value={draft}
                            placeholder={`Reply to ${handle}…`}
                            aria-label="Reply in thread"
                            onChange={(event) => onDraft?.(event.target.value)}
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: '8px 10px',
                                borderRadius: 6,
                                border: `1px solid ${studio.dashed}`,
                                background: studio.ground,
                                color: studio.text,
                                font: 'inherit',
                                fontFamily: studio.font,
                                fontSize: 13,
                            }}
                        />
                    </form>
                </div>
            ) : null}
        </article>
    );
};

export default ThreadRow;
