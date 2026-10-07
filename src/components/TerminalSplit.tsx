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
    /**
     * One flag per pane. A collapsed pane takes no space but stays mounted, so
     * its state (scroll, drafts, streams) survives; the others share the room
     * and dividers are drawn only between panes still showing. Its size is
     * kept, so expanding restores it. A flag list of the wrong length is
     * ignored.
     */
    collapsed?: boolean[];
    className?: string;
    /** Replaces the divider's default (midnight) classes, for hosts with their own palette. */
    dividerClassName?: string;
    /** Wraps each pane; layout comes from inline styles, so this is for looks only. */
    paneClassName?: string;
    /**
     * A name for each divider, read out by screen readers: index i names the
     * divider after pane i ("Resize the channel list"). Missing ones say
     * "resize panes".
     */
    dividerLabels?: string[];
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
 * that pair out. Panes can be collapsed without unmounting them. Layout is
 * inline styles, so it works under any stylesheet.
 */
export const TerminalSplit: React.FC<TerminalSplitProps> = ({
    children,
    direction = 'horizontal',
    sizes,
    defaultSizes,
    onSizesChange,
    minSize = 120,
    dividerSize = 6,
    collapsed,
    className = '',
    dividerClassName,
    paneClassName = '',
    dividerLabels,
}) => {
    const panes = React.Children.toArray(children);
    const n = panes.length;
    const [own, setOwn] = useState(() => normalize(defaultSizes, n));
    const current = normalize(sizes ?? own, n);
    const box = useRef<HTMLDivElement>(null);
    const drag = useRef<{ a: number; b: number; start: number; startSizes: number[]; total: number } | null>(null);
    const [dragging, setDragging] = useState<number | null>(null);
    const horizontal = direction === 'horizontal';

    // Which panes are showing. Without collapsed panes every size is used as
    // given; with them the showing panes' sizes are rescaled to fill the room.
    const hidden = collapsed && collapsed.length === n && collapsed.some(Boolean) ? collapsed : undefined;
    const showing = panes.map((_, i) => i).filter((i) => !hidden?.[i]);
    const shownSum = (from: number[]) => showing.reduce((sum, i) => sum + from[i], 0) || 1;
    const share = (i: number) => (hidden ? current[i] / shownSum(current) : current[i]);

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

    // moveDivider shifts the divider between showing panes a and b by delta (a
    // fraction of the room the showing panes share), clamped so neither drops
    // below minSize. Panes collapsed between them keep their sizes. A pair
    // already past the limit (a narrower window than its sizes were set on)
    // only moves toward it, never jumps against the drag.
    const moveDivider = useCallback(
        (from: number[], a: number, b: number, delta: number, total: number, scale: number) => {
            const pair = from[a] + from[b];
            const min = total > 0 ? Math.min((minSize / total) * scale, pair / 2) : 0;
            const lo = Math.min(min, from[a]);
            const hi = Math.max(pair - min, from[a]);
            const left = Math.min(Math.max(from[a] + delta * scale, lo), hi);
            const next = [...from];
            next[a] = left;
            next[b] = pair - left;
            commit(next);
        },
        [minSize, commit],
    );

    const paneArea = () => {
        const r = box.current?.getBoundingClientRect();
        const full = r ? (horizontal ? r.width : r.height) : 0;
        return Math.max(full - dividerSize * (showing.length - 1), 0);
    };

    const onPointerDown = (a: number, b: number) => (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        drag.current = { a, b, start: horizontal ? e.clientX : e.clientY, startSizes: current, total: paneArea() };
        setDragging(a);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const d = drag.current;
        if (!d || d.total <= 0) return;
        const px = (horizontal ? e.clientX : e.clientY) - d.start;
        moveDivider(d.startSizes, d.a, d.b, px / d.total, d.total, shownSum(d.startSizes));
    };

    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        e.currentTarget.releasePointerCapture?.(e.pointerId);
        drag.current = null;
        setDragging(null);
    };

    const onKeyDown = (a: number, b: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
        const back = horizontal ? 'ArrowLeft' : 'ArrowUp';
        const fwd = horizontal ? 'ArrowRight' : 'ArrowDown';
        if (e.key !== back && e.key !== fwd) return;
        e.preventDefault();
        moveDivider(current, a, b, e.key === fwd ? KEY_STEP : -KEY_STEP, paneArea(), shownSum(current));
    };

    const even = (a: number, b: number) => () => {
        const pair = current[a] + current[b];
        const next = [...current];
        next[a] = pair / 2;
        next[b] = pair / 2;
        commit(next);
    };

    const divider = (a: number, b: number) => (
        <div
            key={`divider-${a}`}
            role="separator"
            aria-orientation={horizontal ? 'vertical' : 'horizontal'}
            aria-valuenow={Math.round(share(a) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={dividerLabels?.[a] || 'resize panes'}
            tabIndex={0}
            onPointerDown={onPointerDown(a, b)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown(a, b)}
            onDoubleClick={even(a, b)}
            data-dragging={dragging === a || undefined}
            className={
                dividerClassName ??
                `bg-midnight-border hover:bg-midnight-accent/50 focus:bg-midnight-accent/50 outline-none transition-colors ${
                    dragging === a ? 'bg-midnight-accent' : ''
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
            {panes.map((child, i) => {
                const away = !!hidden?.[i];
                const before = away ? -1 : showing[showing.indexOf(i) - 1] ?? -1;
                return (
                    <React.Fragment key={(React.isValidElement(child) && child.key) || i}>
                        {before >= 0 && divider(before, i)}
                        <div
                            className={paneClassName}
                            data-pane={i}
                            data-collapsed={away || undefined}
                            aria-hidden={away || undefined}
                            style={{
                                flex: away ? '0 0 0px' : `${share(i)} 1 0px`,
                                minWidth: 0,
                                minHeight: 0,
                                display: 'flex',
                                overflow: 'hidden',
                                // Still mounted, but out of the tab order and the accessibility tree.
                                visibility: away ? 'hidden' : undefined,
                            }}
                        >
                            {child}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default TerminalSplit;
