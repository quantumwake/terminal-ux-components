import { WorkInspector } from '../../src/components/WorkInspector'

export default <div style={{ height: 887 }}>
    <WorkInspector
        kind="question"
        stage="Design"
        milestone="Approved"
        title="Approve the Projects screens"
        state="waiting on you · 2 h"
        objective="10 organizations on Cloud"
        who="champion"
        yours
        checks={[
            { done: true, text: 'Mockup published' },
            { done: false, text: 'Kasra approves it (organization check)' },
        ]}
        trail={[
            { at: '08:40', who: 'champion', what: 'posted the canvas' },
            { at: '08:55', who: 'security', what: 'added the channel-attach rule' },
        ]}
    />
</div>
