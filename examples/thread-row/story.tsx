import React from 'react';
import { ThreadRow } from '../../src/components/ThreadRow';

// A request with one reply, at a column width. The reply box is empty.
export default (
    <div style={{ width: 640 }}>
        <ThreadRow
            post={{
                glyph: 'CH',
                job: 'coordinator',
                handle: 'champion',
                kind: 'request',
                at: '08:40',
                text: 'Approve the screens before the build starts.',
            }}
            replies={[
                {
                    glyph: 'KR',
                    person: true,
                    handle: 'kasra',
                    kind: 'comment',
                    at: '08:44',
                    text: 'Approved. Start with the channel.',
                },
            ]}
        />
    </div>
);
