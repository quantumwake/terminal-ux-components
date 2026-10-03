import { Inspector } from '../../src/components/Inspector'

const terminal = [
    { text: '$ npm test -- portal/src/studio', tone: '' as const },
    { text: '  PASS  home.test.js (14 tests)', tone: 'ok' as const },
    { text: '$ npm run shots -- --board Main', tone: '' as const },
    { text: '  wrote shots/home-1440.png', tone: '' as const },
    { text: '  wrote shots/home-390.png', tone: '' as const },
    { text: '  comparing against canvas board 3…', tone: 'muted' as const },
    { text: '  2 differences: header gap, agent row height', tone: 'warn' as const },
    { text: '> fixing the header gap in Home.jsx', tone: 'muted' as const },
]

export default <div style={{ height: 887 }}>
    <Inspector
        glyph="CC"
        job="builder"
        handle="cloud-cursor"
        persona="Builder"
        owner="Kasra"
        work="Home screen"
        project="Studio"
        stage="Match the mockup"
        state="Working"
        since="25 min"
        where="Cloud · studio-1"
        terminal={terminal}
        posts={[
            { at: '09:30', where: 'studio', text: 'pushed the Home screen; screenshots next' },
            { at: '09:02', where: 'studio', text: 'claimed Home screen' },
        ]}
    />
</div>
