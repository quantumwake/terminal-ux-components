import React from 'react';

export interface TerminalTabButtonProps {
    isActive?: boolean;
    onClick?: () => void;
    children?: React.ReactNode;
    icon?: React.ReactNode;
}

export const TerminalTabButton: React.FC<TerminalTabButtonProps> = ({
    isActive,
    onClick,
    children,
    icon,
}) => {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center justify-center
                w-10 h-10 mx-auto rounded-lg
                transition-all duration-200
                ${isActive
                    ? 'bg-midnight-accent/20 text-midnight-accent-bright shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                    : 'text-midnight-text-muted hover:text-midnight-text-body hover:bg-midnight-raised/50'
                }
            `}>
            {children || icon}
        </button>
    );
};

export default TerminalTabButton;
