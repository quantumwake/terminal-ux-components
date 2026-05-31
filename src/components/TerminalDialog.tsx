import React from 'react';
import { Dialog as HeadlessDialog, DialogPanel as HeadlessDialogPanel, DialogTitle as HeadlessDialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';
import { useTheme } from '../theme';

export interface TerminalDialogProps {
    isOpen?: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children?: React.ReactNode;
    width?: string;
}

export const TerminalDialog: React.FC<TerminalDialogProps> = ({
    isOpen,
    onClose,
    title,
    children,
    width = 'w-full max-w-md',
}) => {
    // Theme is accessed for consistency with other terminal components.
    useTheme();

    return (
        <HeadlessDialog open={!!isOpen} onClose={onClose} className="relative z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Dialog container */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <HeadlessDialogPanel className={`
                    ${width}
                    bg-midnight-surface
                    border border-midnight-border
                    rounded-lg
                    shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]
                    overflow-hidden
                `}>
                    {/* Dialog header */}
                    <div className="flex justify-between items-center px-5 py-4 bg-midnight-elevated/50 border-b border-midnight-border">
                        <HeadlessDialogTitle className="text-base font-semibold text-midnight-text-primary tracking-wide">
                            {title}
                        </HeadlessDialogTitle>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md text-midnight-text-muted hover:text-midnight-text-primary hover:bg-midnight-raised/50 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Dialog body */}
                    <div className="p-5">{children}</div>
                </HeadlessDialogPanel>
            </div>
        </HeadlessDialog>
    );
};

export default TerminalDialog;
