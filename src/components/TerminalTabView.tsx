// TerminalTabView.tsx — the WORK-AREA tab view: a set of named tabs (each
// with its own content) and a tab strip at the bottom (or top), the way
// the ISM studio frames its workspaces. Promoted from the enterprise
// app's local copy so every host composes the same shell; the store
// coupling is gone — the active tab is controlled by the host
// (`activeTab` + `onTabSelect`) or kept internally when omitted.
import React, { ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../theme';

export interface TerminalTabViewTab {
    /** Stable identity (what `activeTab` / callbacks refer to). */
    name: string;
    label: ReactNode;
    content: ReactNode;
    closeable?: boolean;
}

export interface TerminalTabViewProps {
    tabs: TerminalTabViewTab[];
    /** Controlled active tab; omit to let the view manage it. */
    activeTab?: string;
    onTabSelect?: (name: string) => void;
    onTabClose?: (name: string) => void;
    /** Where the strip sits relative to the content. */
    position?: 'top' | 'bottom';
    className?: string;
}

export const TerminalTabView: React.FC<TerminalTabViewProps> = ({
    tabs,
    activeTab,
    onTabSelect,
    onTabClose,
    position = 'bottom',
    className = '',
}) => {
    const theme = useTheme();
    const [internal, setInternal] = useState(tabs[0]?.name ?? '');
    const active = activeTab ?? internal;

    // A closed or vanished active tab falls back to the first one.
    useEffect(() => {
        if (activeTab !== undefined || tabs.some((t) => t.name === internal)) return;
        setInternal(tabs[0]?.name ?? '');
    }, [tabs, internal, activeTab]);

    const select = (name: string) => {
        if (activeTab === undefined) setInternal(name);
        onTabSelect?.(name);
    };

    const strip = (
        <div className={`flex border-dashed ${theme.border} ${position === 'bottom' ? 'border-t' : 'border-b'}`}>
            {tabs.map((tab) => (
                <button
                    key={tab.name}
                    onClick={() => select(tab.name)}
                    className={`group flex items-center gap-2 border-r border-dashed px-4 py-2 font-mono text-xs transition-colors duration-150 ${theme.border} ${
                        active === tab.name ? theme.button.secondary : theme.button.ghost
                    }`}
                >
                    <span>{tab.label}</span>
                    {tab.closeable && (
                        <X
                            className="h-3.5 w-3.5 opacity-0 transition-opacity hover:text-midnight-danger group-hover:opacity-100"
                            onClick={(e) => {
                                e.stopPropagation();
                                onTabClose?.(tab.name);
                            }}
                        />
                    )}
                </button>
            ))}
        </div>
    );

    const content = <div className="min-h-0 flex-1 overflow-auto">{tabs.find((t) => t.name === active)?.content}</div>;

    return (
        <div className={`flex h-full w-full flex-col ${className}`}>
            {position === 'top' && strip}
            {content}
            {position === 'bottom' && strip}
        </div>
    );
};

export default TerminalTabView;
