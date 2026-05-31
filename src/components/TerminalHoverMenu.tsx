import React, { useState } from 'react';
import { LayoutGridIcon } from 'lucide-react';
import { useTheme } from '../theme';

export interface TerminalHoverMenuActionButton {
    icon: any;
    onClick?: () => void;
    title?: string;
    subItems?: TerminalHoverMenuActionButton[];
}

export interface TerminalHoverMenuProps {
    actionButtons: TerminalHoverMenuActionButton[];
}

const TerminalHoverMenuItem: React.FC<{ item: TerminalHoverMenuActionButton }> = ({ item }) => {
    const theme = useTheme();
    const { icon: Icon, onClick, title, subItems } = item;
    const [open, setOpen] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            {/* parent button */}
            <button
                onClick={onClick}
                title={title}
                className={`p-1 flex items-center justify-center rounded-sm ${theme.hoverMenu.item} transition`}>
                <Icon className={`w-4 h-4 ${theme.icon}`} />
            </button>

            {/* submenu: only in DOM when open */}
            {open && subItems && subItems.length > 0 && (
                <div className={`absolute left-full top-0 -translate-x-1 z-10 ${theme.hoverMenu.subItems.content} p-1 rounded-md shadow-lg flex flex-row space-x-1`}>
                    {subItems.map((sub, idx) => {
                        const SubIcon = sub.icon;
                        return (
                            <button
                                key={idx}
                                onClick={sub.onClick}
                                title={sub.title}
                                className={`p-1 flex items-center justify-center rounded-sm ${theme.hoverMenu.subItems.item} transition`}>
                                <SubIcon className={`w-4 h-4 ${theme.icon}`} />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export const TerminalHoverMenu: React.FC<TerminalHoverMenuProps> = ({ actionButtons }) => {
    const theme = useTheme();

    return (
        <div className="relative inline-block group">
            {/* Trigger */}
            <button
                className={`p-1 flex items-center justify-center rounded-sm ${theme.hoverMenu.trigger} transition`}
                title="Actions"
            >
                <LayoutGridIcon className={`w-3 h-3 ${theme.icon}`} />
            </button>

            {/* Primary vertical menu */}
            <div
                className={`${theme.hoverMenu.content}
                    absolute left-full top-1/4
                    transform -translate-y-1/4 -translate-x-1
                    hidden group-hover:flex hover:flex
                    z-10 ${theme.bg} p-1 rounded-md shadow-lg
                    flex-col space-y-1
                `}>
                {actionButtons.map((btn, i) => (
                    <TerminalHoverMenuItem key={i} item={btn} />
                ))}
            </div>
        </div>
    );
};

export default TerminalHoverMenu;
