// The real AgentBadge: cloud-cursor's, the first row of board 8 (the selected row, so its ground is #221d19).
// npm run gate:story -- --story examples/agent-badge/story.tsx --board 8-Agents.png --clip 45,262,30,30 --ground '#221d19' --out examples/agent-badge/gate
import React from 'react'
import { AgentBadge } from '../../src/components/AgentBadge'

export default <AgentBadge glyph="CC" job="builder" />
