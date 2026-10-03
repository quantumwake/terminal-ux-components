import React, { useEffect, useRef, useState } from 'react';
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
    user?: { name: string; role: string; initials?: string };
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
    const [orgOpen, setOrgOpen] = useState(false);
    const [orgActive, setOrgActive] = useState(0);
    const chipRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLSpanElement>(null);
    const choices = organizations && organizations.length > 0 ? organizations : [organization];
    const closeOrg = (focusChip: boolean) => {
        setOrgOpen(false);
        if (focusChip) chipRef.current?.focus();
    };
    useEffect(() => {
        if (!orgOpen) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeOrg(true);
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                setOrgActive((index) => {
                    const step = event.key === 'ArrowDown' ? 1 : -1;
                    return (index + step + choices.length) % choices.length;
                });
            }
        };
        const onPointer = (event: MouseEvent) => {
            const target = event.target as Node;
            if (menuRef.current?.contains(target) || chipRef.current?.contains(target)) return;
            setOrgOpen(false);
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onPointer);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onPointer);
        };
    }, [orgOpen, choices.length]);
    useEffect(() => {
        if (!orgOpen) return;
        menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')[orgActive]?.focus();
    }, [orgOpen, orgActive]);
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
                <span style={{ position: 'relative' }}>
                    <button
                        ref={chipRef}
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={orgOpen}
                        onClick={() => {
                            if (orgOpen) setOrgOpen(false);
                            else {
                                setOrgActive(Math.max(0, choices.indexOf(organization)));
                                setOrgOpen(true);
                            }
                        }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '7px 12px',
                            borderRadius: 8,
                            border: `1px solid ${studio.line}`,
                            background: '#1c1a17',
                            color: studio.text,
                            font: 'inherit',
                            fontSize: 13,
                            cursor: 'pointer',
                        }}
                    >
                        {organization}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                    {orgOpen ? (
                        <span
                            ref={menuRef}
                            role="menu"
                            aria-label="Organizations"
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                marginTop: 4,
                                minWidth: '100%',
                                background: '#1c1a17',
                                border: `1px solid ${studio.line}`,
                                borderRadius: 8,
                                padding: 4,
                                zIndex: 1,
                            }}
                        >
                            {choices.map((name) => (
                                <button
                                    key={name}
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setOrgOpen(false);
                                        onOrganization?.(name);
                                    }}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        border: 0,
                                        borderRadius: 6,
                                        padding: '6px 10px',
                                        background: 'transparent',
                                        color: studio.text,
                                        font: 'inherit',
                                        fontSize: 13,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {name}
                                </button>
                            ))}
                        </span>
                    ) : null}
                </span>
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
                        {user.initials || initials(user.name)}
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
