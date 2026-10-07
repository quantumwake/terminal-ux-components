import React from 'react';
import { studio, radius } from '../theme/studio';

export interface MemberRowProps {
    // The badge: a PersonBadge or an AgentBadge.
    badge: React.ReactNode;
    name: string;
    // An agent's name is its handle, in mono; a person's is plain.
    mono?: boolean;
    // Under the name (an agent's job, owner and machine).
    detail?: string;
    // At the right (a person's role, an agent's stages).
    note?: string;
}

// MemberRow is one person or agent in a project panel (board 4).
export const MemberRow: React.FC<MemberRowProps> = ({ badge, name, mono, detail, note }) =>
    detail !== undefined ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: radius(8), background: studio.card, fontFamily: studio.font, color: studio.text }}>
            {badge}
            <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1 }}>
                <span style={{ fontFamily: mono ? studio.mono : studio.font, fontSize: 13 }}>{name}</span>
                <span style={{ fontSize: 12, color: studio.textFaint }}>{detail}</span>
            </span>
            {note && <span style={{ fontSize: 12, color: studio.textMuted }}>{note}</span>}
        </div>
    ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '8px 10px', borderRadius: radius(8), background: studio.card, fontSize: 14, fontFamily: studio.font, color: studio.text }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: mono ? studio.mono : studio.font }}>{badge}{name}</span>
            {note && <span style={{ fontSize: 12, color: studio.textFaint }}>{note}</span>}
        </div>
    );

export default MemberRow;
