// The real FilterChips with board 8's filters (source/Agents.dc.html).
// npm run gate:story -- --story examples/filter-chips/story.tsx --board 8-Agents.png --clip 28,164,442,33 --ground '#0f0e0d' --out examples/filter-chips/gate
import React from 'react'
import { FilterChips } from '../../src/components/FilterChips'

export default (
    <FilterChips
        value="all"
        onChange={() => {}}
        items={[
            { key: 'all', name: 'All', count: 9 },
            { key: 'working', name: 'Working', count: 3 },
            { key: 'waiting', name: 'Waiting', count: 3 },
            { key: 'idle', name: 'Listening', count: 2 },
            { key: 'off', name: 'Not listening', count: 1 },
        ]}
    />
)
