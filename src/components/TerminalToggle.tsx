import React from 'react';
import { useTheme } from '../theme';

export interface TerminalToggleProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    size?: 'small' | 'default' | 'large';
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    label?: string;
    className?: string;
}

export const TerminalToggle: React.FC<TerminalToggleProps> = ({
    checked = false,
    onChange,
    disabled = false,
    size = 'default',
    variant = 'primary',
    label = '',
    className = '',
}) => {
    const theme = useTheme();

    const sizes: Record<string, { switch: string; toggle: string; translate: string }> = {
        small: { switch: 'w-8 h-4', toggle: 'w-3 h-3', translate: 'translate-x-4' },
        default: { switch: 'w-10 h-5', toggle: 'w-4 h-4', translate: 'translate-x-5' },
        large: { switch: 'w-12 h-6', toggle: 'w-5 h-5', translate: 'translate-x-6' },
    };

    const currentSize = sizes[size];

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) {
                onChange?.(!checked);
            }
        }
    };

    return (
        <div className={`flex w-full items-center gap-3 ${!label ? 'justify-end' : ''} ${className}`}>
            {label && <span className="flex-1 text-sm text-midnight-text-body">{label}</span>}
            <button
                role="switch"
                aria-checked={checked}
                tabIndex={0}
                disabled={disabled}
                onClick={() => !disabled && onChange?.(!checked)}
                onKeyDown={handleKeyDown}
                className={`
                    relative inline-flex items-center flex-shrink-0
                    rounded-full transition-all duration-200
                    border
                    focus:outline-none focus:ring-2 focus:ring-midnight-accent/50 focus:ring-offset-2 focus:ring-offset-midnight-base
                    ${currentSize.switch}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${checked
                        ? 'bg-midnight-accent border-midnight-accent shadow-[0_0_8px_rgba(139,92,246,0.4)]'
                        : 'bg-midnight-raised border-midnight-border hover:border-midnight-accent/50'
                    }
                `}
            >
                <span
                    className={`
                        inline-block rounded-full bg-white shadow-sm
                        transform transition-transform duration-200 ease-out
                        ${currentSize.toggle}
                        ${checked ? currentSize.translate : 'translate-x-0.5'}
                    `}
                />
            </button>
        </div>
    );
};

export default TerminalToggle;
