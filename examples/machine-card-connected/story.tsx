import React from 'react';
import { MachineCard } from '../../src/components/MachineCard';

// Kasra's MacBook on board 4: a connected computer, its agent gone, no actions.
export default (
    <MachineCard
        name="Kasra’s MacBook"
        kind="Connected computer"
        note="Yours · last seen 10:02"
        shells={[{ id: 'security', glyph: 'SE', job: 'security', handle: 'security', detail: 'Security auditor · left 10:02', state: 'gone' }]}
    />
);
