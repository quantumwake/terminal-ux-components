import React from 'react';
import { studio } from '../theme/studio';

export interface ActionBoxProps {
    title: string;
    text: React.ReactNode;
    actions: { label: string; onClick?: () => void }[];
}

const outline: React.CSSProperties = { padding: '8px 12px', borderRadius: 6, border: `1px solid ${studio.dashed}`, background: 'none', color: studio.text, font: 'inherit', fontSize: 13, cursor: 'pointer' };

// ActionBox is a dashed invitation to do something (board 4's "Add a
// channel"): a title, a line of text and outlined buttons.
export const ActionBox: React.FC<ActionBoxProps> = ({ title, text, actions }) => (
    <div style={{ padding: '12px 14px', borderRadius: 10, border: `1px dashed ${studio.dashed}`, display: 'flex', flexDirection: 'column', gap: 8, fontFamily: studio.font, color: studio.text }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>
        <span style={{ fontSize: 13, color: studio.textMuted, lineHeight: 1.5 }}>{text}</span>
        <span style={{ display: 'flex', gap: 8 }}>
            {actions.map((a) => (
                <button key={a.label} type="button" onClick={a.onClick} style={outline}>{a.label}</button>
            ))}
        </span>
    </div>
);

export interface NoticeProps {
    lead: string;
    children: React.ReactNode;
}

// Notice is what a change will do, said before it is saved (board 4's
// "Before you save"): a bold lead, then the consequences.
export const Notice: React.FC<NoticeProps> = ({ lead, children }) => (
    <div style={{ padding: '12px 14px', borderRadius: 10, background: studio.card, border: `1px solid ${studio.line}`, fontSize: 13, lineHeight: 1.55, color: studio.textMuted, fontFamily: studio.font }}>
        <b style={{ color: studio.text }}>{lead}</b> {children}
    </div>
);

export default Notice;
