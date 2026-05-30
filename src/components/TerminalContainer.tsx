import React, { ReactNode } from 'react';
import { useTheme } from '../theme';

export interface TerminalContainerProps {
    children?: ReactNode;
    className?: string;
}

// Base container that applies theme background/text/font + optional effects.
export const TerminalContainer: React.FC<TerminalContainerProps> = ({ children, className = '' }) => {
    const theme = useTheme();

    const getEffectClasses = () => {
        const classes: string[] = [];
        if (theme.effects?.enableScanlines) {
            classes.push(theme.effects.scanlineClass);
        }
        if (theme.effects?.enableCrt) {
            classes.push(theme.effects.crtClass);
        }
        return classes.join(' ');
    };

    return (
        <div className={`${theme.bg} ${theme.text} ${theme.font} ${getEffectClasses()} ${className}`}>
            {children}
        </div>
    );
};

export default TerminalContainer;
