// The real SegmentedNav, small: board 4's project tabs. In the board they are
// npm run gate:story -- --story examples/project-tabs/story.tsx --board 4-Projects.png --clip 1056,107,356,41 --out examples/project-tabs/gate
// right-aligned against the main column's edge (x 1412), so the story
// right-aligns them in a box that ends there.
import React from 'react'
import { SegmentedNav } from '../../src/components/SegmentedNav'

export default (
    <span style={{ display: 'flex', justifyContent: 'flex-end', width: 356 }}>
        <SegmentedNav size="small" label="Project" value="people" onChange={() => {}}
            items={[{ id: 'board', label: 'Board' }, { id: 'channel', label: 'Channel' }, { id: 'people', label: 'People and agents' }, { id: 'settings', label: 'Settings' }]} />
    </span>
)
