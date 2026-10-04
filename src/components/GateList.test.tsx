import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GateList, type GateRow } from './GateList';

const gates: GateRow[] = [
    { id: 'build', from: 'Build', to: 'Review', kind: 'evidence', met: true, note: 'builder is here' },
    { id: 'review', from: 'Review', to: 'Approve', kind: 'pass', note: 'dana-docs (General) could give it · suggested: Reviewer' },
    { id: 'approve', from: 'Approve', to: 'Done', kind: 'approval', met: true, note: 'you are here' },
];

describe('GateList', () => {
    it('names each gate by its kind', () => {
        render(<GateList name="Ship software v3" href="/workflow" gates={gates} />);
        const list = screen.getByRole('region', { name: 'Gates' });
        expect(screen.getByRole('link', { name: 'Ship software v3' })).toHaveAttribute('href', '/workflow');
        expect(list).toHaveTextContent('Build → Review · evidence attached');
        expect(list).toHaveTextContent('Review → Approve · pass from another agent');
        expect(list).toHaveTextContent('Approve → Done · approval by an owner');
        expect(list.textContent).not.toMatch(/→ [^·]*Reviewer/);
    });

    it('marks a gate that is not met', () => {
        render(<GateList name="Ship" gates={gates} />);
        expect(screen.getAllByText('✓')).toHaveLength(2);
        expect(screen.getByText('!')).toBeInTheDocument();
    });

    it('offers the action', () => {
        const onClick = vi.fn();
        render(<GateList name="Ship" gates={[]} action={{ label: 'Start a Reviewer', onClick }} />);
        fireEvent.click(screen.getByRole('button', { name: 'Start a Reviewer' }));
        expect(onClick).toHaveBeenCalledOnce();
    });

    it('renders a note as text', () => {
        const { container } = render(
            <GateList name="Ship" gates={[{ id: 'n', from: 'Build', to: 'Review', kind: 'none', note: '<img src=x onerror=alert(1)>' }]} />,
        );
        expect(container.querySelector('img')).toBeNull();
        expect(screen.getByRole('region', { name: 'Gates' })).toHaveTextContent('Build → Review · no gate');
        expect(screen.getByText(/onerror/)).toBeInTheDocument();
    });
});
