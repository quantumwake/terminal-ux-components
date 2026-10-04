import React from 'react';
import { MachineCard } from '../../src/components/MachineCard';

// studio-1 on board 4: a Cloud machine with two shells, builder picked.
const shells = [
    { id: 'builder', glyph: 'BU', job: 'builder' as const, handle: 'builder', detail: 'Builder · CSV export', state: 'working' as const },
    { id: 'reviewer', glyph: 'RV', job: 'reviewer' as const, handle: 'reviewer', detail: 'Reviewer · listening', state: 'listening' as const },
];

export default (
    <MachineCard name="studio-1" kind="Cloud" cloud note="Yours · running 3h · Standard · 2 shells" shells={shells} selected="builder" onNewShell={() => {}} onStop={() => {}} />
);
