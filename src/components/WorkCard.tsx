import React from 'react';
import { studio, radius } from '../theme/studio';
import { cardChrome, flagTint, objectiveChrome, WorkCardItem } from './cardChrome';

export interface WorkCardProps {
    item: WorkCardItem;
    selected?: boolean;
    onSelect?: (id: string) => void;
}

export const WorkCard: React.FC<WorkCardProps> = ({ item, selected = false, onSelect }) => {
    const chrome = cardChrome(item, selected);
    const objective = objectiveChrome(item.objective);
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect?.(item.id)}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 6,
                padding: 10,
                borderRadius: radius(9),
                cursor: 'pointer',
                textAlign: 'left',
                color: studio.text,
                background: chrome.background,
                borderWidth: 1, borderStyle: 'solid', borderColor: chrome.borderColor,
                fontFamily: studio.font,
                width: '100%',
                margin: 0,
                boxSizing: 'border-box',
            }}
        >
            <span style={{ display: 'flex', justifyContent: 'space-between', gap: 6, width: '100%' }}>
                <span style={{ fontFamily: studio.mono, fontSize: 11, color: studio.textFaint }}>{item.kind}</span>
                <span style={{ fontSize: 11, color: flagTint(item.flag) }}>{item.flag ?? ''}</span>
            </span>
            <span style={{ fontSize: 13, lineHeight: 1.4 }}>{item.title}</span>
            <span style={{ fontSize: 12, color: studio.textMuted }}>{item.who}</span>
            <span
                style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: radius(999),
                    borderWidth: 1, borderStyle: 'solid', borderColor: objective.borderColor,
                    color: objective.color,
                }}
            >
                {objective.text}
            </span>
        </button>
    );
};
