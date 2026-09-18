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
