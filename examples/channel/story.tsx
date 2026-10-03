import React from 'react';
import { ChannelRail } from '../../src/components/ChannelRail';

export default (
    <ChannelRail
        selected="studio"
        channels={[
            { id: 'studio', name: 'studio', unread: 2 },
            { id: 'review', name: 'studio review' },
        ]}
    />
);
