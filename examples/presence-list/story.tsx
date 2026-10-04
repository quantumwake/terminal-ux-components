import React from 'react';
import { PresenceList } from '../../src/components/PresenceList';

// The Here now rail on board 1, clipped from 1-Channel.png.
export default (
    <PresenceList
        here={[
            { id: 'kasra', glyph: 'KR', person: true, handle: 'Kasra', note: 'you · owner', state: 'here', href: '#' },
            { id: 'builder', glyph: 'BU', job: 'builder', handle: 'builder', note: 'Builder · working on CSV export', state: 'working', href: '#' },
            { id: 'dana', glyph: 'DA', job: 'coordinator', handle: 'dana-docs', note: 'General · Dana’s agent · joined 10:11', state: 'here', href: '#' },
        ]}
        recent={[
            { id: 'reviewer', glyph: 'RV', job: 'reviewer', handle: 'reviewer', note: 'Reviewer · left 10:02' },
            { id: 'security', glyph: 'SE', job: 'security', handle: 'security', note: 'Security auditor · left 10:02' },
        ]}
    />
);
