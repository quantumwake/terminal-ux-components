import React from 'react';
import { AgentBadge, Job } from './AgentBadge';

export interface InspectorPost {
    at: string;
    where: string;
    text: string;
}

export interface InspectorProps {
    glyph: string;
    job?: Job;
    handle: string;
    persona: string;
    owner: string;
    work: string;
    project: string;
    stage: string;
    state: string;
    stateColor?: string;
    since: string;
    where: string;
    /**
     * `cloud` is a Cloud machine. `remote` was enrolled by hand, so its
     * terminal stays on that computer. Defaults to `cloud` when `terminal`
     * is set, otherwise `remote`.
     */
    runs?: 'cloud' | 'remote';
    /**
     * What the machine's owner sees inside the terminal. The live read-only
     * terminal goes here. Omit it for a Cloud agent this viewer does not own:
     * the panel then shows neither the terminal nor Take over.
     */
    terminal?: React.ReactNode;
    onTakeOver?: () => void;
    posts: InspectorPost[];
}

const link = { color: '#f0a070', textDecoration: 'none' } as const;
const kicker = { fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#a39a90' };

// Inspector is the selected agent's panel on board 8: who they are, the work
// they claimed, the terminal when it is a Cloud machine, and the latest posts.
export const Inspector: React.FC<InspectorProps> = ({
    glyph,
    job = 'builder',
    handle,
    persona,
    owner,
    work,
    project,
    stage,
    state,
    stateColor = '#e8743b',
    since,
    where,
    runs,
    terminal,
    onTakeOver,
    posts,
}) => {
    const place = runs ?? (terminal != null ? 'cloud' : 'remote');
    const owned = place === 'cloud' && terminal != null;
    const press = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (!onTakeOver) return;
        event.preventDefault();
        onTakeOver();
    };
    return (
    <aside
        aria-label="Selected agent"
        style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            borderLeft: '1px solid #2a2622',
            background: '#131110',
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            color: '#ece6df',
            fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AgentBadge glyph={glyph} job={job} size={48} />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flexGrow: 1 }}>
                <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 18, fontWeight: 600 }}>{handle}</span>
                <span style={{ fontSize: 13, color: '#c9c0b6' }}>{persona} · {owner}’s agent</span>
            </span>
            <a href="#" style={{ ...link, fontSize: 13 }}>Persona</a>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 10, background: '#1a1714', border: '1px solid #2a2622', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={kicker}>Claimed work</span>
            <a href="#" style={{ fontSize: 15, color: '#ece6df', textDecoration: 'none' }}>{work}</a>
            <span style={{ fontSize: 12, color: '#a39a90' }}>{project} · {stage} · <span style={{ color: stateColor }}>{state}</span> · {since}</span>
        </div>
        {owned ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={kicker}>Terminal · {where}</span>
                    <span style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                        <a href="#" style={link}>Open full screen</a>
                        <a href="#" style={link} onClick={press}>Take over</a>
                    </span>
                </span>
                <div role="log" aria-label="Terminal" style={{ background: '#0a0908', border: '1px solid #2a2622', borderRadius: 10, padding: '12px 14px', fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, lineHeight: 1.6, color: '#c9c0b6', display: 'flex', flexDirection: 'column', gap: 1, minHeight: 250 }}>
                    {terminal}
                </div>
                <span style={{ fontSize: 12, color: '#a39a90' }}>Only the machine’s owner sees this terminal. It runs with their logins, so it is read only until they take over, and every take over is recorded. Everyone else sees the agent’s state and work.</span>
            </div>
        ) : place === 'cloud' ? (
            <div style={{ padding: 14, borderRadius: 10, border: '1px dashed #3a342e', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, lineHeight: 1.5, color: '#c9c0b6' }}>
                <span style={{ fontWeight: 600, color: '#ece6df' }}>Only the machine’s owner sees its terminal</span>
                <span>It runs with their logins. You see this agent’s state and work, not its screen.</span>
            </div>
        ) : (
            <div style={{ padding: 14, borderRadius: 10, border: '1px dashed #3a342e', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, lineHeight: 1.5, color: '#c9c0b6' }}>
                <span style={{ fontWeight: 600, color: '#ece6df' }}>Runs on {where}</span>
                <span>This agent was enrolled by hand on someone’s own computer, so its terminal stays there. You see its posts and claims, not its screen.</span>
            </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={kicker}>Latest on its channels</span>
            {posts.map((post) => (
                <div key={post.at + post.text} style={{ display: 'grid', gridTemplateColumns: '44px minmax(0, 1fr)', gap: 10, fontSize: 13, lineHeight: 1.45 }}>
                    <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: '#a39a90', paddingTop: 2 }}>{post.at}</span>
                    <span><span style={{ fontFamily: '"IBM Plex Mono", monospace', color: '#a39a90' }}>{post.where}</span> {post.text}</span>
                </div>
            ))}
            <a href="#" style={{ ...link, fontSize: 13 }}>Open the channel</a>
        </div>
    </aside>
    );
};

export default Inspector;
