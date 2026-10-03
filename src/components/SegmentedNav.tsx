import React from 'react';
import { studio } from '../theme/studio';

export interface SegmentedNavItem {
    id: string;
    label: string;
}

export interface SegmentedNavProps {
    items: SegmentedNavItem[];
    value: string;
    onChange: (id: string) => void;
    label?: string;
}

export const SegmentedNav: React.FC<SegmentedNavProps> = ({
    items,
    value,
    onChange,
    label = 'Sections',
}) => (
    <div
        role="tablist"
        aria-label={label}
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            padding: 3,
            background: studio.ground,
            border: `1px solid ${studio.line}`,
            borderRadius: 10,
            fontFamily: studio.font,
        }}
    >
        {items.map((item) => {
            const selected = item.id === value;
            return (
                <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => onChange(item.id)}
                    style={{
                        border: 0,
                        borderRadius: 8,
                        padding: '6px 14px',
                        font: 'inherit',
                        fontSize: 13,
                        cursor: 'pointer',
                        background: selected ? studio.card : 'transparent',
                        color: selected ? studio.text : studio.textFaint,
                    }}
                >
                    {item.label}
                </button>
            );
        })}
    </div>
);

export default SegmentedNav;
