import React from 'react';
import { studio } from '../theme/studio';

export interface StatusDotProps {
    // The dot's and the label's colour; omitted, the dot is a dashed ring
    // (board 8's "Not listening").
    color?: string;
    label?: string;
    size?: number;
}

// StatusDot is a state as board 8 draws it: a dot, and the state's name in
// the same colour.
export const StatusDot: React.FC<StatusDotProps> = ({ color, label, size = 8 }) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: studio.font, fontSize: 13 }}>
        <span
            aria-hidden="true"
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                flexShrink: 0,
                ...(color ? { background: color } : { border: '1px dashed #8a8178' }),
            }}
        />
        {label !== undefined && <span style={{ color: color ?? studio.textFaint }}>{label}</span>}
    </span>
);

export default StatusDot;
