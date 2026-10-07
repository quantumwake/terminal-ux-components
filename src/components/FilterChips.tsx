import React from 'react';
import { studio, radius } from '../theme/studio';

export interface FilterChip {
    key: string;
    name: string;
    count?: number;
}

export interface FilterChipsProps {
    items: FilterChip[];
    value: string;
    onChange: (key: string) => void;
    label?: string;
}

// FilterChips is board 8's row of filters: one pill per filter, its count
// beside the name, the chosen one ringed in the accent.
export const FilterChips: React.FC<FilterChipsProps> = ({ items, value, onChange, label = 'Show' }) => (
    <div role="group" aria-label={label} style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {items.map((item) => {
            const on = item.key === value;
            return (
                <button
                    key={item.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onChange(item.key)}
                    style={{
                        padding: '7px 12px',
                        borderRadius: radius(999),
                        cursor: 'pointer',
                        font: 'inherit',
                        fontFamily: studio.font,
                        fontSize: 13,
                        color: studio.text,
                        background: on ? studio.selected : studio.panel,
                        borderWidth: 1, borderStyle: 'solid', borderColor: on ? studio.accent : studio.line,
                    }}
                >
                    {item.name}
                    {item.count !== undefined && (
                        <>
                            {' '}
                            <span style={{ color: studio.textFaint }}>{item.count}</span>
                        </>
                    )}
                </button>
            );
        })}
    </div>
);

export default FilterChips;
