import { Inspector } from '../../src/components/Inspector'

const tone = { ok: '#9fd39b', warn: '#f0a070', muted: '#8a8178', '': '#c9c0b6' }
const lines = [
    ['$ npm test -- portal/src/studio', ''],
    ['  PASS  home.test.js (14 tests)', 'ok'],
    ['$ npm run shots -- --board Main', ''],
    ['  wrote shots/home-1440.png', ''],
    ['  wrote shots/home-390.png', ''],
    ['  comparing against canvas board 3…', 'muted'],
    ['  2 differences: header gap, agent row height', 'warn'],
    ['> fixing the header gap in Home.jsx', 'muted'],
] as const

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
        runs="cloud"
        terminal={<>
            {lines.map(([text, kind]) => (
                <span key={text} style={{ whiteSpace: 'pre', color: tone[kind] }}>{text}</span>
            ))}
            <span style={{ color: '#e8743b' }}>▌</span>
        </>}
        posts={[
            { at: '09:30', where: 'studio', text: 'pushed the Home screen; screenshots next' },
            { at: '09:02', where: 'studio', text: 'claimed Home screen' },
        ]}
    />
</div>
