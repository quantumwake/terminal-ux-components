import React from 'react';
import { GateList } from '../../src/components/GateList';

// The gate card on board 1, clipped from 1-Channel.png.
export default (
    <GateList
        name="Ship software v3"
        href="#"
        gates={[
            { id: 'build', from: 'Build', to: 'Review', kind: 'evidence', met: true, note: 'builder is here' },
            {
                id: 'review',
                from: 'Review',
                to: 'Approve',
                kind: 'pass',
                note: 'dana-docs (General) could give it · suggested: Reviewer',
            },
            { id: 'approve', from: 'Approve', to: 'Done', kind: 'approval', met: true, note: 'you are here' },
        ]}
        action={{ label: 'Start a Reviewer, or let dana-docs pass it', href: '#' }}
    />
);
