import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { TerminalMeter } from './TerminalMeter';

describe('TerminalMeter', () => {
    it('clamps values above 1 to a full bar and 100%', () => {
        render(<TerminalMeter value={1.5} label="Disk" />);
        const meter = screen.getByRole('meter');
        expect(meter).toHaveAttribute('aria-valuenow', '1');
        expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('clamps values below 0 to an empty bar and 0%', () => {
        render(<TerminalMeter value={-0.4} label="Disk" />);
        const meter = screen.getByRole('meter');
        expect(meter).toHaveAttribute('aria-valuenow', '0');
        expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('renders the accent fill below the threshold', () => {
        const { container } = render(<TerminalMeter value={0.5} threshold={0.8} />);
        const fill = container.querySelector('[style*="width: 50%"]');
        expect(fill).not.toBeNull();
        expect(fill).toHaveClass('bg-midnight-accent');
        expect(fill).not.toHaveClass('bg-midnight-warning');
    });

    it('switches the fill to the warning colour at or above the threshold', () => {
        const { container } = render(<TerminalMeter value={0.8} threshold={0.8} />);
        const fill = container.querySelector('[style*="width: 80%"]');
        expect(fill).not.toBeNull();
        expect(fill).toHaveClass('bg-midnight-warning');
        expect(fill).not.toHaveClass('bg-midnight-accent');
    });

    it('renders an em dash and an empty bar when value is absent, never 0', () => {
        const { container } = render(<TerminalMeter label="Disk" />);
        const meter = screen.getByRole('meter');
        expect(meter).not.toHaveAttribute('aria-valuenow');
        expect(screen.getByText('—')).toBeInTheDocument();
        expect(screen.queryByText('0%')).toBeNull();
        // No fill segment is rendered at all — not even a zero-width one.
        expect(container.querySelector('.bg-midnight-accent')).toBeNull();
        expect(container.querySelector('.bg-midnight-warning')).toBeNull();
    });

    it('renders an em dash when value is NaN', () => {
        render(<TerminalMeter value={NaN} />);
        expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('exposes role=meter with aria-valuemin/max and a label-derived aria-label', () => {
        render(<TerminalMeter value={0.42} label="Memory" />);
        const meter = screen.getByRole('meter', { name: 'Memory 42%' });
        expect(meter).toHaveAttribute('aria-valuemin', '0');
        expect(meter).toHaveAttribute('aria-valuemax', '1');
        expect(meter).toHaveAttribute('aria-valuenow', '0.42');
    });

    it('derives aria-label from percent alone when there is no label', () => {
        render(<TerminalMeter value={0.42} />);
        expect(screen.getByRole('meter', { name: '42%' })).toBeInTheDocument();
    });

    it('hides the percent text when showPercent is false but keeps it in aria-label', () => {
        render(<TerminalMeter value={0.42} label="Memory" showPercent={false} />);
        expect(screen.queryByText('42%')).toBeNull();
        expect(screen.getByRole('meter', { name: 'Memory 42%' })).toBeInTheDocument();
    });

    it('renders the caption to the right of the bar', () => {
        render(<TerminalMeter value={0.4} caption="3.1 / 8 GiB" />);
        expect(screen.getByText('3.1 / 8 GiB')).toBeInTheDocument();
    });
});
