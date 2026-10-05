import React from 'react';
import { studio } from '../theme/studio';

export interface SelectableColumn {
    label: string;
    width: string;
}

export interface SelectableRow {
    id: string;
    cells: React.ReactNode[];
}

export interface SelectableRowTableProps {
    columns: SelectableColumn[];
    rows: SelectableRow[];
    value?: string;
    onSelect: (id: string) => void;
    label?: string;
}

const chip = studio.card;
const selected = studio.rowSelected;
const rule = studio.rule;

export const SelectableRowTable: React.FC<SelectableRowTableProps> = ({
    columns,
    rows,
    value,
    onSelect,
    label = 'Rows',
}) => {
    const template = columns.map((column) => column.width).join(' ');
    return (
        <div
            role="table"
            aria-label={label}
            style={{
                width: '100%',
                boxSizing: 'border-box',
                background: studio.panel,
                border: `1px solid ${studio.line}`,
                borderRadius: 12,
                overflow: 'hidden',
                fontFamily: studio.font,
                color: studio.text,
            }}
        >
            <div
                role="row"
                style={{
                    display: 'grid',
                    gridTemplateColumns: template,
                    gap: 12,
                    padding: '10px 16px',
                    background: chip,
                    borderBottom: `1px solid ${studio.line}`,
                    fontSize: 12,
                    color: studio.textFaint,
                }}
            >
                {columns.map((column) => (
                    <span key={column.label} role="columnheader">{column.label}</span>
                ))}
            </div>
            {rows.map((row) => {
                const on = row.id === value;
                return (
                    <button
                        key={row.id}
                        type="button"
                        role="row"
                        aria-pressed={on}
                        onClick={() => onSelect(row.id)}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: template,
                            gap: 12,
                            alignItems: 'center',
                            width: '100%',
                            padding: '10px 16px',
                            border: 'none',
                            borderBottom: `1px solid ${rule}`,
                            textAlign: 'left',
                            color: studio.text,
                            cursor: 'pointer',
                            font: 'inherit',
                            background: on ? selected : 'transparent',
                            boxShadow: on ? `inset 3px 0 0 ${studio.accent}` : 'none',
                        }}
                    >
                        {row.cells.map((cell, index) => (
                            <span key={index} role="cell" style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>{cell}</span>
                        ))}
                    </button>
                );
            })}
        </div>
    );
};

export default SelectableRowTable;
