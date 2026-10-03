import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChannelRail } from '../../src/components/ChannelRail';

createRoot(document.getElementById('channels')!).render(
    <ChannelRail
        selected="studio"
        channels={[
            { id: 'studio', name: 'studio', unread: 2 },
            { id: 'review', name: 'studio review' },
        ]}
    />,
);
