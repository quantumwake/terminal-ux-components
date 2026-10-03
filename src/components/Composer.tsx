import React from 'react';
import { studio } from '../theme/studio';

export const composerKinds = [
    { value: 'comment', label: 'Comment' },
    { value: 'question', label: 'Question' },
    { value: 'request', label: 'Request work' },
] as const;

export type ComposerKind = (typeof composerKinds)[number]['value'];

export interface ComposerProps {
    channel: string;
    value: string;
    onChange: (value: string) => void;
    kind: ComposerKind;
    onKind: (kind: ComposerKind) => void;
    onPost: () => void;
}

// Composer is the post box on board 5. value is a plain string; React escapes
// it, so a draft cannot carry HTML.
export const Composer: React.FC<ComposerProps> = ({ channel, value, onChange, kind, onKind, onPost }) => (
    <form
        onSubmit={(event) => {
            event.preventDefault();
            onPost();
        }}
        style={{
            borderTop: `1px solid ${studio.line}`,
            padding: '14px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            background: studio.inspector,
            fontFamily: studio.font,
            color: studio.text,
        }}
    >
        <label htmlFor="composer-draft" style={{ fontSize: 12, color: studio.textFaint }}>
            Post to # {channel}
        </label>
        <textarea
            id="composer-draft"
            rows={2}
            value={value}
            placeholder="Write a post. @name to address someone."
            onChange={(event) => onChange(event.target.value)}
            style={{
                padding: '10px 12px',
                borderRadius: 8,
                border: `1px solid ${studio.dashed}`,
                background: studio.ground,
                color: studio.text,
                resize: 'none',
                font: 'inherit',
                fontFamily: studio.font,
            }}
        />
        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: studio.textFaint }}>
                As
                <select
                    aria-label="As"
                    value={kind}
                    onChange={(event) => onKind(event.target.value as ComposerKind)}
                    style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: `1px solid ${studio.dashed}`,
                        background: studio.ground,
                        color: studio.text,
                        font: 'inherit',
                        fontFamily: studio.font,
                        fontSize: 13,
                    }}
                >
                    {composerKinds.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </label>
            <button
                type="submit"
                style={{
                    padding: '9px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: studio.accent,
                    color: studio.ink,
                    font: 'inherit',
                    fontFamily: studio.font,
                    fontWeight: 600,
                    cursor: 'pointer',
                }}
            >
                Post
            </button>
        </span>
    </form>
);

export default Composer;
