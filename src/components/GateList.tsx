import React from 'react';
import { studio } from '../theme/studio';

// A gate is what a card needs to leave a stage. It is never a persona.
export const gateKinds = ['none', 'pass', 'approval', 'evidence'] as const;
export type GateKind = (typeof gateKinds)[number];

const kindLabel: Record<GateKind, string> = {
    none: 'no gate',
    pass: 'pass from another agent',
    approval: 'approval by an owner',
    evidence: 'evidence attached',
};

const unmet = '#f0a070';
const met = '#9fd39b';
const actionBorder = '#6a3e22';

export interface GateRow {
    id: string;
    from: string;
    to: string;
    kind: GateKind;
    met?: boolean;
    note: string;
}

export interface GateAction {
    label: string;
    href?: string;
    onClick?: () => void;
}

export interface GateListProps {
    name: string;
    href?: string;
    gates: GateRow[];
    action?: GateAction;
}

function Row({ gate }: { gate: GateRow }) {
    const ok = !!gate.met;
    const tone = ok ? met : unmet;
    return (
        <span style={{ display: 'grid', gridTemplateColumns: '16px minmax(0, 1fr)', gap: 8, lineHeight: '18px' }}>
            <span style={{ fontFamily: studio.mono, color: tone }}>{ok ? '✓' : '!'}</span>
            <span>
                <span style={{ color: studio.text }}>
                    {/* Plex draws this arrow a pixel wider than board 1, which shifts the words after it. */}
                    {gate.from} <span style={{ letterSpacing: '-1.4px' }}>→</span> {gate.to} · {kindLabel[gate.kind]}
                </span>
                <br />
                <span style={{ fontSize: 12, color: ok ? studio.textFaint : tone }}>{gate.note}</span>
            </span>
        </span>
    );
}

// GateList is the gate card on board 1. Each row is a stage's gate to leave
// it, named by its kind. A persona may be suggested in the note; it is not
// the gate.
export const GateList: React.FC<GateListProps> = ({ name, href, gates, action }) => (
    <section
        aria-label="Gates"
        style={{
            boxSizing: 'border-box',
            width: '100%',
            padding: 12,
            borderRadius: 10,
            background: studio.card,
            border: `1px solid ${studio.line}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            fontFamily: studio.font,
            fontSize: 13,
            color: studio.text,
        }}
    >
        <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: studio.textFaint }}>
            Gates ·{' '}
            {href ? (
                <a href={href} style={{ color: unmet }}>
                    {name}
                </a>
            ) : (
                name
            )}
        </span>
        {gates.map((gate) => (
            <Row key={gate.id} gate={gate} />
        ))}
        {action ? (
            action.href ? (
                <a
                    href={action.href}
                    onClick={action.onClick}
                    style={{
                        marginTop: 3,
                        padding: 8,
                        borderRadius: 6,
                        border: `1px solid ${actionBorder}`,
                        color: unmet,
                        textDecoration: 'none',
                        fontFamily: studio.font,
                        fontSize: 13,
                        fontWeight: 400,
                        lineHeight: '17px',
                        textAlign: 'center',
                    }}
                >
                    {action.label}
                </a>
            ) : (
                <button
                    type="button"
                    onClick={action.onClick}
                    style={{
                        marginTop: 3,
                        padding: 8,
                        borderRadius: 6,
                        border: `1px solid ${actionBorder}`,
                        color: unmet,
                        background: 'none',
                        font: 'inherit',
                        fontSize: 13,
                        textAlign: 'center',
                        cursor: 'pointer',
                    }}
                >
                    {action.label}
                </button>
            )
        ) : null}
    </section>
);

export default GateList;
