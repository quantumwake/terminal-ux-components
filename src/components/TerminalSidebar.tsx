import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '../theme';

export interface TerminalSidebarProps {
    isOpen?: boolean;
    onToggle?: () => void;
    tabContent?: React.ReactNode;
    mainContent?: React.ReactNode;
    className?: string;
    position?: 'left' | 'right';
    defaultWidth?: number;
    minWidth?: number;
    maxWidth?: number;
    collapsedWidth?: number;
}

export const TerminalSidebar: React.FC<TerminalSidebarProps> = ({
    isOpen,
    onToggle,
    tabContent,
    mainContent,
    className,
    position = 'left',
    defaultWidth = 384,
    minWidth = 200,
    maxWidth = 600,
    collapsedWidth = 48,
}) => {
    const theme = useTheme();
    const [width, setWidth] = useState(defaultWidth);
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((e: MouseEvent) => {
        if (!isResizing) return;

        let newWidth;
        if (position === 'left') {
            newWidth = e.clientX;
        } else {
            newWidth = window.innerWidth - e.clientX;
        }

        if (newWidth >= minWidth && newWidth <= maxWidth) {
            setWidth(newWidth);
        }
    }, [isResizing, position, minWidth, maxWidth]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    const resizeHandle = (
        <div
            onMouseDown={startResizing}
            className={`w-1 cursor-col-resize hover:bg-midnight-accent/50 active:bg-midnight-accent transition-colors ${isResizing ? 'bg-midnight-accent' : ''}`}
            style={{ flexShrink: 0 }}
        />
    );

    return (
        <aside
            className={`
                flex bg-midnight-surface/60
                ${position === 'left' ? 'border-r' : 'border-l'}
                border-midnight-border
                ${className}
            `}
            style={{
                width: isOpen ? width : collapsedWidth,
                transition: isResizing ? 'none' : 'width 0.2s',
                flexShrink: 0,
            }}
        >
            {position === 'left' ? (
                <>
                    {tabContent}
                    {isOpen && mainContent}
                    {isOpen && resizeHandle}
                </>
            ) : (
                <>
                    {isOpen && resizeHandle}
                    {isOpen && mainContent}
                    {tabContent}
                </>
            )}
        </aside>
    );
};

export default TerminalSidebar;
