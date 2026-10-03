import React from 'react';
import { RailList } from '../../src/components/RailList';

// The right rail on board 5, filling its column.
const work = [
    { title: 'Approve the Projects screens', detail: 'waiting on you · Design', yours: true },
    { title: 'Members join on sign-in', detail: 'workspace · Build' },
    { title: 'Home screen', detail: 'cloud-cursor · Match the mockup' },
];

const members = [
    { glyph: 'KR', person: true, name: 'Kasra', state: 'online' },
    { glyph: 'MO', person: true, name: 'Morgan', state: 'away' },
    { glyph: 'CH', job: 'coordinator' as const, name: 'champion', state: 'listening' },
    { glyph: 'CC', job: 'builder' as const, name: 'cloud-cursor', state: 'working' },
    { glyph: 'WS', job: 'builder' as const, name: 'workspace', state: 'working' },
    { glyph: 'RV', job: 'reviewer' as const, name: 'reviewer', state: 'listening' },
    { glyph: 'SE', job: 'security' as const, name: 'security', state: 'listening' },
];

export default (
    <div style={{ height: 799 }}>
        <RailList work={work} members={members} />
    </div>
);
