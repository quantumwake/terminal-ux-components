import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { studio } from '../theme/studio';
import { SwimLanes } from './SwimLanes';
import { WorkCard } from './WorkCard';
import { MilestoneStrip } from './MilestoneStrip';
import { WorkflowList } from './WorkflowList';
import { ChannelRail } from './ChannelRail';

const lanes = [
    {
        id: 'idea',
        milestone: 'Proposed',
        name: 'Idea',
        items: [
            { id: 'gen', kind: 'request', title: 'Generate a persona from a sentence', who: 'nobody yet', objective: '10 organizations on Cloud' },
            { id: 'tidy', kind: 'request', title: 'Tidy the old portal tabs', who: 'nobody yet', flag: 'no objective' },
        ],
    },
    {
        id: 'design',
        milestone: 'Approved',
        name: 'Design',
        items: [
            { id: 'screens', kind: 'question', title: 'Approve the Projects screens', who: 'champion', objective: '10 organizations on Cloud', flag: 'yours', yours: true },
        ],
    },
];

describe('WorkCard', () => {
    it('marks a selected card with the accent and a missing objective in the warm tint', () => {
        render(<WorkCard item={lanes[1].items[0]} selected />);
        expect(screen.getByRole('button', { name: /Approve the Projects screens/ })).toHaveStyle({ borderColor: studio.accent });
        render(<WorkCard item={lanes[0].items[1]} />);
        const pills = screen.getAllByText('no objective');
        expect(pills[pills.length - 1]).toHaveStyle({ color: '#f0a070', borderColor: '#6a3e22' });
    });
});

describe('SwimLanes', () => {
    it('names each stage under its milestone and reports the card that was chosen', () => {
        const onSelect = vi.fn();
        render(<SwimLanes lanes={lanes} selected="screens" onSelect={onSelect} />);
        expect(screen.getByRole('region', { name: 'Idea' })).toHaveTextContent('Proposed');
        expect(screen.getByRole('region', { name: 'Idea' })).toHaveTextContent('· 2');
        expect(screen.getByRole('button', { name: /Approve the Projects screens/ })).toHaveAttribute('aria-pressed', 'true');
        fireEvent.click(screen.getByRole('button', { name: /Tidy the old portal tabs/ }));
        expect(onSelect).toHaveBeenCalledWith('tidy');
    });
});

describe('MilestoneStrip', () => {
    it('shows the organization lock and offers no way to rename the milestone', () => {
        render(<MilestoneStrip name="In progress" check="Claimed by someone" />);
        expect(screen.getByRole('img', { name: 'Set by the organization' })).toBeInTheDocument();
        expect(screen.getByText('In progress')).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
});

describe('WorkflowList', () => {
    it('indents a stage under its milestone and reports a selection', () => {
        const onSelect = vi.fn();
        const onAddStage = vi.fn();
        render(
            <WorkflowList
                selected="build"
                onSelect={onSelect}
                onAddStage={onAddStage}
                milestones={[
                    {
                        id: 'progress',
                        name: 'In progress',
                        check: 'Claimed by someone',
                        stages: [{ id: 'build', name: 'Build', check: 'Tests pass', who: [{ handle: 'cloud-cursor', glyph: 'RV', job: 'builder' }] }],
                    },
                ]}
            />,
        );
        const stage = screen.getByRole('button', { name: /Build/ });
        expect(stage).toHaveAttribute('aria-pressed', 'true');
        expect(stage).toHaveStyle({ marginLeft: '24px', borderColor: studio.accent });
        const chip = screen.getByRole('img', { name: 'cloud-cursor' });
        expect(chip).toHaveTextContent('RV');
        expect(chip).toHaveStyle({ backgroundColor: studio.job.builder });
        fireEvent.click(screen.getByRole('button', { name: 'Add a stage under In progress' }));
        expect(onAddStage).toHaveBeenCalledWith('progress');
        fireEvent.click(stage);
        expect(onSelect).toHaveBeenCalledWith('build');
    });
});

describe('ChannelRail', () => {
    it('shows an unread count only when there is one, and reports the channel chosen', () => {
        const onSelect = vi.fn();
        const onAdd = vi.fn();
        render(
            <ChannelRail
                selected="studio"
                onSelect={onSelect}
                onAdd={onAdd}
                channels={[
                    { id: 'studio', name: 'studio', unread: 2 },
                    { id: 'review', name: 'studio review' },
                ]}
            />,
        );
        expect(screen.getByRole('button', { name: '# studio 2' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '# studio review' }).textContent).toBe('# studio review');
        fireEvent.click(screen.getByRole('button', { name: '# studio review' }));
        expect(onSelect).toHaveBeenCalledWith('review');
        fireEvent.click(screen.getByRole('button', { name: 'Add a channel' }));
        expect(onAdd).toHaveBeenCalled();
    });
});
