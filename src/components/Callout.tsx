import React from 'react';
import { studio } from '../theme/studio';

export interface CalloutProps {
    title: string;
    children: React.ReactNode;
}

// Callout is a named block under the work item: the checks to move on, or
// the posts on its channel.
export const Callout: React.FC<CalloutProps> = ({ title, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: studio.textFaint }}>{title}</span>
        {children}
    </div>
);

export default Callout;
