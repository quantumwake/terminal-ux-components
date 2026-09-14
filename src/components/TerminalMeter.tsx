import React from 'react';
import { useTheme } from '../theme';

// TerminalMeter — a horizontal meter for a ratio in [0, 1] (e.g. disk/memory
// usage, quota consumed). Styled like the rest of the library: mono type, the
// surface/elevated background ladder for the track, a thin rounded bar for the
// fill. Purely presentational — value is clamped for display, never mutated by
// the component, and there is no host-facing state.
//
// An absent value (`undefined` or `NaN`) renders an em dash in place of the
// percent and an empty track — it never falls back to 0%, which would read as
// "empty" rather than "unknown".

export interface TerminalMeterProps {
    /** Ratio in [0, 1]. Clamped for display. Omit (or pass `NaN`) to render an unmeasured meter — an em dash and an empty bar, never 0. */
    value?: number;
    /** Rendered to the left of the bar. */
    label?: string;
    /** Rendered to the right of the bar, e.g. "3.1 / 8 GiB". */
    caption?: string | React.ReactNode;
    /** Ratio in [0, 1]. Draws a tick mark at this position; the bar switches to the theme's warning colour once `value` reaches it. */
    threshold?: number;
    size?: 'small' | 'medium';
    /** Render `NN%` (or an em dash, when `value` is absent) after the bar. Default true. */
    showPercent?: boolean;
    className?: string;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export const TerminalMeter: React.FC<TerminalMeterProps> = ({
    value,
    label,
    caption,
    threshold,
    size = 'medium',
    showPercent = true,
    className = '',
}) => {
    const theme = useTheme();

    const hasValue = value !== undefined && !Number.isNaN(value);
    const ratio = hasValue ? clamp01(value as number) : undefined;
    const percent = ratio !== undefined ? Math.round(ratio * 100) : undefined;

    const hasThreshold = threshold !== undefined && !Number.isNaN(threshold);
    const thresholdRatio = hasThreshold ? clamp01(threshold as number) : undefined;
    const isWarning = ratio !== undefined && thresholdRatio !== undefined && ratio >= thresholdRatio;

    const percentText = percent === undefined ? '—' : `${percent}%`;
    const ariaLabel = label
        ? `${label} ${percentText}`
        : (percent !== undefined ? percentText : undefined);

    const sizes = {
        small: { bar: 'h-1', text: 'text-[10px]' },
        medium: { bar: 'h-1.5', text: 'text-xs' },
    } as const;
    const current = sizes[size];

    return (
        <div className={`flex w-full items-center gap-2 ${theme.font} ${className}`}>
            {label && (
                <span className={`shrink-0 ${current.text} ${theme.default.text.secondary}`}>{label}</span>
            )}
            <div
                role="meter"
                aria-label={ariaLabel}
                aria-valuemin={0}
                aria-valuemax={1}
                aria-valuenow={ratio}
                className={`relative flex-1 min-w-0 ${current.bar} rounded-full border ${theme.border} bg-midnight-surface overflow-hidden`}
            >
                {ratio !== undefined && (
                    <div
                        className={`absolute inset-y-0 left-0 rounded-full ${isWarning ? 'bg-midnight-warning' : 'bg-midnight-accent'}`}
                        style={{ width: `${ratio * 100}%` }}
                    />
                )}
                {thresholdRatio !== undefined && (
                    <div
                        className="absolute inset-y-0 w-px bg-midnight-text-subdued"
                        style={{ left: `${thresholdRatio * 100}%` }}
                    />
                )}
            </div>
            {showPercent && (
                <span className={`shrink-0 tabular-nums ${current.text} ${theme.default.text.muted}`}>{percentText}</span>
            )}
            {caption !== undefined && (
                <span className={`shrink-0 ${current.text} ${theme.default.text.muted}`}>{caption}</span>
            )}
        </div>
    );
};

export default TerminalMeter;
