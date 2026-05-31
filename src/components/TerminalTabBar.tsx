import React from 'react';
import { useTheme } from '../theme';
import { TerminalTabButton } from './TerminalTabButton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TerminalTabBarTab {
    id: string | number;
    icon?: React.ReactNode;
}

export interface TerminalTabBarProps {
    tabs: TerminalTabBarTab[];
    activeTab?: string | number;
    onTabChange: (id: string | number) => void;
    onToggle?: () => void;
    position?: 'left' | 'right';
    className?: string;
}

export const TerminalTabBar: React.FC<TerminalTabBarProps> = ({
    tabs,
    activeTab,
    onTabChange,
    onToggle,
    position = 'left',
    className = 'w-12',
}) => {
    // Theme is accessed for consistency with other terminal components.
    useTheme();

    return (
        <div className={`
            flex flex-col py-3 gap-1 ${className}
            bg-midnight-elevated/50
            ${position === 'left' ? 'border-r' : 'border-l'}
            border-midnight-border
        `}>
            {tabs.map((tab) => (
                <TerminalTabButton
                    key={tab.id}
                    isActive={activeTab === tab.id}
                    onClick={() => onTabChange(tab.id)}
                    icon={tab.icon}
                />
            ))}
            <div className="mt-auto">
                <TerminalTabButton
                    onClick={onToggle}
                    icon={position === 'left' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                />
            </div>
        </div>
    );
};

export default TerminalTabBar;
