import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '../theme';

export interface TerminalContextMenuItem {
    id: string | number;
    label?: string;
    icon?: any;
    danger?: boolean;
    subItems?: TerminalContextMenuItem[];
    [key: string]: any;
}

export interface TerminalContextMenuPosition {
    x: number;
    y: number;
}

export interface TerminalContextMenuProps {
    trigger?: React.ReactNode;
    menuItems: TerminalContextMenuItem[];
    onItemClick?: (item: TerminalContextMenuItem, subItem?: TerminalContextMenuItem | null) => void;
    isOpen?: boolean;
    setIsOpen: (open: boolean) => void;
    className?: string;
    menuRef: React.RefObject<HTMLDivElement>;
    menuPosition?: TerminalContextMenuPosition;
}

export const TerminalContextMenu: React.FC<TerminalContextMenuProps> = ({
    trigger,
    menuItems,
    onItemClick,
    isOpen,
    setIsOpen,
    className = '',
    menuRef,
    menuPosition = { x: 0, y: 0 },
}) => {
    const [activeSubmenu, setActiveSubmenu] = useState<string | number | null>(null);
    const theme = useTheme();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setActiveSubmenu(null);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, setIsOpen]);

    const handleItemClick = (item: TerminalContextMenuItem, subItem: TerminalContextMenuItem | null = null) => {
        if (item.subItems) {
            setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
            onItemClick?.(item, subItem);
            return;
        }

        if (onItemClick) {
            onItemClick(item, subItem);
        }

        if (!item.subItems) {
            setIsOpen(false);
            setActiveSubmenu(null);
        }
    };

    const renderMenuItem = (item: TerminalContextMenuItem) => {
        const Icon = item.icon;
        const hasSubItems = (item.subItems?.length ?? 0) > 0;
        const isSubmenuOpen = activeSubmenu === item.id;

        return (
            <div key={item.id}>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        handleItemClick(item);
                    }}
                    className={`w-full text-left px-2 py-1.5 ${theme.hover} flex items-center gap-2 group
                    ${item.danger ? theme.textAccent : theme.text}`}>
                    {Icon && <Icon className={`w-3 h-3 ${theme.icon}`} />}
                    <span className="text-xs">{item.label}</span>
                    {hasSubItems && (
                        <ChevronRight
                            className={`w-3 h-3 ${theme.icon} ml-auto transform transition-transform
                            ${isSubmenuOpen ? 'rotate-90' : ''}`}
                        />
                    )}
                </button>

                {isSubmenuOpen && item.subItems && (
                    <div className="ml-4 border-l pl-2 space-y-1">
                        {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            return (
                                <button
                                    key={subItem.id}
                                    onClick={() => handleItemClick(item, subItem)}
                                    className={`w-full text-left px-2 py-1 ${theme.hover} flex items-center gap-2`}
                                >
                                    {SubIcon && <SubIcon className={`w-3 h-3 ${theme.icon}`} />}
                                    <span className={`text-xs ${theme.text}`}>{subItem.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div ref={menuRef} className={`fixed border border-midnight-border bg-midnight-surface shadow-lg overflow-hidden z-[9999] ${className}`}
            style={{
                width: '12rem',
                left: `${menuPosition.x}px`,
                top: `${menuPosition.y}px`,
            }}>
            {menuItems.map(renderMenuItem)}
        </div>
    );
};

export default TerminalContextMenu;
