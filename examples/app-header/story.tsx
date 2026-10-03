import { AppHeader } from '../../src/components/AppHeader'

export default <AppHeader
    organization="Quantum Wake"
    nav={[
        { id: 'home', label: 'Home' },
        { id: 'projects', label: 'Projects' },
        { id: 'agents', label: 'Agents' },
        { id: 'organization', label: 'Organization' },
    ]}
    current="agents"
    onNavigate={() => {}}
    action={{ label: 'New agent' }}
/>
