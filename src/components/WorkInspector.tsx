import React from 'react';
import { studio } from '../theme/studio';
import { Callout } from './Callout';
import { KeyValueList } from './KeyValueList';

export interface WorkCheck {
    done: boolean;
    text: string;
}

export interface WorkTrail {
    at: string;
    who: string;
    what: string;
}

export interface WorkInspectorProps {
    kind: string;
    stage: string;
    milestone: string;
    title: string;
    state: string;
    objective: string;
    who: string;
    checks: WorkCheck[];
    trail: WorkTrail[];
    yours?: boolean;
    unlinked?: boolean;
    onApprove?: () => void;
    onAsk?: () => void;
    onLink?: () => void;
}

const approve = {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    border: 'none',
    background: studio.accent,
    color: studio.ink,
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
} as const;

const ask = {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    border: `1px solid ${studio.dashed}`,
    background: 'none',
    color: studio.text,
    fontSize: 14,
    cursor: 'pointer',
} as const;

// WorkInspector is the selected work item on board 6. It shares the agent's
// inspector shell: the dark aside, and sections stacked down it.
export const WorkInspector: React.FC<WorkInspectorProps> = ({
    kind,
    stage,
    milestone,
    title,
    state,
    objective,
    who,
    checks,
    trail,
    yours,
    unlinked,
    onApprove,
    onAsk,
    onLink,
}) => (
    <aside
        aria-label="Selected item"
        style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            borderLeft: `1px solid ${studio.line}`,
            background: studio.inspector,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            color: studio.text,
            fontFamily: studio.font,
        }}
    >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontFamily: studio.mono, fontSize: 12, color: studio.textFaint }}>{kind} · {stage} · {milestone}</span>
            <span style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.3 }}>{title}</span>
            <span style={{ fontSize: 13, color: studio.notice }}>{state}</span>
        </div>
        <KeyValueList items={[
            { label: 'Objective', value: objective },
            { label: 'Working it', value: who, mono: true },
        ]} />
        <Callout title="To move on">
            {checks.map((check) => (
                <div key={check.text} style={{ display: 'flex', gap: 10, fontSize: 13, lineHeight: 1.45 }}>
                    <span style={{ width: 14, flexShrink: 0, fontFamily: studio.mono, color: check.done ? studio.job.person : studio.textFaint }}>{check.done ? '✓' : '○'}</span>
                    <span>{check.text}</span>
                </div>
            ))}
        </Callout>
        <Callout title="On the channel">
            {trail.map((post) => (
                <div key={post.at + post.what} style={{ display: 'grid', gridTemplateColumns: '48px minmax(0, 1fr)', gap: 10, fontSize: 13, lineHeight: 1.45 }}>
                    <span style={{ fontFamily: studio.mono, fontSize: 11, color: studio.textFaint, paddingTop: 2 }}>{post.at}</span>
                    <span><span style={{ fontFamily: studio.mono }}>{post.who}</span> <span style={{ color: studio.textMuted }}>{post.what}</span></span>
                </div>
            ))}
        </Callout>
        {yours && (
            <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
                <button type="button" style={approve} onClick={onApprove}>Approve</button>
                <button type="button" style={ask} onClick={onAsk}>Ask for changes</button>
            </div>
        )}
        {unlinked && (
            <button type="button" onClick={onLink} style={{ marginTop: 'auto', padding: 12, borderRadius: 8, border: `1px solid ${studio.accent}`, background: 'none', color: studio.link, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Link an objective</button>
        )}
    </aside>
);

export default WorkInspector;
