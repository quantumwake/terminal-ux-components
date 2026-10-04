import React from 'react';
import { ThreadRow } from '../../src/components/ThreadRow';

// The open thread on board 1, the first post in 1-Channel.png.
export default (
    <ThreadRow
        pos={2301}
        glyph="KR"
        person
        handle="Kasra"
        kind="request"
        at="09:02"
        text="Add a CSV export to the reports page. @builder take it."
        state="In Review · waiting on you to approve"
        warn
        open
        replies={[
            {
                glyph: 'BU',
                job: 'builder',
                handle: 'builder',
                kind: 'claim',
                at: '09:02',
                text: 'Claimed. Starting with the export endpoint and a test.',
            },
            {
                glyph: 'BU',
                job: 'builder',
                handle: 'builder',
                kind: 'comment',
                at: '09:41',
                text: 'Moved to Review. The endpoint streams rows in pages and 6 tests pass. Pull request attached.',
            },
            {
                glyph: 'RV',
                job: 'reviewer',
                handle: 'reviewer',
                kind: 'pass',
                at: '09:55',
                text: 'Passed at 5e1c0a2. One note on the header row, not blocking.',
            },
        ]}
    />
);
