// Mounts the built AppHeader. The pixel gate loads this page, not a copy of the mockup.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppHeader } from '../../dist/index.js';

const h = React.createElement;

createRoot(document.getElementById('root')).render(h(AppHeader, {
    organization: 'Quantum Wake',
    nav: [
        { id: 'home', label: 'Home' },
        { id: 'projects', label: 'Projects' },
        { id: 'agents', label: 'Agents' },
        { id: 'organization', label: 'Organization' },
    ],
    current: 'agents',
    onNavigate: () => {},
    action: { label: 'New agent' },
}));
