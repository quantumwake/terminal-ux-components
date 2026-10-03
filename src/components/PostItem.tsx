import React from 'react';
import { studio } from '../theme/studio';
import type { Job } from './AgentBadge';

// Board 5's post body. It sits between the text and muted tokens.
const body = '#e2dbd2';

// Every kind the viewer posts gets a pill. The six on board 5 use that
// board's colours; report, status and artifact use studio tokens so a
// kind the mockup never drew still shows as itself.
const kindColor: Record<string, string> = {
    request: studio.job.coordinator,
    claim: studio.accent,
    close: studio.job.person,
    question: studio.link,
    answer: studio.job.reviewer,
    comment: studio.textFaint,
    report: studio.notice,
    status: studio.textMuted,
    artifact: studio.job.security,
};

export const postKinds = ['comment', 'question', 'answer', 'request', 'claim', 'close', 'report', 'status', 'artifact'] as const;

export function postKindColor(kind: string): string {
    return kindColor[kind] ?? studio.textFaint;
}

export interface PostItemProps {
    glyph: string;
    person?: boolean;
    job?: Job;
    handle: string;
    kind: string;
    at: string;
    reply?: string;
    text: string;
    card?: string;
    onCard?: () => void;
}

// PostItem is one post on board 5: a badge, the handle and kind, the text,
// and a chip when the post is on the board.
export const PostItem: React.FC<PostItemProps> = ({ glyph, person, job = 'builder', handle, kind, at, reply, text, card, onCard }) => (
    <article
        style={{
            display: 'grid',
            gridTemplateColumns: '34px minmax(0, 1fr)',
            gap: 12,
            fontFamily: studio.font,
            color: studio.text,
        }}
    >
        <span
            aria-hidden
            style={{
                width: 34,
                height: 34,
                flexShrink: 0,
                borderRadius: person ? '50%' : 8,
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: studio.mono, fontSize: 13, fontWeight: 600 }}>{handle}</span>
                <span
                    style={{
                        fontSize: 11,
                        padding: '1px 8px',
                        borderRadius: 999,
                        border: `1px solid ${studio.dashed}`,
                        color: postKindColor(kind),
                    }}
                >
                    {kind}
                </span>
                <span style={{ fontSize: 12, color: studio.textFaint }}>{at}</span>
                {reply ? <span style={{ fontSize: 12, color: studio.textFaint }}>{reply}</span> : null}
            </span>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: body }}>{text}</p>
            {card ? (
                <a
                    href="#board"
                    onClick={(event) => {
                        if (!onCard) return;
                        event.preventDefault();
                        onCard();
                    }}
                    style={{
                        alignSelf: 'flex-start',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: studio.panel,
                        border: `1px solid ${studio.line}`,
                        textDecoration: 'none',
                        color: studio.text,
                        fontSize: 13,
                    }}
                >
                    <span style={{ fontFamily: studio.mono, fontSize: 11, color: studio.textFaint }}>on the board</span>
                    {card}
                </a>
            ) : null}
        </div>
    </article>
);

export default PostItem;
