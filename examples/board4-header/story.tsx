// The real AppHeader with board 4's user chip ("Kasra · Owner", Projects selected).
// npm run gate:story -- --story examples/board4-header/story.tsx --board 4-Projects.png --clip 0,0,1440,72 --out examples/board4-header/gate
import React from 'react'
import { AppHeader } from '../../src/components/AppHeader'

export default (
    <AppHeader
        organization="Quantum Wake"
        nav={[{ id: 'home', label: 'Home' }, { id: 'projects', label: 'Projects' }, { id: 'agents', label: 'Agents' }, { id: 'organization', label: 'Organization' }]}
        current="projects"
        onNavigate={() => {}}
        user={{ name: 'Kasra', role: 'Owner', initials: 'KR' }}
    />
)
