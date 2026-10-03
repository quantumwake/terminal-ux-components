import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterChips } from './FilterChips';
import { StatusDot } from './StatusDot';
import { AgentBadge } from './AgentBadge';
import { PersonBadge } from './PersonBadge';
import { studio } from '../theme/studio';

const items = [
    { key: 'all', name: 'All', count: 9 },
    { key: 'working', name: 'Working', count: 3 },
    { key: 'off', name: 'Not listening' },
];

describe('FilterChips', () => {
    it('is a labelled group of toggle buttons with the chosen one pressed', () => {
        render(<FilterChips items={items} value="working" onChange={() => {}} />);
        expect(screen.getByRole('group', { name: 'Show' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Working 3' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'All 9' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('rings the chosen chip in the accent and the rest in the line colour', () => {
        render(<FilterChips items={items} value="all" onChange={() => {}} />);
        expect(screen.getByRole('button', { name: 'All 9' })).toHaveStyle({ border: `1px solid ${studio.accent}` });
        expect(screen.getByRole('button', { name: 'Working 3' })).toHaveStyle({ border: `1px solid ${studio.line}` });
    });

    it('reports the key of the chip clicked, and a chip with no count shows only its name', () => {
        const onChange = vi.fn();
        render(<FilterChips items={items} value="all" onChange={onChange} />);
        fireEvent.click(screen.getByRole('button', { name: 'Not listening' }));
        expect(onChange).toHaveBeenCalledWith('off');
    });
});

describe('StatusDot', () => {
    it('draws the dot and the label in the state colour', () => {
        const { container } = render(<StatusDot color="#e8743b" label="Working" />);
        expect(screen.getByText('Working')).toHaveStyle({ color: '#e8743b' });
        expect(container.querySelector('[aria-hidden="true"]')).toHaveStyle({ background: '#e8743b' });
    });

    it('with no colour, is a dashed ring and a faint label', () => {
        const { container } = render(<StatusDot label="Not listening" />);
        expect(container.querySelector('[aria-hidden="true"]')).toHaveStyle({ border: '1px dashed #8a8178' });
        expect(screen.getByText('Not listening')).toHaveStyle({ color: studio.textFaint });
    });
});

describe('AgentBadge and PersonBadge', () => {
    it('tints an agent by its job and rounds its corners, wider when large', () => {
        const { rerender } = render(<AgentBadge glyph="RV" job="reviewer" label="reviewer" />);
        const badge = screen.getByRole('img', { name: 'reviewer' });
        expect(badge).toHaveStyle({ background: studio.job.reviewer, width: '30px', borderRadius: '7px', fontSize: '11px' });
        rerender(<AgentBadge glyph="RV" job="reviewer" label="reviewer" size={48} />);
        expect(screen.getByRole('img', { name: 'reviewer' })).toHaveStyle({ width: '48px', borderRadius: '12px', fontSize: '16px' });
    });

    it('hides an unlabelled badge from assistive tech, so a row reads its name once', () => {
        const { container } = render(<AgentBadge glyph="CC" />);
        expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    });

    it('draws a person round, on the person tint', () => {
        render(<PersonBadge glyph="KR" label="Kasra" />);
        expect(screen.getByRole('img', { name: 'Kasra' })).toHaveStyle({ background: studio.job.person, borderRadius: '50%' });
    });
});
