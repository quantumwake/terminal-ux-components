import React from 'react';
import { studio } from '../theme/studio';

export type Job = keyof typeof studio.job;

export interface BadgeProps {
    glyph: string;
    job?: Job;
    size?: number;
    label?: string;
}

// AgentBadge is an agent's square: its initials on its job's tint. 30 px in
// a row, 48 px heading the inspector.
export const AgentBadge: React.FC<BadgeProps> = ({ glyph, job = 'builder', size = 30, label }) => {
    const big = size > 40;
    return (
        <span
            role={label ? 'img' : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            style={{
                width: size,
                height: size,
                flexShrink: 0,
                borderRadius: big ? 12 : 7,
                background: studio.job[job],
                color: studio.ink,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: studio.mono,
                fontWeight: 600,
                fontSize: big ? 16 : 11,
            }}
        >
            {glyph}
        </span>
    );
};

export default AgentBadge;
