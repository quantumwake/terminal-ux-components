import React from 'react';
import { studio } from '../theme/studio';

export interface ListPickerItem {
    id: string;
    name: string;
    hint?: string;
}

export interface ListPickerProps {
    items: ListPickerItem[];
    value?: string;
    onSelect: (id: string) => void;
    label: string;
    searchLabel?: string;
    searchPlaceholder?: string;
    query?: string;
    onQuery?: (q: string) => void;
    action?: { label: string; onClick?: () => void };
}

// ListPicker is board 4's left column: a search box, one card per item (its
// name and a hint), the chosen one ringed in the accent, and an action.
export const ListPicker: React.FC<ListPickerProps> = ({ items, value, onSelect, label, searchLabel = 'Find', searchPlaceholder = 'Search', query = '', onQuery, action }) => (
    <aside
        aria-label={label}
        style={{ width: 300, flexShrink: 0, borderRight: `1px solid ${studio.line}`, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 10, fontFamily: studio.font, color: studio.text }}
    >
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: studio.textFaint }}>
            {searchLabel}
            <input
                type="text"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => onQuery?.(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #3a342e', background: studio.panel, color: studio.text, font: 'inherit' }}
            />
        </label>
        {items.map((item) => {
            const on = item.id === value;
            return (
                <button
                    key={item.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onSelect(item.id)}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 2,
                        padding: '10px 12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        textAlign: 'left',
                        font: 'inherit',
                        color: studio.text,
                        background: on ? '#2b2520' : studio.panel,
                        border: `1px solid ${on ? studio.accent : studio.line}`,
                    }}
                >
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</span>
                    {item.hint && <span style={{ fontSize: 12, color: studio.textFaint }}>{item.hint}</span>}
                </button>
            );
        })}
        {action && (
            <button
                type="button"
                onClick={action.onClick}
                style={{ marginTop: 4, padding: 11, borderRadius: 8, border: 'none', background: studio.accent, color: '#160d07', font: 'inherit', fontWeight: 600, cursor: 'pointer' }}
            >
                {action.label}
            </button>
        )}
    </aside>
);

export default ListPicker;
