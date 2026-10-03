import React from 'react';
import { studio } from '../theme/studio';

export interface KeyValueItem {
    label: string;
    value: React.ReactNode;
    mono?: boolean;
}

export interface KeyValueListProps {
    items: KeyValueItem[];
}

// KeyValueList is a label and a value on one row, as the work inspector
// shows Objective and who is working it.
export const KeyValueList: React.FC<KeyValueListProps> = ({ items }) => (
    <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '96px minmax(0, 1fr)', rowGap: 8, columnGap: 12, fontSize: 13 }}>
        {items.map((item) => (
            <React.Fragment key={item.label}>
                <dt style={{ color: studio.textFaint }}>{item.label}</dt>
                <dd style={{ margin: 0, fontFamily: item.mono ? studio.mono : undefined }}>{item.value}</dd>
            </React.Fragment>
        ))}
    </dl>
);

export default KeyValueList;
