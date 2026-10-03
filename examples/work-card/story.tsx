import React from 'react';
import { WorkCard } from '../../src/components/WorkCard';

// A lane lays the card out as a flex child. This story does the same,
// at the card's own width, so the gate measures WorkCard.
export default (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', background: '#141210' }}>
        <WorkCard
            selected
            item={{
                id: 'screens',
                kind: 'question',
                title: 'Approve the Projects screens',
                who: 'champion',
                objective: '10 organizations on Cloud',
                flag: 'yours',
                yours: true,
            }}
        />
    </div>
);
