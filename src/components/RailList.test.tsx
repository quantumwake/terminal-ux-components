import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { studio } from '../theme/studio';
import { RailList } from './RailList';

const work = [
    { title: 'Approve the Projects screens', detail: 'waiting on you · Design', yours: true },
    { title: 'Members join on sign-in', detail: 'workspace · Build' },
];

const members = [
    { glyph: 'KR', person: true, name: 'Kasra', state: 'online' },
    { glyph: 'CC', job: 'builder' as const, name: 'cloud-cursor', state: 'working' },
    { glyph: 'MO', person: true, name: 'Morgan', state: 'away' },
];

describe('RailList', () => {
    it('counts the open work and marks the one waiting on you', () => {
        render(<RailList work={work} members={members} />);
        expect(screen.getByText('Open work here · 2')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Approve the Projects screens/ })).toHaveInlineStyle({ borderColor: studio.accentLine });
        expect(screen.getByText('working')).toHaveInlineStyle({ color: studio.accent });
        expect(screen.getByText('away')).toHaveInlineStyle({ color: studio.textFaint });
    });

    it('opens a work row', () => {
        const onOpen = vi.fn();
        render(<RailList work={work} members={members} onOpen={onOpen} />);
        fireEvent.click(screen.getByRole('button', { name: /Members join on sign-in/ }));
        expect(onOpen).toHaveBeenCalledWith(1);
    });

    it('renders a title as text', () => {
        const { container } = render(
            <RailList work={[{ title: '<img src=x onerror=alert(1)>', detail: 'note' }]} members={[]} />,
        );
        expect(container.querySelector('img')).toBeNull();
        expect(screen.getByText(/onerror/)).toBeInTheDocument();
    });
});
