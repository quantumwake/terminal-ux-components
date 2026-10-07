import React from 'react';
import { studio, radius } from '../theme/studio';

export interface PanelProps {
    title: string;
    // A small outlined button beside the title (board 4's "Add person").
    action?: { label: string; onClick?: () => void };
    // A note beside the title instead of an action (board 4's Channels).
    note?: string;
    gap?: number;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

// Panel is a titled card on the studio panel colour: board 4's People,
// Agents and Channels.
export const Panel: React.FC<PanelProps> = ({ title, action, note, gap = 10, style, children }) => {
    const id = React.useId();
    return (
        <section
            aria-labelledby={id}
            style={{ background: studio.panel, border: `1px solid ${studio.line}`, borderRadius: radius(12), padding: 16, display: 'flex', flexDirection: 'column', gap, fontFamily: studio.font, color: studio.text, ...style }}
        >
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                <h2 id={id} style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{title}</h2>
                {action && (
                    <button
                        type="button"
                        onClick={action.onClick}
                        style={{ padding: '6px 12px', borderRadius: radius(6), border: `1px solid ${studio.dashed}`, background: 'none', color: studio.text, font: 'inherit', fontSize: 12, cursor: 'pointer' }}
                    >
                        {action.label}
                    </button>
                )}
                {note && <span style={{ fontSize: 12, color: studio.textFaint }}>{note}</span>}
            </span>
            {children}
        </section>
    );
};

export default Panel;
