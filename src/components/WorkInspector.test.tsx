import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { WorkInspector } from './WorkInspector';

const item = {
    kind: 'question',
    stage: 'Design',
    milestone: 'Approved',
    title: 'Approve the Projects screens',
    state: 'waiting on you · 2 h',
    objective: '10 organizations on Cloud',
    who: 'champion',
    checks: [
        { done: true, text: 'Mockup published' },
        { done: false, text: 'Kasra approves it (organization check)' },
    ],
    trail: [
        { at: '08:40', who: 'champion', what: 'posted the canvas' },
        { at: '08:55', who: 'security', what: 'added the channel-attach rule' },
    ],
};

describe('WorkInspector', () => {
    it('shows the work, the checks, and the owner actions', () => {
        const onApprove = vi.fn();
        render(<WorkInspector {...item} yours onApprove={onApprove} />);
        expect(screen.getByRole('complementary', { name: 'Selected item' })).toBeInTheDocument();
        expect(screen.getByText('Objective')).toBeInTheDocument();
        expect(screen.getByText('10 organizations on Cloud')).toBeInTheDocument();
        expect(screen.getByText('To move on')).toBeInTheDocument();
        expect(screen.getByText('Mockup published')).toBeInTheDocument();
        expect(screen.getByText('✓')).toBeInTheDocument();
        expect(screen.getByText('○')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
        expect(onApprove).toHaveBeenCalledOnce();
        expect(screen.queryByRole('button', { name: 'Link an objective' })).not.toBeInTheDocument();
    });

    it('offers to link an objective when the item has none', () => {
        const onLink = vi.fn();
        render(<WorkInspector {...item} unlinked onLink={onLink} />);
        fireEvent.click(screen.getByRole('button', { name: 'Link an objective' }));
        expect(onLink).toHaveBeenCalledOnce();
        expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    });
});
