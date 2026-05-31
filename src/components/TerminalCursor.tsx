import React from 'react';
import { useTheme } from '../theme';

export interface TerminalCursorProps {}

export const TerminalCursor: React.FC<TerminalCursorProps> = () => {
    const theme = useTheme();

    return (
        <div className={`w-2 h-4 inline-block ml-1 ${theme.textAccent} animate-pulse`}>
            _
        </div>
    );
};

export default TerminalCursor;
