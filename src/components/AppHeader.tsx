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
                gap: 20,
                padding: '14px 28px',
                background: studio.header,
                borderBottom: `1px solid ${studio.line}`,
                fontFamily: studio.font,
                color: studio.text,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
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
                        color: '#160d07',
                        fontFamily: studio.mono,
                        fontWeight: 600,
                        fontSize: 14,
                        flex: 'none',
                    }}
                >
                    {mark}
                </span>
                <span style={{ fontSize: 17, fontWeight: 600, whiteSpace: 'nowrap' }}>{product}</span>
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
                            background: '#1c1a17',
                            color: studio.text,
                            border: `1px solid ${studio.line}`,
                            borderRadius: 8,
                            padding: '7px 12px',
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
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        border: 0,
                        borderRadius: 8,
                        padding: '10px 16px',
                        background: studio.accent,
                        color: '#160d07',
                        font: 'inherit',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                    {action.label}
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
