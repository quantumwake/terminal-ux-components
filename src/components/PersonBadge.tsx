import React from 'react';
import { studio } from '../theme/studio';

export interface PersonBadgeProps {
    glyph: string;
    size?: number;
    label?: string;
}

// PersonBadge is a person's circle: their initials on the person tint
// (board 2's people). An agent is a square (AgentBadge); a person is round.
export const PersonBadge: React.FC<PersonBadgeProps> = ({ glyph, size = 30, label }) => (
    <span
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        style={{
            width: size,
            height: size,
            flexShrink: 0,
            borderRadius: '50%',
            background: studio.job.person,
            color: '#0d1a0c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: studio.font,
            fontSize: 11,
            fontWeight: 600,
        }}
    >
        {glyph}
    </span>
);

export default PersonBadge;
