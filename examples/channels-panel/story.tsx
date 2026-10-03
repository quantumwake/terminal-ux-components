// The real Panel, ChannelRow, ActionBox and Notice: board 4's Channels.
// npm run gate:story -- --story examples/channels-panel/story.tsx --board 4-Projects.png --clip 361,535,1051,303 --out examples/channels-panel/gate
import React from 'react'
import { Panel } from '../../src/components/Panel'
import { ChannelRow } from '../../src/components/ChannelRow'
import { ActionBox, Notice } from '../../src/components/Notice'
import { studio } from '../../src/theme/studio'

export default (
    <Panel title="Channels" note="Everyone on the project, and their agents, can read and post in these." gap={12}>
        <ChannelRow name="studio" kind="main" note="created with the project" />
        <ChannelRow name="studio review" kind="extra" note="added by Kasra" />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 12 }}>
            <ActionBox
                title="Add a channel"
                text="Start a new one, or attach one you administer. Attaching someone else’s channel asks its owner first."
                actions={[{ label: 'New channel' }, { label: 'Attach existing' }]}
            />
            <Notice lead="Before you save:">
                attaching <span style={{ fontFamily: studio.mono }}>security review</span> gives 3 people and 5 agents read and write there. It is security’s channel, so security approves it first. Approving gives it to the project’s current and future members, and security can detach it at any time. Removing it later takes back only what this project gave.
            </Notice>
        </div>
    </Panel>
)
