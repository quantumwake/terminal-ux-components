import React, { ReactNode } from 'react';
import { useTheme } from '../theme';

export interface TerminalButtonProps {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'ghost';
    size?: 'small' | 'default' | 'large';
    disabled?: boolean;
    onClick?: () => void;
    icon?: ReactNode;
    children?: ReactNode;
    style?: React.CSSProperties | string;
    className?: string;
    title?: string;
}

export const TerminalButton: React.FC<TerminalButtonProps> = ({
    variant = 'primary',
    size = 'default',
    disabled = false,
    onClick,
    icon,
    children,
    style = '',
    className = '',
    title,
}) => {
    const theme = useTheme();

    const variants: Record<string, string> = {
        primary: theme.button.primary,
        secondary: theme.button.secondary,
        danger: theme.button.danger,
        success: theme.button.success,
        warning: theme.button.warning,
        info: theme.button.info,
        ghost: theme.button.ghost,
    };

    const sizes: Record<string, string> = {
        small: 'px-3 py-1.5 text-xs gap-1.5',
        default: 'px-4 py-2 text-sm gap-2',
        large: 'px-5 py-2.5 text-base gap-2',
    };

    const baseStyle = `
        inline-flex items-center justify-center font-medium
        border
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-midnight-base
        disabled:opacity-50 disabled:cursor-not-allowed
    `;
    const variantStyle = disabled ? theme.button.disabled : variants[variant];
    const sizeStyle = sizes[size];

    return (
        <button
            style={typeof style === 'string' ? undefined : style}
            onClick={!disabled ? onClick : undefined}
            disabled={disabled}
            className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className}`}
            title={title}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
        </button>
    );
};

export default TerminalButton;
