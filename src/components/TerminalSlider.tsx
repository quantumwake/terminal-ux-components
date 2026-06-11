import React from 'react';
import { useTheme } from '../theme';

// TerminalSlider — a range slider paired with an editable numeric value box, so
// a bounded number can be set by dragging OR by typing an exact value. The value
// box is styled from the theme (consistent with TerminalInput); provider-free,
// since useTheme() falls back to the midnight default.
export interface TerminalSliderProps {
    value: number;
    onChange?: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    /** Short unit shown after the value box (e.g. 'px', '°'). */
    unit?: string;
    disabled?: boolean;
    className?: string;
}

export const TerminalSlider: React.FC<TerminalSliderProps> = ({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    unit = '',
    disabled = false,
    className = '',
}) => {
    const theme = useTheme();
    const clamp = (n: number) => Math.min(max, Math.max(min, n));
    const set = (n: number) => {
        if (!disabled && Number.isFinite(n)) onChange?.(clamp(n));
    };

    return (
        <div className={`flex items-center gap-2 w-full ${className}`}>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={disabled}
                onChange={(e) => set(Number(e.target.value))}
                className="flex-1 h-1.5 appearance-none rounded-full bg-midnight-raised accent-midnight-accent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={disabled}
                onChange={(e) => set(Number(e.target.value))}
                className={`
                    w-14 px-1.5 py-1 text-xs text-right tabular-nums border ${theme.font}
                    ${disabled ? theme.input.disabled : theme.input.primary}
                    outline-none focus:outline-none focus:ring-2 focus:ring-midnight-accent/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
                `}
            />
            {unit && <span className="w-4 shrink-0 text-[10px] text-midnight-text-muted">{unit}</span>}
        </div>
    );
};

export default TerminalSlider;
