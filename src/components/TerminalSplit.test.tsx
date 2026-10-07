import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { TerminalSplit } from './TerminalSplit';

// jsdom's pointer events carry no coordinates; a MouseEvent with a pointerId
// is what a browser hands the handlers.
class TestPointerEvent extends MouseEvent {
    pointerId: number;
    constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 0;
    }
}
window.PointerEvent = TestPointerEvent as unknown as typeof PointerEvent;

const grow = (el: Element) => Number((el as HTMLElement).style.flex.split(' ')[0]);
const panesOf = (c: HTMLElement) => [...c.querySelectorAll('[data-pane]')];

// jsdom lays nothing out; give the split box a size so drags have a scale.
const sized = (c: HTMLElement, width: number, height = 400) => {
    const root = c.firstElementChild as HTMLElement;
    root.getBoundingClientRect = () => ({ width, height, top: 0, left: 0, right: width, bottom: height, x: 0, y: 0, toJSON: () => ({}) });
};

describe('TerminalSplit', () => {
    it('draws the studio look: a splitter-token line at rest, an accent grip on hover, focus and drag', () => {
        render(
            <TerminalSplit look="studio">
                <div>a</div>
                <div>b</div>
            </TerminalSplit>,
        );
        const divider = screen.getByRole('separator');
        const line = divider.querySelector('[data-split-line]') as HTMLElement;
        const grip = divider.querySelector('[data-split-grip]') as HTMLElement;
        expect(line).toHaveInlineStyle({ background: 'var(--studio-splitter, #7d7369)', width: '1px', left: '2px' });
        expect(line.style.transform).toBe('');
        expect(grip).toHaveInlineStyle({ display: 'none' });
        fireEvent.pointerEnter(divider);
        expect(grip).toHaveInlineStyle({ display: 'block', background: 'var(--studio-accent, #e8743b)' });
        expect(line).toHaveInlineStyle({ background: 'var(--studio-accent, #e8743b)' });
        fireEvent.pointerLeave(divider);
        expect(grip).toHaveInlineStyle({ display: 'none' });
        fireEvent.focus(divider);
        expect(grip).toHaveInlineStyle({ display: 'block' });
        fireEvent.blur(divider);
        expect(grip).toHaveInlineStyle({ display: 'none' });
    });

    it('turns the studio line for a vertical split', () => {
        render(
            <TerminalSplit look="studio" direction="vertical">
                <div>a</div>
                <div>b</div>
            </TerminalSplit>,
        );
        const line = screen.getByRole('separator').querySelector('[data-split-line]') as HTMLElement;
        expect(line).toHaveInlineStyle({ height: '1px' });
    });

    it('keeps the old divider without the studio look', () => {
        render(
            <TerminalSplit>
                <div>a</div>
                <div>b</div>
            </TerminalSplit>,
        );
        const divider = screen.getByRole('separator');
        expect(divider.querySelector('[data-split-line]')).toBeNull();
        expect(divider.className).toContain('bg-midnight-border');
    });

    it('names each divider when given labels, and falls back to "resize panes"', () => {
        render(
            <TerminalSplit dividerLabels={['Resize the channel list']}>
                <div>a</div>
                <div>b</div>
                <div>c</div>
            </TerminalSplit>,
        );
        const dividers = screen.getAllByRole('separator');
        expect(dividers.map((d) => d.getAttribute('aria-label'))).toEqual(['Resize the channel list', 'resize panes']);
    });

    it('renders every child as a pane with a divider between each pair', () => {
        const { container } = render(
            <TerminalSplit>
                <div>a</div>
                <div>b</div>
                <div>c</div>
                <div>d</div>
            </TerminalSplit>,
        );
        expect(panesOf(container)).toHaveLength(4);
        expect(screen.getAllByRole('separator')).toHaveLength(3);
        for (const p of panesOf(container)) expect(grow(p)).toBeCloseTo(0.25);
    });

    it('stacks panes and turns the dividers for the vertical direction', () => {
        const { container } = render(
            <TerminalSplit direction="vertical">
                <div>a</div>
                <div>b</div>
            </TerminalSplit>,
        );
        expect((container.firstElementChild as HTMLElement).style.flexDirection).toBe('column');
        expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('moves only the two panes beside a divider on the arrow keys', () => {
        const onSizesChange = vi.fn();
        const { container } = render(
            <TerminalSplit onSizesChange={onSizesChange} minSize={10}>
                <div>a</div>
                <div>b</div>
                <div>c</div>
            </TerminalSplit>,
        );
        sized(container, 1000);
        fireEvent.keyDown(screen.getAllByRole('separator')[1], { key: 'ArrowRight' });
        const [a, b, c] = onSizesChange.mock.calls[0][0];
        expect(a).toBeCloseTo(1 / 3);
        expect(b).toBeCloseTo(1 / 3 + 0.02);
        expect(c).toBeCloseTo(1 / 3 - 0.02);
        expect(grow(panesOf(container)[1])).toBeCloseTo(1 / 3 + 0.02);
    });

    it('drags a divider by the pointer distance and never below minSize', () => {
        const onSizesChange = vi.fn();
        const { container } = render(
            <TerminalSplit onSizesChange={onSizesChange} minSize={100} dividerSize={0}>
                <div>a</div>
                <div>b</div>
            </TerminalSplit>,
        );
        sized(container, 1000);
        const sep = screen.getByRole('separator');
        fireEvent.pointerDown(sep, { clientX: 500, pointerId: 1 });
        fireEvent.pointerMove(sep, { clientX: 600, pointerId: 1 });
        expect(onSizesChange.mock.lastCall![0][0]).toBeCloseTo(0.6);
        fireEvent.pointerMove(sep, { clientX: 990, pointerId: 1 });
        expect(onSizesChange.mock.lastCall![0][0]).toBeCloseTo(0.9);
        expect(onSizesChange.mock.lastCall![0][1]).toBeCloseTo(0.1);
        fireEvent.pointerUp(sep, { pointerId: 1 });
        const calls = onSizesChange.mock.calls.length;
        fireEvent.pointerMove(sep, { clientX: 100, pointerId: 1 });
        expect(onSizesChange.mock.calls.length).toBe(calls);
    });

    it('moves a pane that is already past minSize only toward the limit, never against the drag', () => {
        const onSizesChange = vi.fn();
        const { container } = render(
            <TerminalSplit sizes={[0.7, 0.3]} onSizesChange={onSizesChange} minSize={220} dividerSize={0}>
                <div>a</div>
                <div>b</div>
            </TerminalSplit>,
        );
        sized(container, 600);
        const sep = screen.getByRole('separator');
        fireEvent.pointerDown(sep, { clientX: 420, pointerId: 1 });
        fireEvent.pointerMove(sep, { clientX: 421, pointerId: 1 });
        expect(onSizesChange.mock.lastCall![0][0]).toBeCloseTo(0.7);
        fireEvent.pointerMove(sep, { clientX: 400, pointerId: 1 });
        expect(onSizesChange.mock.lastCall![0][0]).toBeCloseTo(0.7 - 20 / 600);
    });

    it('evens a pair out on double-click', () => {
        const onSizesChange = vi.fn();
        render(
            <TerminalSplit defaultSizes={[0.8, 0.2]} onSizesChange={onSizesChange}>
                <div>a</div>
                <div>b</div>
            </TerminalSplit>,
        );
        fireEvent.doubleClick(screen.getByRole('separator'));
        expect(onSizesChange.mock.calls[0][0]).toEqual([0.5, 0.5]);
    });

    it('honours controlled sizes and falls back to equal shares when the pane count changes', () => {
        const { container, rerender } = render(
            <TerminalSplit sizes={[0.7, 0.3]}>
                <div>a</div>
                <div>b</div>
            </TerminalSplit>,
        );
        expect(grow(panesOf(container)[0])).toBeCloseTo(0.7);
        rerender(
            <TerminalSplit sizes={[0.7, 0.3]}>
                <div>a</div>
                <div>b</div>
                <div>c</div>
            </TerminalSplit>,
        );
        for (const p of panesOf(container)) expect(grow(p)).toBeCloseTo(1 / 3);
    });

    it('uses the host divider classes when given', () => {
        render(
            <TerminalSplit dividerClassName="host-divider">
                <div>a</div>
                <div>b</div>
            </TerminalSplit>,
        );
        expect(screen.getByRole('separator')).toHaveClass('host-divider');
        expect(screen.getByRole('separator')).not.toHaveClass('bg-midnight-border');
    });
});

describe('TerminalSplit collapsed panes', () => {
    it('keeps a collapsed pane mounted but out of the layout and the accessibility tree', () => {
        const { container } = render(
            <TerminalSplit sizes={[0.2, 0.5, 0.3]} collapsed={[true, false, false]}>
                <div>a</div>
                <div>b</div>
                <div>c</div>
            </TerminalSplit>,
        );
        const [a] = panesOf(container) as HTMLElement[];
        expect(screen.getByText('a')).toBeInTheDocument();
        expect(a).toHaveAttribute('data-collapsed', 'true');
        expect(a).toHaveAttribute('aria-hidden', 'true');
        expect(a.style.flex).toBe('0 0 0px');
        expect(a.style.visibility).toBe('hidden');
    });

    it('shares the room among the panes still showing, in proportion', () => {
        const { container } = render(
            <TerminalSplit sizes={[0.2, 0.5, 0.3]} collapsed={[true, false, false]}>
                <div>a</div>
                <div>b</div>
                <div>c</div>
            </TerminalSplit>,
        );
        const [, b, c] = panesOf(container);
        expect(grow(b)).toBeCloseTo(0.625);
        expect(grow(c)).toBeCloseTo(0.375);
    });

    it('draws dividers only between the panes still showing', () => {
        const three = (collapsed: boolean[]) => (
            <TerminalSplit collapsed={collapsed}>
                <div>a</div>
                <div>b</div>
                <div>c</div>
            </TerminalSplit>
        );
        const { rerender } = render(three([false, false, false]));
        expect(screen.getAllByRole('separator')).toHaveLength(2);
        rerender(three([true, false, false]));
        expect(screen.getAllByRole('separator')).toHaveLength(1);
        rerender(three([false, true, false]));
        expect(screen.getAllByRole('separator')).toHaveLength(1);
        rerender(three([false, false, true]));
        expect(screen.getAllByRole('separator')).toHaveLength(1);
        rerender(three([true, true, false]));
        expect(screen.queryAllByRole('separator')).toHaveLength(0);
        rerender(three([true, true, true]));
        expect(screen.queryAllByRole('separator')).toHaveLength(0);
    });

    it('restores the collapsed pane to the size it had', () => {
        const view = (collapsed: boolean[]) => (
            <TerminalSplit sizes={[0.25, 0.75]} collapsed={collapsed}>
                <div>a</div>
                <div>b</div>
            </TerminalSplit>
        );
        const { container, rerender } = render(view([true, false]));
        expect(grow(panesOf(container)[1])).toBeCloseTo(1);
        rerender(view([false, false]));
        expect(grow(panesOf(container)[0])).toBeCloseTo(0.25);
        expect(grow(panesOf(container)[1])).toBeCloseTo(0.75);
    });

    it('does not unmount a pane when it collapses and expands', () => {
        let mounts = 0;
        const Probe = () => {
            React.useEffect(() => {
                mounts += 1;
            }, []);
            return <span>probe</span>;
        };
        const view = (collapsed: boolean[]) => (
            <TerminalSplit collapsed={collapsed}>
                <Probe />
                <div>b</div>
            </TerminalSplit>
        );
        const { rerender } = render(view([false, false]));
        rerender(view([true, false]));
        rerender(view([false, false]));
        expect(mounts).toBe(1);
    });

    it('moves the divider across a collapsed pane and leaves that pane alone', () => {
        const onSizesChange = vi.fn();
        render(
            <TerminalSplit sizes={[0.3, 0.2, 0.5]} collapsed={[false, true, false]} onSizesChange={onSizesChange} minSize={10}>
                <div>a</div>
                <div>b</div>
                <div>c</div>
            </TerminalSplit>,
        );
        fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowRight' });
        const next = onSizesChange.mock.calls[0][0] as number[];
        expect(next[1]).toBeCloseTo(0.2);
        expect(next[0]).toBeGreaterThan(0.3);
        expect(next[2]).toBeLessThan(0.5);
        expect(next[0] + next[1] + next[2]).toBeCloseTo(1);
    });

    it('ignores a flag list of the wrong length', () => {
        const { container } = render(
            <TerminalSplit collapsed={[true]}>
                <div>a</div>
                <div>b</div>
            </TerminalSplit>,
        );
        for (const p of panesOf(container)) expect(p).not.toHaveAttribute('data-collapsed');
        expect(screen.getAllByRole('separator')).toHaveLength(1);
    });
});
