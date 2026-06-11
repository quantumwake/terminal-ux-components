import React from 'react';
import { useTheme } from '../theme';

// TerminalSelect — a native <select> styled from the theme (consistent with
// TerminalInput). A lightweight, dependency-free alternative to TerminalDropdown
// (which pulls @headlessui/react) for simple option choices in hosts that don't
// ship headlessui. Provider-free: useTheme() falls back to the midnight default.
export interface TerminalSelectOption {
    value: string;
    label?: string;
}

export interface TerminalSelectProps {
    value: string;
    options: (TerminalSelectOption | string)[];
    onChange?: (value: string) => void;
    disabled?: boolean;
    size?: 'small' | 'default' | 'large';
    className?: string;
}

export const TerminalSelect: React.FC<TerminalSelectProps> = ({
    value,
    options,
    onChange,
    disabled = false,
    size = 'default',
    className = '',
}) => {
    const theme = useTheme();
    const opts = options.map((o) =>
        typeof o === 'string' ? { value: o, label: o } : { value: o.value, label: o.label ?? o.value },
    );
    const sizes: Record<string, string> = {
        small: 'px-2 py-1 text-xs',
        default: 'px-3 py-2 text-sm',
        large: 'px-4 py-2.5 text-base',
    };

    return (
        <select
            value={value}
            disabled={disabled}
            onChange={(e) => onChange?.(e.target.value)}
            className={`
                w-full border ${theme.font}
                ${disabled ? theme.input.disabled : theme.input.primary}
                ${sizes[size]}
                outline-none cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-midnight-accent/50
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
            `}
        >
            {opts.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    );
};

export default TerminalSelect;
