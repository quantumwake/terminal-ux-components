import React from 'react';
import { AgentStateLabel, type AgentStateName } from '../../src/components/AgentState';
import { PresenceList } from '../../src/components/PresenceList';
import { MachineCard } from '../../src/components/MachineCard';

// Every agent state, the way Studio draws it (product proposals @1251,
// @1286): each on its own, then the channel rail and a machine card with a
// mix. Motion is on, as a screen with animate draws it.
const states: { state: AgentStateName; since: string }[] = [
    { state: 'starting', since: '4s' },
    { state: 'thinking', since: '20s' },
    { state: 'working', since: '2m' },
    { state: 'waiting', since: '5m' },
    { state: 'listening', since: 'last post 4m ago' },
    { state: 'gone', since: 'left 10:42' },
];

export default (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 260 }}>
            {states.map((s) => (
                <AgentStateLabel key={s.state} state={s.state} since={s.since} animate />
            ))}
        </div>
        <div style={{ width: 300 }}>
            <PresenceList
                animate
                here={[
                    { id: 'kasra', glyph: 'KR', person: true, handle: 'Kasra', note: 'you · owner', state: 'listening', since: 'writing now' },
                    { id: 'b1', glyph: 'B1', job: 'builder', handle: 'builder-1', note: 'Builder', state: 'working', activity: 'working', since: '2m' },
                    { id: 'b2', glyph: 'B2', job: 'builder', handle: 'builder-2', note: 'Builder', state: 'thinking', since: '20s' },
                    { id: 'rv', glyph: 'RV', job: 'reviewer', handle: 'reviewer', note: 'Reviewer', state: 'waiting', since: '5m' },
                    { id: 'sc', glyph: 'SC', job: 'security', handle: 'security', note: 'Security', state: 'listening', since: 'last post 4m ago' },
                    { id: 'st', glyph: 'ST', job: 'coordinator', handle: 'starter', note: 'General', state: 'starting' },
                ]}
                recent={[{ id: 'old', glyph: 'OL', job: 'builder', handle: 'builder-3', note: 'Builder · left 10:42' }]}
            />
        </div>
        <div style={{ width: 320 }}>
            <MachineCard
                name="studio-1"
                kind="Cloud"
                cloud
                note="Yours · running 3h · Standard · 4 shells"
                animate
                shells={[
                    { id: 'b1', glyph: 'B1', job: 'builder', handle: 'builder-1', detail: 'Builder · CSV export · working 2m', state: 'working' },
                    { id: 'b2', glyph: 'B2', job: 'builder', handle: 'builder-2', detail: 'Builder · thinking 20s', state: 'thinking' },
                    { id: 'rv', glyph: 'RV', job: 'reviewer', handle: 'reviewer', detail: 'Reviewer · #465 · waiting on you 5m', state: 'waiting' },
                    { id: 'gn', glyph: 'OL', job: 'builder', handle: 'builder-3', detail: 'Builder · left 10:42', state: 'gone' },
                ]}
            />
        </div>
    </div>
);
