import React, { useEffect } from 'react';
import { useTheme } from '../theme';

// TerminalSlider — a range slider paired with an editable numeric value box, so
// a bounded number can be set by dragging OR by typing an exact value. The track
// and thumb are styled to match the terminal look (custom CSS injected once —
// range pseudo-elements can't be done with utility classes alone). The value box
// reads from the theme (consistent with TerminalInput); provider-free via the
// midnight default. The unit slot is always reserved, so value boxes line up
// across rows whether or not a unit is shown.

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

// Injected once. Colours match the midnight palette (accent = violet); kept as
// literals because range pseudo-elements can't consume Tailwind tokens.
const SLIDER_CSS = `
.tux-slider { -webkit-appearance: none; appearance: none; height: 16px; background: transparent; cursor: pointer; }
.tux-slider:disabled { opacity: .5; cursor: not-allowed; }
.tux-slider:focus { outline: none; }
.tux-slider::-webkit-slider-runnable-track { height: 4px; border-radius: 9999px; background: #334155; }
.tux-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; margin-top: -5px; width: 14px; height: 14px; border-radius: 9999px; background: #8b5cf6; border: 1px solid #a78bfa; box-shadow: 0 0 6px rgba(139,92,246,.5); transition: background .15s, box-shadow .15s; }
.tux-slider:hover::-webkit-slider-thumb { background: #a78bfa; box-shadow: 0 0 8px rgba(139,92,246,.7); }
.tux-slider:focus::-webkit-slider-thumb { box-shadow: 0 0 0 3px rgba(139,92,246,.35); }
.tux-slider::-moz-range-track { height: 4px; border-radius: 9999px; background: #334155; }
.tux-slider::-moz-range-progress { height: 4px; border-radius: 9999px; background: #8b5cf6; }
.tux-slider::-moz-range-thumb { width: 14px; height: 14px; border: 1px solid #a78bfa; border-radius: 9999px; background: #8b5cf6; box-shadow: 0 0 6px rgba(139,92,246,.5); }
.tux-slider:hover::-moz-range-thumb { background: #a78bfa; }
.tux-slider-num::-webkit-outer-spin-button, .tux-slider-num::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.tux-slider-num { -moz-appearance: textfield; }
`;

let sliderCssInjected = false;
function useInjectSliderCss() {
    useEffect(() => {
        if (sliderCssInjected || typeof document === 'undefined') return;
        const el = document.createElement('style');
        el.setAttribute('data-tux-slider', '');
        el.textContent = SLIDER_CSS;
        document.head.appendChild(el);
        sliderCssInjected = true;
    }, []);
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
    useInjectSliderCss();
    const clamp = (n: number) => Math.min(max, Math.max(min, n));
    const set = (n: number) => {
        if (!disabled && Number.isFinite(n)) onChange?.(clamp(n));
    };

    return (
        <div className={`flex items-center gap-2 ${className}`} style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={disabled}
                onChange={(e) => set(Number(e.target.value))}
                className="tux-slider"
                style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, width: 0, minWidth: 0 }}
            />
            {/* Fixed-width value box (so boxes align across rows) with the unit as
                an in-box suffix — no external slot, so the slider reaches the edge. */}
            <div className="relative shrink-0" style={{ width: 56, boxSizing: 'border-box' }}>
                <input
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => set(Number(e.target.value))}
                    className={`tux-slider-num py-1 text-xs tabular-nums border outline-none disabled:opacity-50 disabled:cursor-not-allowed ${theme.font} ${disabled ? theme.input.disabled : theme.input.primary}`}
                    style={{ width: '100%', textAlign: 'right', paddingLeft: 6, paddingRight: unit ? 16 : 6 }}
                />
                {unit && (
                    <span
                        className="absolute text-midnight-text-muted"
                        style={{ right: 5, top: '50%', transform: 'translateY(-50%)', fontSize: 10, lineHeight: 1, pointerEvents: 'none' }}
                    >{unit}</span>
                )}
            </div>
        </div>
    );
};

export default TerminalSlider;
