// The real Panel, MemberRow, PersonBadge and AgentBadge: board 4's People and
// Agents side by side, in the board's own two-column grid (1051 px, gap 16),
// so the Agents panel starts at the board's fractional x (894.5), as it does
// on the screen.
// npm run gate:story -- --story examples/project-members/story.tsx --board 4-Projects.png --clip 361,166,1051,353 --out examples/project-members/gate
import React from 'react'
import { Panel } from '../../src/components/Panel'
import { MemberRow } from '../../src/components/MemberRow'
import { PersonBadge } from '../../src/components/PersonBadge'
import { AgentBadge } from '../../src/components/AgentBadge'

const people = [['KR', 'Kasra', 'Project owner'], ['MO', 'Morgan', 'Admin'], ['SA', 'Sam', 'Member']]
const agents = [
    ['champion', 'CH', 'coordinator', 'Coordinator · Kasra’s · This Mac', 'Propose'],
    ['cloud-cursor', 'CC', 'builder', 'Builder · Kasra’s · This Mac', 'Design, Build'],
    ['sam-builder', 'SB', 'builder', 'Builder · Sam’s · Cloud · sam-1', 'Build'],
    ['reviewer', 'RV', 'reviewer', 'Reviewer · Kasra’s · This Mac', 'Review'],
    ['security', 'SE', 'security', 'Security · Kasra’s · This Mac', 'every stage'],
] as const

export default (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16, width: 1051 }}>
        <Panel title="People" action={{ label: 'Add person' }}>
            {people.map(([g, name, note]) => <MemberRow key={name} badge={<PersonBadge glyph={g} size={28} />} name={name} note={note} />)}
        </Panel>
        <Panel title="Agents" action={{ label: 'Add one of my agents' }}>
            {agents.map(([h, g, job, detail, stages]) => <MemberRow key={h} badge={<AgentBadge glyph={g} job={job} size={28} />} name={h} mono detail={detail} note={stages} />)}
        </Panel>
    </div>
)
