import React, { useState } from 'react';
import { useTheme } from '../theme';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface TerminalTabViewSectionItem {
    title?: string;
    content?: React.ReactNode;
}

export interface TerminalTabViewSectionProps {
    title?: string;
    items: Record<string, TerminalTabViewSectionItem>;
    depth?: number;
    sub?: boolean;
    /** Initial collapsed state when uncontrolled. Ignored once `collapsed` is passed. */
    defaultCollapsed?: boolean;
    /** Controlled collapsed state. Once passed, the section never changes it on its own — the caller updates it from `onToggle`. */
    collapsed?: boolean;
    /** Called with the collapsed state a header click asks for, in both controlled and uncontrolled use. */
    onToggle?: (collapsed: boolean) => void;
    /** An optional count rendered beside the title, in the library's muted count style. */
    count?: number;
    /** Rendered after the items, e.g. a "show more" row. */
    footer?: React.ReactNode;
}

export const TerminalTabViewSection: React.FC<TerminalTabViewSectionProps> = ({
    title,
    items,
    depth,
    sub = false,
    defaultCollapsed = false,
    collapsed,
    onToggle,
    count,
    footer,
}) => {
    const level = depth ?? (sub ? 2 : 0);
    const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
    const isControlled = collapsed !== undefined;
    const isCollapsed = isControlled ? collapsed : internalCollapsed;
    const theme = useTheme();

    const handleToggle = () => {
        const next = !isCollapsed;
        if (!isControlled) {
            setInternalCollapsed(next);
        }
        onToggle?.(next);
    };

    // Visual hierarchy by depth level
    const styles = (() => {
        switch (level) {
            case 0:
                return {
                    header: `flex w-full items-center justify-between px-3 py-2 ${theme.tab.section.hover} font-mono border-b ${theme.border} bg-midnight-elevated`,
                    headerText: `${theme.text} font-bold text-xs uppercase tracking-wider`,
                    prefix: '#',
                    indent: '',
                };
            case 1:
                return {
                    header: `flex w-full items-center justify-between px-2 py-1.5 ${theme.tab.section.hover} ${theme.tab.section.header} font-mono border-b ${theme.border}`,
                    headerText: `${theme.text} font-semibold`,
                    prefix: '##',
                    indent: 'pl-1',
                };
            default:
                return {
                    header: `flex w-full items-center justify-between px-2 py-1 ${theme.tab.section.hover} font-mono border-b ${theme.border}`,
                    headerText: `${theme.text}`,
                    prefix: '-',
                    indent: 'pl-2',
                };
        }
    })();

    return (
        <>
            <div className={`border-0 ${theme.border} w-full flex flex-col ${styles.indent}`}>
                {/* collapse button */}
                <button onClick={handleToggle} aria-expanded={!isCollapsed} className={styles.header}>
                    <div className="flex items-center gap-1.5">
                        <span className={theme.textAccent}>{styles.prefix}</span>
                        <span className={`text-xs ${styles.headerText}`}>{title}</span>
                        {count !== undefined && (
                            <span className={`font-mono text-[10px] ${theme.default.text.muted}`}>({count})</span>
                        )}
                    </div>
                    {isCollapsed ? (
                        <ChevronRight className={`w-3 h-3 ${theme.textAccent}`} />
                    ) : (
                        <ChevronDown className={`w-3 h-3 ${theme.textAccent}`} />
                    )}
                </button>

                {/* section items */}
                {!isCollapsed && (
                    <div className={`py-0.5 overflow-visible h-full`}>
                        {Object.entries(items).map(([key, sub]) => (
                            <div key={key} className="overflow-visible">{sub.content}</div>
                        ))}
                        {footer}
                    </div>
                )}
            </div>
        </>
    );
};

export default TerminalTabViewSection;
