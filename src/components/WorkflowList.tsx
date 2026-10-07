import React from 'react';
import { studio, radius } from '../theme/studio';
import { MilestoneStrip } from './MilestoneStrip';

export type WorkflowJob = 'coordinator' | 'builder' | 'reviewer' | 'security' | 'person';

export interface WorkflowAgent {
    handle: string;
    glyph: string;
    job: WorkflowJob;
}

export interface WorkflowStage {
    id: string;
    name: string;
    check: string;
    who: WorkflowAgent[];
}

export interface WorkflowMilestone {
    id: string;
    name: string;
    check: string;
    stages: WorkflowStage[];
}

export interface WorkflowListProps {
    milestones: WorkflowMilestone[];
    selected?: string;
    onSelect?: (id: string) => void;
    onAddStage?: (milestoneId: string) => void;
}

function chipColor(job: WorkflowJob): string {
    return studio.job[job];
}

export const WorkflowList: React.FC<WorkflowListProps> = ({ milestones, selected, onSelect, onAddStage }) => (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {milestones.map((milestone) => (
            <li key={milestone.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <MilestoneStrip name={milestone.name} check={milestone.check} />
                {milestone.stages.map((stage) => {
                    const on = stage.id === selected;
                    return (
                        <button
                            key={stage.id}
                            type="button"
                            aria-pressed={on}
                            onClick={() => onSelect?.(stage.id)}
                            style={{
                                marginLeft: 24,
                                display: 'grid',
                                gridTemplateColumns: '18px 180px minmax(0, 1fr) 120px',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 14px',
                                borderRadius: radius(10),
                                cursor: 'pointer',
                                textAlign: 'left',
                                color: studio.text,
                                background: on ? studio.activeSurface : studio.panel,
                                borderWidth: 1, borderStyle: 'solid', borderColor: on ? studio.accent : studio.line,
                                fontFamily: studio.font,
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={studio.textDim} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                                <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" />
                            </svg>
                            <span style={{ fontWeight: 600, fontSize: 15 }}>{stage.name}</span>
                            <span style={{ fontSize: 13, color: studio.notice }}>{stage.check}</span>
                            <span style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                {stage.who.map((agent) => (
                                    <span
                                        key={agent.handle}
                                        role="img"
                                        aria-label={agent.handle}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            flexShrink: 0,
                                            borderRadius: radius(5),
                                            background: chipColor(agent.job),
                                            color: studio.ink,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontFamily: studio.mono,
                                            fontWeight: 600,
                                            fontSize: 9,
                                        }}
                                    >
                                        {agent.glyph}
                                    </span>
                                ))}
                            </span>
                        </button>
                    );
                })}
                <button
                    type="button"
                    onClick={() => onAddStage?.(milestone.id)}
                    style={{
                        marginLeft: 24,
                        alignSelf: 'flex-start',
                        padding: '6px 12px',
                        borderRadius: radius(6),
                        border: `1px dashed ${studio.dashed}`,
                        background: 'none',
                        color: studio.textFaint,
                        fontSize: 12,
                        cursor: 'pointer',
                        fontFamily: studio.font,
                    }}
                >
                    Add a stage under {milestone.name}
                </button>
            </li>
        ))}
    </ol>
);
