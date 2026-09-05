// TerminalSecretReveal.tsx — a SHOW-ONCE secret (an issued api key, an
// enrollment token, a generated password): the value, a copy button, and
// a done button, framed so nobody mistakes it for a persistent field.
// The host owns the lifecycle — `onDone` is where it clears the secret
// from state; nothing here persists the value anywhere.
import React, { ReactNode, useState } from 'react';
import { Check, Clipboard } from 'lucide-react';
import { useTheme } from '../theme';

export interface TerminalSecretRevealProps {
    /** The secret to show. */
    value: string;
    /** Header line; defaults to the show-once warning. */
    label?: string;
    /** Guidance under the value (where to put it, what it is for). */
    note?: ReactNode;
    /** Called when the user dismisses the reveal. */
    onDone?: () => void;
    doneLabel?: string;
    className?: string;
}

export const TerminalSecretReveal: React.FC<TerminalSecretRevealProps> = ({
    value,
    label = 'copy now — shown only once',
    note,
    onDone,
    doneLabel = 'done',
    className = '',
}) => {
    const theme = useTheme();
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard unavailable (insecure context) — the value is selectable */
        }
    };

    return (
        <div className={`border ${theme.border} ${theme.bgSecondary} p-3 ${className}`}>
            <div className={`mb-1 text-[10px] uppercase tracking-wider ${theme.textAccent}`}>{label}</div>
            <div className="flex items-center gap-2">
                <code className={`flex-1 select-all break-all font-mono text-[11px] ${theme.default.text.primary}`}>{value}</code>
                <button
                    type="button"
                    onClick={copy}
                    title="copy"
                    className={`flex items-center gap-1 px-2 py-1 text-[11px] ${theme.button.secondary}`}
                >
                    {copied ? <Check className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />}
                    {copied ? 'copied' : 'copy'}
                </button>
                {onDone && (
                    <button
                        type="button"
                        onClick={onDone}
                        className={`px-2 py-1 text-[11px] ${theme.button.ghost}`}
                    >
                        {doneLabel}
                    </button>
                )}
            </div>
            {note && <div className={`mt-2 text-[11px] leading-relaxed ${theme.default.text.muted}`}>{note}</div>}
        </div>
    );
};

export default TerminalSecretReveal;
