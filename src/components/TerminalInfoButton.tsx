import React, { useState, useRef, useEffect, ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { Info, Clipboard } from 'lucide-react';
import { useTheme } from '../theme';

export interface TerminalInfoButtonProps {
    id?: string;
    details?: string;
    className?: string;
    icon?: ReactNode;
}

export const TerminalInfoButton: React.FC<TerminalInfoButtonProps> = ({ id, details, className, icon }) => {
    const theme = useTheme();
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipStyles, setTooltipStyles] = useState<React.CSSProperties>({});
    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggleTooltip = () => setShowTooltip((prev) => !prev);
    const copyToClipboard = (text?: string) => {
        if (text) navigator.clipboard.writeText(text);
    };

    const CopyItem: React.FC<{ label: string; value?: string; className?: string }> = ({
        label,
        value,
        className = '',
    }) => (
        <div className={`flex items-center ${theme.text} ${className}`}>
            {label}: {value}
            <button onClick={() => copyToClipboard(value)} className={`ml-2 p-1 rounded ${theme.button.secondary}`}>
                <Clipboard className={`w-4 h-4 ${theme.icon}`} />
            </button>
        </div>
    );

    useEffect(() => {
        if (showTooltip && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const offset = { top: 8, left: 32 };
            setTooltipStyles({
                position: 'fixed',
                top: rect.bottom + offset.top,
                left: rect.left + offset.left,
                zIndex: 9999,
            });
        }
    }, [showTooltip]);

    const tooltipElement = (
        <div style={tooltipStyles} className={`${theme.bg} border ${theme.border} shadow-md p-2 w-96`}>
            <CopyItem label="ID" value={id} />
            <CopyItem label="Details" value={details} className="mt-1" />
        </div>
    );

    return (
        <>
            <button ref={buttonRef} className={`${className} rounded ${theme.button.secondary}`} onClick={toggleTooltip}>
                {!icon && <Info className="w-3 h-3" />}
                {icon}
            </button>
            {showTooltip && ReactDOM.createPortal(tooltipElement, document.body)}
        </>
    );
};

export default TerminalInfoButton;
