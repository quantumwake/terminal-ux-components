import React, { ReactNode } from 'react';
import { Check } from 'lucide-react';

export interface TerminalCheckboxChangeEvent {
    target: { checked: boolean; name?: string };
}

export interface TerminalCheckboxProps {
    checked?: boolean;
    onChange?: (e: TerminalCheckboxChangeEvent) => void;
    disabled?: boolean;
    label?: ReactNode;
    name?: string;
    id?: string;
    className?: string;
}

export const TerminalCheckbox: React.FC<TerminalCheckboxProps> = ({
    checked = false,
    onChange,
    disabled = false,
    label,
    name,
    id,
    className = '',
}) => {
    const handleChange = () => {
        if (!disabled && onChange) {
            onChange({ target: { checked: !checked, name } });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleChange();
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
                aria-checked={checked}
                tabIndex={0}
                disabled={disabled}
                onClick={handleChange}
                onKeyDown={handleKeyDown}
                className={`
                    w-5 h-5 flex-shrink-0 flex items-center justify-center
                    transition-all duration-200
                    border
                    focus:outline-none focus:ring-2 focus:ring-midnight-accent/50 focus:ring-offset-1 focus:ring-offset-midnight-base
                    ${checked
                        ? 'bg-midnight-accent border-midnight-accent shadow-[0_0_8px_rgba(139,92,246,0.3)]'
                        : 'bg-midnight-surface border-midnight-border hover:border-midnight-accent/50'
                    }
                    ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </button>
            <input
                type="checkbox"
                id={id}
                name={name}
                checked={checked}
                onChange={() => {}}
                disabled={disabled}
                className="sr-only"
            />
            {label && <span className="text-sm text-midnight-text-body">{label}</span>}
        </label>
    );
};

export default TerminalCheckbox;
