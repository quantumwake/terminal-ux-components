import React, { ReactNode } from 'react';
import { Check, Minus } from 'lucide-react';

export interface TerminalCheckboxChangeEvent {
    target: { checked: boolean; name?: string };
    /** Set when the triggering click held Shift (a range-select gesture in a list/table). */
    shiftKey?: boolean;
}

export interface TerminalCheckboxProps {
    checked?: boolean;
    /** Tri-state: "some but not all" (a header checkbox over a partial selection). Takes precedence over `checked` for rendering; a click still toggles `checked` to true. */
    indeterminate?: boolean;
    onChange?: (e: TerminalCheckboxChangeEvent) => void;
    disabled?: boolean;
    label?: ReactNode;
    name?: string;
    id?: string;
    className?: string;
    'aria-label'?: string;
}

export const TerminalCheckbox: React.FC<TerminalCheckboxProps> = ({
    checked = false,
    indeterminate = false,
    onChange,
    disabled = false,
    label,
    name,
    id,
    className = '',
    'aria-label': ariaLabel,
}) => {
    const handleChange = (shiftKey = false) => {
        if (!disabled && onChange) {
            onChange({ target: { checked: !checked, name }, shiftKey });
        }
    };

    const handleClick = (e: React.MouseEvent) => handleChange(e.shiftKey);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleChange(false);
        }
    };

    return (
        <label
            htmlFor={id}
            className={`
                inline-flex items-center gap-3 cursor-pointer
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
        >
            <button
                type="button"
                role="checkbox"
                aria-checked={indeterminate ? 'mixed' : checked}
                aria-label={ariaLabel}
                tabIndex={0}
                disabled={disabled}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                className={`
                    w-5 h-5 flex-shrink-0 flex items-center justify-center
                    transition-all duration-200
                    border
                    focus:outline-none focus:ring-2 focus:ring-midnight-accent/50 focus:ring-offset-1 focus:ring-offset-midnight-base
                    ${checked || indeterminate
                        ? 'bg-midnight-accent border-midnight-accent shadow-[0_0_8px_rgba(139,92,246,0.3)]'
                        : 'bg-midnight-surface border-midnight-border hover:border-midnight-accent/50'
                    }
                    ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                {indeterminate
                    ? <Minus className="w-3 h-3 text-white" strokeWidth={3} />
                    : checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </button>
            <input
                type="checkbox"
                id={id}
                name={name}
                checked={checked}
                ref={(el) => { if (el) el.indeterminate = indeterminate; }}
                onChange={() => {}}
                disabled={disabled}
                aria-hidden="true"
                tabIndex={-1}
                className="sr-only"
            />
            {label && <span className="text-sm text-midnight-text-body">{label}</span>}
        </label>
    );
};

export default TerminalCheckbox;
