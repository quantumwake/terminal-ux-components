import React from 'react';
import { useTheme } from '../theme';

export interface TerminalFileInputProps {
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    accept?: string;
    icon?: React.ReactNode;
    className?: string;
}

export const TerminalFileInput: React.FC<TerminalFileInputProps> = ({
    onChange,
    accept,
    icon = null,
    className = '',
}) => {
    const theme = useTheme();

    return (
        <div className={`flex items-center gap-2 ${theme.border} border rounded p-2 ${className}`}>
            {icon}
            <input
                type="file"
                accept={accept}
                onChange={onChange}
                className={`text-xs ${theme.text} file:mr-4 file:py-1 file:px-4
                    file:border-0 file:text-xs file:font-medium file:bg-transparent
                    hover:file:${theme.hover} file:${theme.text} w-full`}
            />
        </div>
    );
};

export default TerminalFileInput;
