import React from 'react';
import { studio } from '../theme/studio';

export interface MilestoneStripProps {
    name: string;
    check: string;
}

// A milestone row is set by the organization. It is locked: there is no
// control here that renames it or removes its check.
export const MilestoneStrip: React.FC<MilestoneStripProps> = ({ name, check }) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            borderRadius: 8,
            background: studio.track,
            fontSize: 13,
            fontFamily: studio.font,
        }}
    >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={studio.textFaint} strokeWidth="2" strokeLinecap="round" role="img" aria-label="Set by the organization">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
        <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11, color: studio.textMuted }}>
            {name}
        </span>
        <span style={{ color: studio.textFaint }}>· {check}</span>
    </div>
);
