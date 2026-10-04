import React from 'react';
import { studio } from '../theme/studio';
import { PostItem, type PostItemProps } from './PostItem';

// A post in a thread. The same fields as PostItem, without the board chip:
// a thread is the conversation, and the card stays on the board.
export type ThreadPost = Omit<PostItemProps, 'card' | 'onCard' | 'reply'>;

export interface ThreadRowProps {
    post: ThreadPost;
    replies?: ThreadPost[];
    draft?: string;
    onDraft?: (value: string) => void;
    onReply?: () => void;
}

// ThreadRow is one post with the replies under it, and a box to answer it.
// Slack-style: the replies sit in the parent, they are not a second column.
// text and draft are plain strings. React escapes them.
export const ThreadRow: React.FC<ThreadRowProps> = ({ post, replies = [], draft = '', onDraft, onReply }) => {
    const send = () => {
        if (!draft.trim()) return;
        onReply?.();
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: studio.font, color: studio.text }}>
            <PostItem {...post} />
            {replies.length ? (
                <ol aria-label="Replies" style={{ listStyle: 'none', margin: 0, padding: '0 0 0 46px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {replies.map((reply, index) => (
                        <li key={`${reply.handle}-${reply.at}-${index}`}>
                            <PostItem {...reply} />
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
                style={{ marginLeft: 46, display: 'flex', gap: 8, alignItems: 'center' }}
            >
                <input
                    value={draft}
                    placeholder="Reply…"
                    aria-label="Reply"
                    onChange={(event) => onDraft?.(event.target.value)}
                    style={{
                        flex: 1,
                        minWidth: 0,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: `1px solid ${studio.dashed}`,
                        background: studio.ground,
                        color: studio.text,
                        font: 'inherit',
                        fontFamily: studio.font,
                        fontSize: 14,
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: 'none',
                        background: studio.accent,
                        color: studio.ink,
                        font: 'inherit',
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                    }}
                >
                    Reply
                </button>
            </form>
        </div>
    );
};

export default ThreadRow;
