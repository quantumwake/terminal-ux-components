import React from 'react';
import { studio } from '../theme/studio';
import { WorkCard } from './WorkCard';
import { WorkCardItem } from './cardChrome';

export interface SwimLane {
    id: string;
    milestone: string;
    name: string;
    items: WorkCardItem[];
}

export interface SwimLanesProps {
    lanes: SwimLane[];
    selected?: string;
    onSelect?: (id: string) => void;
}

export const SwimLanes: React.FC<SwimLanesProps> = ({ lanes, selected, onSelect }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(lanes.length, 1)}, minmax(0, 1fr))`, gap: 10 }}>
        {lanes.map((lane) => (
            <section
                key={lane.id}
                aria-label={lane.name}
                style={{
                    background: studio.header,
                    border: `1px solid ${studio.line}`,
                    borderRadius: 12,
                    padding: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    minHeight: 480,
                }}
            >
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '2px 4px' }}>
                    <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: studio.textFaint }}>
                        {lane.milestone}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: studio.text, fontFamily: studio.font }}>
                        {lane.name}{' '}
                        <span style={{ color: studio.textFaint, fontWeight: 400 }}>· {lane.items.length}</span>
                    </span>
                </span>
                {lane.items.map((item) => (
                    <WorkCard key={item.id} item={item} selected={item.id === selected} onSelect={onSelect} />
                ))}
            </section>
        ))}
    </div>
);
