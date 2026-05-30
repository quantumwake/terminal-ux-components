import React, { ChangeEvent, KeyboardEvent, FocusEvent, ReactNode } from 'react';
import { useTheme } from '../theme';

export interface TerminalInputProps {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'ghost';
    size?: 'small' | 'default' | 'large';
    disabled?: boolean;
    type?: string;
    name?: string;
    value?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
    onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
    placeholder?: string;
    icon?: ReactNode;
    className?: string;
}

export const TerminalInput: React.FC<TerminalInputProps> = ({
    variant = 'primary',
    size = 'default',
    disabled = false,
    type = 'text',
    name,
    value,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    placeholder = '',
    icon,
    className = '',
}) => {
    const theme = useTheme();

    const variants: Record<string, string> = {
        primary: theme.input.primary,
        secondary: theme.input.secondary,
        danger: theme.input.danger,
        success: theme.input.success,
        warning: theme.input.warning,
        info: theme.input.info,
        ghost: theme.input.ghost,
    };

    const sizes: Record<string, string> = {
        small: 'px-3 py-1.5 text-xs',
        default: 'px-4 py-2.5 text-sm',
        large: 'px-5 py-3 text-base',
    };

    const baseStyle = `
        w-full border border-midnight-border
        bg-midnight-surface
        text-midnight-text-body placeholder-midnight-text-disabled
        transition-all duration-200
        hover:bg-midnight-elevated hover:border-midnight-border-glow
        focus:outline-none focus:ring-2 focus:ring-midnight-accent/50 focus:border-midnight-accent
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-midnight-surface
    `;
    const variantStyle = disabled ? theme.input.disabled : variants[variant];
    const sizeStyle = sizes[size];

    return (
        <div className="relative flex items-center">
            {icon && (
                <span className="absolute left-3 text-midnight-text-muted">
                    {icon}
                </span>
            )}
            <input
                type={type}
                autoComplete={type === 'password' ? 'on' : 'off'}
                name={name}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                onFocus={onFocus}
                onBlur={onBlur}
                disabled={disabled}
                placeholder={placeholder}
                className={`
                    ${baseStyle}
                    ${variantStyle}
                    ${sizeStyle}
                    ${icon ? 'pl-10' : ''}
                    ${className}
                `}
            />
        </div>
    );
};

export default TerminalInput;
