import React from 'react';
import { studio } from '../theme/studio';
import { AgentBadge, type Job } from './AgentBadge';

// A shell's state, as its dot draws it: working (the accent), listening
// (green) or gone (a dim dot, the agent left).
export type ShellState = 'working' | 'listening' | 'gone';

export interface MachineShell {
    id: string;
    glyph: string;
    job?: Job;
    // The agent's handle, in mono.
    handle: string;
    // Under the handle: its persona and what it is doing ("Builder · CSV export").
    detail: string;
    state: ShellState;
}

export interface MachineCardProps {
    name: string;
    // "Cloud" or "Connected computer"; a Cloud machine's tag is the link colour.
    kind: string;
    cloud?: boolean;
    // Whose it is and how it runs ("Yours · running 3h · Standard · 2 shells").
    note: string;
    shells: MachineShell[];
    // The shell picked on the page; its row is ringed.
    selected?: string;
    onSelect?: (id: string) => void;
    // A Cloud machine's actions. Each shows only when given.
    onNewShell?: () => void;
    onStop?: () => void;
}

const DOT: Record<ShellState, string> = { working: studio.accent, listening: studio.job.person, gone: studio.dashed };

// MachineCard is one machine on the Agents page (board 4): its name and kind,
// whose it is, its shells as rows to pick, and a Cloud machine's actions.
export const MachineCard: React.FC<MachineCardProps> = ({ name, kind, cloud, note, shells, selected, onSelect, onNewShell, onStop }) => (
    <section
        aria-label={name}
        style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 10, borderRadius: 10, border: `1px solid ${studio.line}`, background: studio.panel, color: studio.text, fontFamily: studio.font }}
    >
        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{name}</span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, border: `1px solid ${studio.dashed}`, color: cloud ? studio.link : studio.textFaint }}>{kind}</span>
        </span>
        <span style={{ fontSize: 12, color: studio.textFaint }}>{note}</span>
        {shells.map((s) => {
            const on = s.id === selected;
            return (
                <button
                    key={s.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onSelect?.(s.id)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: 8,
                        borderRadius: 8,
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: studio.text,
                        font: 'inherit',
                        background: on ? studio.selected : studio.card,
                        borderWidth: 1, borderStyle: 'solid', borderColor: on ? studio.accent : studio.line,
                    }}
                >
                    <AgentBadge glyph={s.glyph} job={s.job} size={28} />
                    <span style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
                        <span style={{ fontFamily: studio.mono, fontSize: 13 }}>{s.handle}</span>
                        <span style={{ fontSize: 11, color: studio.textFaint }}>{s.detail}</span>
                    </span>
                    <span aria-label={s.state} role="img" style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, background: DOT[s.state] }} />
                </button>
            );
        })}
        {(onNewShell || onStop) && (
            <span style={{ display: 'flex', gap: 6 }}>
                {onNewShell && (
                    <button
                        type="button"
                        onClick={onNewShell}
                        style={{ flex: 1, padding: 6, borderRadius: 6, border: `1px dashed ${studio.dashed}`, background: 'none', color: studio.textMuted, font: 'inherit', fontSize: 12, textAlign: 'center', cursor: 'pointer' }}
                    >
                        New shell
                    </button>
                )}
                {onStop && (
                    <button
                        type="button"
                        onClick={onStop}
                        style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${studio.dashed}`, background: 'none', color: studio.textFaint, font: 'inherit', fontSize: 12, cursor: 'pointer' }}
                    >
                        Stop machine
                    </button>
                )}
            </span>
        )}
    </section>
);

export default MachineCard;
