import React from 'react';
import { ThreadRow } from '../../src/components/ThreadRow';

// A post with no replies yet, opened with its Reply button: the reply field
// shows under it so the first reply can be written. Board 1 draws no such
// post (its open thread has replies), so this story has no board region to
// match; its shot is the check, and examples/thread-row stays the board gate.
export default (
    <ThreadRow
        pos={2302}
        glyph="KR"
        person
        handle="Kasra"
        kind="request"
        at="10:05"
        text="Can someone check the header row on the CSV export?"
        open
        replies={[]}
    />
);
