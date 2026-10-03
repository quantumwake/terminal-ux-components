// The real ListPicker with board 4's projects, Studio chosen.
// npm run gate:story -- --story examples/list-picker/story.tsx --board 4-Projects.png --clip 0,73,333,887 --out examples/list-picker/gate
import React from 'react'
import { ListPicker } from '../../src/components/ListPicker'

export default (
    <div style={{ height: 887, display: 'flex' }}>
        <ListPicker
            label="Projects"
            searchLabel="Find a project"
            searchPlaceholder="Search projects"
            value="studio"
            onSelect={() => {}}
            action={{ label: 'New project' }}
            items={[
                { id: 'studio', name: 'Studio', hint: 'Launch Studio · 4 agents' },
                { id: 'cloud', name: 'Cloud', hint: 'Launch Studio · Bill for usage' },
                { id: 'parley', name: 'parley', hint: 'Launch Studio · 3 agents' },
                { id: 'billing', name: 'Billing', hint: 'Bill for usage · 1 agent' },
                { id: 'site', name: 'Website', hint: 'Launch Studio · 2 agents' },
                { id: 'research', name: 'Pricing research', hint: 'Bill for usage · 1 agent' },
            ]}
        />
    </div>
)
