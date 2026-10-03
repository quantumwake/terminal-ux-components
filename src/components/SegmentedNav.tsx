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
    // small is a page's own tabs (board 4's Board · Channel · People and
    // agents · Settings); the default is the app's header nav.
    size?: 'default' | 'small';
}

// Selected segment fill from the Agents mockup. It sits between the chip and
// the line, and it is not one of the page surfaces.
const segmentOn = '#2b2520';
const chip = '#1c1a17';

export const SegmentedNav: React.FC<SegmentedNavProps> = ({
    items,
    value,
    onChange,
    label = 'Sections',
    size = 'default',
}) => (
    <div
        role="tablist"
        aria-label={label}
        style={{
            display: 'flex',
            gap: 4,
            background: chip,
            border: `1px solid ${studio.line}`,
            borderRadius: 8,
            padding: 4,
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
                        borderRadius: 6,
                        padding: size === 'small' ? '7px 12px' : '8px 14px',
                        font: 'inherit',
                        fontSize: size === 'small' ? 13 : 14,
                        cursor: 'pointer',
                        background: selected ? segmentOn : 'transparent',
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
