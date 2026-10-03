import React from 'react';
import { studio } from '../theme/studio';

export interface ChannelRailItem {
    id: string;
    name: string;
    unread?: number;
}

export interface ChannelRailProps {
    channels: ChannelRailItem[];
    selected?: string;
    onSelect?: (id: string) => void;
    onAdd?: () => void;
}

export const ChannelRail: React.FC<ChannelRailProps> = ({ channels, selected, onSelect, onAdd }) => (
    <nav
        aria-label="Channels"
        style={{
            width: 220,
            flexShrink: 0,
            borderRight: `1px solid ${studio.line}`,
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            fontFamily: studio.font,
            background: studio.ground,
        }}
    >
        <span style={{ padding: '0 8px 6px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: studio.textFaint }}>
            Channels
        </span>
        {channels.map((channel) => {
            const on = channel.id === selected;
            const unread = channel.unread && channel.unread > 0 ? channel.unread : 0;
            return (
                <button
                    key={channel.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onSelect?.(channel.id)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        border: 'none',
                        textAlign: 'left',
                        color: studio.text,
                        background: on ? '#2b2520' : 'none',
                        fontFamily: studio.font,
                    }}
                >
                    <span style={{ fontFamily: studio.mono, fontSize: 13 }}># {channel.name}</span>
                    {unread > 0 ? (
                        <span
                            style={{
                                fontSize: 11,
                                padding: '1px 7px',
                                borderRadius: 999,
                                background: studio.accent,
                                color: '#160d07',
                                fontWeight: 600,
                            }}
                        >
                            {unread}
                        </span>
                    ) : null}
                </button>
            );
        })}
        <button
            type="button"
            onClick={() => onAdd?.()}
            style={{
                marginTop: 6,
                padding: 8,
                borderRadius: 6,
                border: '1px dashed #3a342e',
                background: 'none',
                color: studio.textFaint,
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: studio.font,
            }}
        >
            Add a channel
        </button>
    </nav>
);
