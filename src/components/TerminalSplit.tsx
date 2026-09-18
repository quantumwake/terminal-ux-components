import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface TerminalSplitProps {
    /** One pane per child, laid out side by side ('horizontal') or stacked ('vertical'). */
    children: React.ReactNode;
    direction?: 'horizontal' | 'vertical';
    /** Controlled sizes: one fraction per pane, summing to 1. */
    sizes?: number[];
    /** Uncontrolled starting sizes; defaults to equal shares. */
    defaultSizes?: number[];
    /** Called with the new fractions while a divider moves. */
    onSizesChange?: (sizes: number[]) => void;
    /** Smallest a pane may get, in pixels. */
    minSize?: number;
    /** Divider thickness in pixels. */
    dividerSize?: number;
    className?: string;
    /** Replaces the divider's default (midnight) classes, for hosts with their own palette. */
    dividerClassName?: string;
    /** Wraps each pane; layout comes from inline styles, so this is for looks only. */
    paneClassName?: string;
}

const equal = (n: number) => Array.from({ length: n }, () => 1 / n);

// normalize makes sizes fit n panes: a wrong-length or unusable array falls
// back to equal shares, anything else is rescaled to sum to 1.
const normalize = (sizes: number[] | undefined, n: number): number[] => {
    if (!sizes || sizes.length !== n || sizes.some((s) => !(s > 0))) return equal(n);
    const total = sizes.reduce((a, b) => a + b, 0);
    return sizes.map((s) => s / total);
};

const KEY_STEP = 0.02;

/**
 * TerminalSplit lays out any number of panes with draggable dividers between
 * them. Dragging a divider trades space between the two panes beside it only;
 * the arrow keys do the same from a focused divider, and a double-click evens
 * that pair out. Layout is inline styles, so it works under any stylesheet.
 */
export const TerminalSplit: React.FC<TerminalSplitProps> = ({
    children,
    direction = 'horizontal',
    sizes,
    defaultSizes,
    onSizesChange,
    minSize = 120,
    dividerSize = 6,
    className = '',
    dividerClassName,
    paneClassName = '',
}) => {
    const panes = React.Children.toArray(children);
    const n = panes.length;
    const [own, setOwn] = useState(() => normalize(defaultSizes, n));
    const current = normalize(sizes ?? own, n);
    const box = useRef<HTMLDivElement>(null);
    const drag = useRef<{ i: number; start: number; startSizes: number[]; total: number } | null>(null);
    const [dragging, setDragging] = useState<number | null>(null);
    const horizontal = direction === 'horizontal';

    useEffect(() => {
        if (!sizes && own.length !== n) setOwn(equal(n));
    }, [n, sizes, own.length]);

    const commit = useCallback(
        (next: number[]) => {
            if (!sizes) setOwn(next);
            onSizesChange?.(next);
        },
        [sizes, onSizesChange],
    );

    // moveDivider shifts divider i by delta (a fraction of the pane area),
    // clamped so neither neighbour drops below minSize. A pair already past
    // the limit (a narrower window than its sizes were set on) only moves
    // toward it, never jumps against the drag.
    const moveDivider = useCallback(
        (from: number[], i: number, delta: number, total: number) => {
            const pair = from[i] + from[i + 1];
            const min = total > 0 ? Math.min(minSize / total, pair / 2) : 0;
            const lo = Math.min(min, from[i]);
            const hi = Math.max(pair - min, from[i]);
            const left = Math.min(Math.max(from[i] + delta, lo), hi);
            const next = [...from];
            next[i] = left;
            next[i + 1] = pair - left;
            commit(next);
        },
        [minSize, commit],
    );

    const paneArea = () => {
        const r = box.current?.getBoundingClientRect();
        const full = r ? (horizontal ? r.width : r.height) : 0;
        return Math.max(full - dividerSize * (n - 1), 0);
    };

    const onPointerDown = (i: number) => (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        drag.current = { i, start: horizontal ? e.clientX : e.clientY, startSizes: current, total: paneArea() };
        setDragging(i);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const d = drag.current;
        if (!d || d.total <= 0) return;
        const px = (horizontal ? e.clientX : e.clientY) - d.start;
        moveDivider(d.startSizes, d.i, px / d.total, d.total);
    };

    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        e.currentTarget.releasePointerCapture?.(e.pointerId);
        drag.current = null;
        setDragging(null);
    };

    const onKeyDown = (i: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
        const back = horizontal ? 'ArrowLeft' : 'ArrowUp';
        const fwd = horizontal ? 'ArrowRight' : 'ArrowDown';
        if (e.key !== back && e.key !== fwd) return;
        e.preventDefault();
        moveDivider(current, i, e.key === fwd ? KEY_STEP : -KEY_STEP, paneArea());
    };

    const even = (i: number) => () => {
        const pair = current[i] + current[i + 1];
        const next = [...current];
        next[i] = pair / 2;
        next[i + 1] = pair / 2;
        commit(next);
    };

    const divider = (i: number) => (
        <div
            key={`divider-${i}`}
            role="separator"
            aria-orientation={horizontal ? 'vertical' : 'horizontal'}
            aria-valuenow={Math.round(current[i] * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="resize panes"
            tabIndex={0}
            onPointerDown={onPointerDown(i)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown(i)}
            onDoubleClick={even(i)}
            data-dragging={dragging === i || undefined}
            className={
                dividerClassName ??
                `bg-midnight-border hover:bg-midnight-accent/50 focus:bg-midnight-accent/50 outline-none transition-colors ${
                    dragging === i ? 'bg-midnight-accent' : ''
                }`
            }
            style={{
                flex: `0 0 ${dividerSize}px`,
                cursor: horizontal ? 'col-resize' : 'row-resize',
                touchAction: 'none',
            }}
        />
    );

    return (
        <div
            ref={box}
            className={className}
            style={{
                display: 'flex',
                flexDirection: horizontal ? 'row' : 'column',
                minWidth: 0,
                minHeight: 0,
                userSelect: dragging === null ? undefined : 'none',
            }}
        >
            {panes.map((child, i) => (
                <React.Fragment key={(React.isValidElement(child) && child.key) || i}>
                    {i > 0 && divider(i - 1)}
                    <div
                        className={paneClassName}
                        data-pane={i}
                        style={{ flex: `${current[i]} 1 0px`, minWidth: 0, minHeight: 0, display: 'flex', overflow: 'hidden' }}
                    >
                        {child}
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};

export default TerminalSplit;
