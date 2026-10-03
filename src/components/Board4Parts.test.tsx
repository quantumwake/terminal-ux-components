import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListPicker } from './ListPicker';
import { Panel } from './Panel';
import { MemberRow } from './MemberRow';
import { ChannelRow } from './ChannelRow';
import { ActionBox, Notice } from './Notice';
import { SegmentedNav } from './SegmentedNav';
import { studio } from '../theme/studio';

describe('ListPicker', () => {
    const items = [{ id: 'a', name: 'Studio', hint: 'Launch Studio · 4 agents' }, { id: 'b', name: 'Cloud' }];
    it('rings the chosen item, reports a pick and the search, and runs its action', () => {
        const onSelect = vi.fn(), onQuery = vi.fn(), onAction = vi.fn();
        render(<ListPicker label="Projects" searchLabel="Find a project" items={items} value="a" onSelect={onSelect} onQuery={onQuery} action={{ label: 'New project', onClick: onAction }} />);
        expect(screen.getByRole('complementary', { name: 'Projects' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Studio/ })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: /Studio/ })).toHaveStyle({ border: `1px solid ${studio.accent}` });
        expect(screen.getByRole('button', { name: 'Cloud' })).toHaveAttribute('aria-pressed', 'false');
        fireEvent.click(screen.getByRole('button', { name: 'Cloud' }));
        expect(onSelect).toHaveBeenCalledWith('b');
        fireEvent.change(screen.getByLabelText('Find a project'), { target: { value: 'clo' } });
        expect(onQuery).toHaveBeenCalledWith('clo');
        fireEvent.click(screen.getByRole('button', { name: 'New project' }));
        expect(onAction).toHaveBeenCalled();
    });
});

describe('Panel', () => {
    it('is a section named by its title, with an action or a note', () => {
        const onAdd = vi.fn();
        const { rerender } = render(<Panel title="People" action={{ label: 'Add person', onClick: onAdd }}><span>row</span></Panel>);
        expect(screen.getByRole('region', { name: 'People' })).toHaveTextContent('row');
        fireEvent.click(screen.getByRole('button', { name: 'Add person' }));
        expect(onAdd).toHaveBeenCalled();
        rerender(<Panel title="Channels" note="Everyone on the project can read these." />);
        expect(screen.getByText('Everyone on the project can read these.')).toBeInTheDocument();
        expect(screen.queryByRole('button')).toBeNull();
    });
});

describe('MemberRow and ChannelRow', () => {
    it('draws an agent with its handle in mono, its detail and its stages', () => {
        render(<MemberRow badge={<span>B</span>} name="champion" mono detail="Coordinator · Kasra’s · This Mac" note="Propose" />);
        expect(screen.getByText('champion')).toHaveStyle({ fontFamily: studio.mono });
        expect(screen.getByText('Coordinator · Kasra’s · This Mac')).toHaveStyle({ color: studio.textFaint });
        expect(screen.getByText('Propose')).toHaveStyle({ color: studio.textMuted });
    });
    it('draws a person on one line with the role at the right', () => {
        render(<MemberRow badge={<span>KR</span>} name="Kasra" note="Project owner" />);
        expect(screen.getByText('Project owner')).toHaveStyle({ color: studio.textFaint });
        expect(screen.getByText('Kasra').closest('div')).toHaveStyle({ justifyContent: 'space-between' });
    });
    it('draws a channel with its kind as a pill', () => {
        render(<ChannelRow name="studio" kind="main" note="created with the project" />);
        expect(screen.getByText('studio')).toHaveStyle({ fontFamily: studio.mono });
        expect(screen.getByText('main')).toHaveStyle({ borderRadius: '999px' });
    });
});

describe('ActionBox, Notice and SegmentedNav small', () => {
    it('offers its actions, says its consequences, and draws small tabs', () => {
        const onNew = vi.fn();
        render(<>
            <ActionBox title="Add a channel" text="Start a new one." actions={[{ label: 'New channel', onClick: onNew }, { label: 'Attach existing' }]} />
            <Notice lead="Before you save:">attaching gives 3 people access.</Notice>
            <SegmentedNav size="small" value="p" onChange={() => {}} items={[{ id: 'p', label: 'People and agents' }]} />
        </>);
        fireEvent.click(screen.getByRole('button', { name: 'New channel' }));
        expect(onNew).toHaveBeenCalled();
        expect(screen.getByText('Before you save:').tagName).toBe('B');
        expect(screen.getByRole('tab', { name: 'People and agents' })).toHaveStyle({ fontSize: '13px', padding: '7px 12px' });
    });
});
