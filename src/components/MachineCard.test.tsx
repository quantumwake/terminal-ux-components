import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { studio } from '../theme/studio';
import { MachineCard } from './MachineCard';

const shells = [
    { id: 'builder', glyph: 'BU', job: 'builder' as const, handle: 'builder', detail: 'Builder · CSV export', state: 'working' as const },
    { id: 'reviewer', glyph: 'RV', job: 'reviewer' as const, handle: 'reviewer', detail: 'Reviewer · listening', state: 'listening' as const },
];

describe('MachineCard', () => {
    it('draws the machine, its shells and rings the picked one', () => {
        render(<MachineCard name="studio-1" kind="Cloud" cloud note="Yours · running 3h · Standard · 2 shells" shells={shells} selected="builder" />);
        expect(screen.getByRole('region', { name: 'studio-1' })).toBeInTheDocument();
        expect(screen.getByText('Cloud')).toHaveInlineStyle({ color: studio.link });
        const picked = screen.getByRole('button', { name: /builder/ });
        expect(picked).toHaveAttribute('aria-pressed', 'true');
        expect(picked).toHaveInlineStyle({ borderColor: studio.accent, background: studio.selected });
        expect(screen.getByRole('button', { name: /reviewer/ })).toHaveAttribute('aria-pressed', 'false');
        expect(screen.getByRole('img', { name: 'working' })).toHaveInlineStyle({ background: studio.accent });
        expect(screen.getByRole('img', { name: 'listening' })).toHaveInlineStyle({ background: studio.job.person });
    });

    it('puts the menu in the header row, after the kind', () => {
        const { rerender } = render(<MachineCard name="Kasra’s MacBook" kind="Connected computer" note="n" shells={shells} menu={<button type="button" aria-label="More for Kasra’s MacBook">⋯</button>} />);
        const more = screen.getByRole('button', { name: 'More for Kasra’s MacBook' });
        const header = screen.getByText('Kasra’s MacBook').parentElement!;
        expect(header.contains(more)).toBe(true);
        expect(screen.getByText('Connected computer').nextElementSibling).toBe(more);
        rerender(<MachineCard name="Kasra’s MacBook" kind="Connected computer" note="n" shells={shells} />);
        expect(screen.queryByRole('button', { name: /^More for/ })).toBeNull();
    });

    it('picks a shell', () => {
        const onSelect = vi.fn();
        render(<MachineCard name="studio-1" kind="Cloud" cloud note="n" shells={shells} onSelect={onSelect} />);
        fireEvent.click(screen.getByRole('button', { name: /reviewer/ }));
        expect(onSelect).toHaveBeenCalledWith('reviewer');
    });

    it('shows a Cloud machine’s actions only when given, and runs them', () => {
        const onNewShell = vi.fn();
        const onStop = vi.fn();
        const { rerender } = render(<MachineCard name="studio-1" kind="Cloud" cloud note="n" shells={shells} onNewShell={onNewShell} onStop={onStop} />);
        fireEvent.click(screen.getByRole('button', { name: 'New shell' }));
        fireEvent.click(screen.getByRole('button', { name: 'Stop machine' }));
        expect(onNewShell).toHaveBeenCalledOnce();
        expect(onStop).toHaveBeenCalledOnce();
        rerender(<MachineCard name="Kasra’s MacBook" kind="Connected computer" note="Yours · last seen 10:02" shells={[{ ...shells[1], state: 'gone' }]} />);
        expect(screen.queryByRole('button', { name: 'New shell' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Stop machine' })).toBeNull();
        expect(screen.getByText('Connected computer')).toHaveInlineStyle({ color: studio.textFaint });
        // Gone is a hollow dashed ring, as AgentState draws it everywhere.
        expect(screen.getByRole('img', { name: 'gone' })).toHaveInlineStyle({ borderStyle: 'dashed', borderColor: studio.textQuiet });
    });

    it('renders names as text', () => {
        const { container } = render(<MachineCard name="<img src=x onerror=alert(1)>" kind="Cloud" note="n" shells={[{ ...shells[0], handle: '<b>x</b>' }]} />);
        expect(container.querySelector('img')).toBeNull();
        expect(container.querySelector('b')).toBeNull();
    });

    it('keeps a long shell name on one line inside the card', () => {
        const long = 'x'.repeat(40);
        render(<MachineCard name="m" kind="Cloud" cloud note="n" shells={[{ id: 's', glyph: 'XX', job: 'builder', handle: long, detail: 'd', state: 'working' }]} selected="" onSelect={() => {}} />);
        const name = screen.getByText(long);
        expect(name).toHaveInlineStyle({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' });
        expect(name).toHaveAttribute('title', long);
    });
});

describe('MachineCard agent states', () => {
    const more = [
        { id: 't', glyph: 'TH', handle: 'thinker', detail: 'Builder · thinking', state: 'thinking' as const },
        { id: 'w', glyph: 'WA', handle: 'waiter', detail: 'Reviewer · waiting on you', state: 'waiting' as const },
        { id: 'k', glyph: 'WK', handle: 'worker', detail: 'Builder · CSV export', state: 'working' as const },
    ];

    it('draws a new state’s dot, named by the state', () => {
        render(<MachineCard name="m" kind="Cloud" note="n" shells={more} />);
        expect(screen.getByRole('img', { name: 'thinking' })).toHaveAttribute('data-state', 'thinking');
        expect(screen.getByRole('img', { name: 'waiting' })).toHaveAttribute('data-state', 'waiting');
        expect(screen.getByRole('img', { name: 'working' })).toHaveInlineStyle({ background: studio.accent });
    });

    it('moves busy and waiting shells only with animate', () => {
        const { container, rerender } = render(<MachineCard name="m" kind="Cloud" note="n" shells={more} />);
        expect(container.querySelector('style')).toBeNull();
        rerender(<MachineCard name="m" kind="Cloud" note="n" shells={more} animate />);
        expect(container.querySelector('[data-state="thinking"]')).toHaveClass('tuxc-state-thinking');
        expect(container.querySelector('[data-state="working"]')).toHaveClass('tuxc-state-working');
        expect(container.querySelectorAll('style')).toHaveLength(1);
    });
});

describe('MachineCard with an unknown state (security @1295)', () => {
    it('draws that shell as gone, and the others as given', () => {
        const odd = { id: 'o', glyph: 'OD', handle: 'odd', detail: 'd', state: 'rate-limited' as unknown as 'gone' };
        render(<MachineCard name="m" kind="Cloud" note="n" shells={[odd, shells[0]]} animate />);
        expect(screen.getByRole('button', { name: /odd/ }).querySelector('[data-state="gone"]')).not.toBeNull();
        expect(screen.getByRole('img', { name: 'working' })).toBeInTheDocument();
    });
});
