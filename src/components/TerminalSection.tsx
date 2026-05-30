import React, { ReactNode } from 'react';
import { useTheme } from '../theme';

export interface TerminalSectionProps {
    title: string;
    children?: ReactNode;
    className?: string;
}

export const TerminalSection: React.FC<TerminalSectionProps> = ({ title, children, className = '' }) => {
    const theme = useTheme();

    return (
        <div className={className}>
            <div className={`px-3 py-2 border-b ${theme.border}`}>
                <span className={theme.textAccent}>&gt; {title.toUpperCase()}</span>
            </div>
            <div className="p-2">{children}</div>
        </div>
    );
};

export default TerminalSection;
