import React from 'react';
import { studio } from '../theme/studio';
import { SegmentedNav, SegmentedNavItem } from './SegmentedNav';

export interface AppHeaderProps {
    product?: string;
    mark?: string;
    organization: string;
    organizations?: string[];
    onOrganization?: (name: string) => void;
    nav: SegmentedNavItem[];
    current: string;
    onNavigate: (id: string) => void;
    user?: { name: string; role: string };
    action?: { label: string; onClick?: () => void };
}

function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '');
    return letters.join('') || '?';
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    product = 'Agent Studio',
    mark = 'A',
    organization,
    organizations,
    onOrganization,
    nav,
    current,
    onNavigate,
    user,
    action,
}) => {
    const choices = organizations && organizations.length > 0 ? organizations : [organization];
    return (
        <header
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                height: 72,
                padding: '0 28px',
                background: studio.header,
                borderBottom: `1px solid ${studio.line}`,
                fontFamily: studio.font,
                color: studio.text,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span
                    aria-hidden="true"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: studio.accent,
                        color: studio.ground,
                        fontWeight: 650,
                        fontSize: 14,
                        flex: 'none',
                    }}
                >
                    {mark}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>{product}</span>
                <label style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                        Organization
                    </span>
                    <select
                        aria-label="Organization"
                        value={organization}
                        onChange={(event) => onOrganization?.(event.target.value)}
                        style={{
                            appearance: 'none',
                            background: studio.header,
                            color: studio.textMuted,
                            border: `1px solid ${studio.line}`,
                            borderRadius: 8,
                            padding: '4px 28px 4px 10px',
                            font: 'inherit',
                            fontSize: 13,
                        }}
                    >
                        {choices.map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </label>
            </div>
            <SegmentedNav items={nav} value={current} onChange={onNavigate} />
            {action ? (
                <button
                    type="button"
                    onClick={action.onClick}
                    style={{
                        border: 0,
                        borderRadius: 8,
                        height: 38,
                        padding: '0 16px',
                        background: studio.accent,
                        color: studio.ground,
                        font: 'inherit',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    + {action.label}
                </button>
            ) : user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span
                        aria-hidden="true"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: studio.job.person,
                            color: studio.ground,
                            fontSize: 11,
                            fontWeight: 650,
                        }}
                    >
                        {initials(user.name)}
                    </span>
                    <span>
                        {user.name}
                        <span style={{ color: studio.textFaint }}> · {user.role}</span>
                    </span>
                </div>
            ) : null}
        </header>
    );
};

export default AppHeader;
