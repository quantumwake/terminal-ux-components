import { SelectableRowTable } from '../../src/components/SelectableRowTable'

const tint = { Coordinator: '#f2b35b', Builder: '#e8743b', Reviewer: '#6ea8d9', Security: '#c79bd8' }
const stateColor = { Working: '#e8743b', 'Waiting on you': '#f0a070', 'Waiting on reviewer': '#f0a070', Listening: '#6ea8d9', 'Not listening': '#a39a90' }
const agents = [["cloud-cursor","CC","Builder","Home screen","Studio","Match the mockup","Working","Cloud · studio-1","Cloud"],["workspace","WS","Builder","Members join on sign-in","Studio","Build","Working","Cloud · devcloud","Cloud"],["sam-builder","SB","Builder","Pricing survey write-up","Pricing research","Dig in","Working","Cloud · sam-1","Cloud"],["champion","CH","Coordinator","Approve the Projects screens","Studio","Design","Waiting on you","Kasra’s MacBook","Enrolled by hand"],["reviewer","RV","Reviewer","Agents roster","Studio","Review","Listening","Kasra’s MacBook","Enrolled by hand"],["security","SE","Security","Design 21: projects and access","Studio","Review","Listening","Kasra’s MacBook","Enrolled by hand"],["ledger","LE","Builder","Invoice from the hourly rollup","Billing","Build","Waiting on reviewer","Cloud · devcloud","Cloud"],["parley-delivery","PD","Builder","Rename over a busy binary","parley","Review","Waiting on reviewer","Kasra’s MacBook","Enrolled by hand"],["closer","CL","Builder","nothing claimed","—","—","Not listening","Kasra’s MacBook","Enrolled by hand"]]

function badge(persona: string, glyph: string) {
    return <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 7, background: tint[persona], color: '#160d07', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600, fontSize: 11 }}>{glyph}</span>
}

export default <SelectableRowTable
    label="Agents"
    value="cloud-cursor"
    onSelect={() => {}}
    columns={[
        { label: 'Agent', width: '200px' },
        { label: 'Working on', width: 'minmax(0, 2fr)' },
        { label: 'Stage', width: '130px' },
        { label: 'State', width: '120px' },
        { label: 'Runs on', width: '150px' },
    ]}
    rows={agents.map(([handle, glyph, persona, work, project, stage, state, where, kind]) => ({
        id: handle,
        cells: [
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>{badge(persona, glyph)}<span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}><span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13 }}>{handle}</span><span style={{ fontSize: 11, color: '#a39a90' }}>{persona}</span></span></span>,
            <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}><span style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{work}</span><span style={{ fontSize: 12, color: '#a39a90' }}>{project}</span></span>,
            <span style={{ fontSize: 13, color: '#c9c0b6' }}>{stage}</span>,
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}><span style={state === 'Not listening' ? { width: 8, height: 8, borderRadius: '50%', flexShrink: 0, border: '1px dashed #8a8178' } : { width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: stateColor[state] }} /><span style={{ color: stateColor[state] }}>{state}</span></span>,
            <span style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 13 }}>{where}</span><span style={{ fontSize: 11, color: '#a39a90' }}>{kind}</span></span>,
        ],
    }))}
/>
