import React from 'react';
import { studio } from '../theme/studio';

export interface ChannelRowProps {
    name: string;
    // The pill after the name: "main", "extra", "pending".
    kind: string;
    note?: string;
}

// ChannelRow is one of a project's channels (board 4).
export const ChannelRow: React.FC<ChannelRowProps> = ({ name, kind, note }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 12px', borderRadius: 8, background: studio.card, fontSize: 14, fontFamily: studio.font, color: studio.text }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: studio.mono }}>{name}</span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, border: '1px solid #3a342e', color: studio.textMuted }}>{kind}</span>
        </span>
        {note && <span style={{ fontSize: 12, color: studio.textFaint }}>{note}</span>}
    </div>
);

export default ChannelRow;
