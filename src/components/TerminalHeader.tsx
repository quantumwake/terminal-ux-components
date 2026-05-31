import React from 'react';
import { useTheme } from '../theme';

export interface TerminalHeaderProps {
    leftContent?: React.ReactNode;
    rightContent?: React.ReactNode;
    className?: string;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
    leftContent,
    rightContent,
    className = '',
}) => {
    const theme = useTheme();

    return (
        <header className={`
            h-14 px-6 flex items-center justify-between
            bg-midnight-elevated/80 backdrop-blur-sm
            border-b border-midnight-border
            shadow-[0_2px_8px_rgba(0,0,0,0.3)]
            ${className}
        `}>
            <div className="flex items-center gap-3 text-midnight-text-primary font-semibold tracking-wide">
                {leftContent}
            </div>
            <div className="flex items-center gap-4">
                {rightContent}
            </div>
        </header>
    );
};

export default TerminalHeader;
