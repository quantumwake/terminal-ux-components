// TerminalErrorBoundary.tsx — a render-error fence. A component that throws
// takes the whole React tree down to a blank page; a boundary around each
// region (an inspector, a workspace tab) keeps the failure local and says
// what broke, so the console stays usable and the bug is visible in the UI
// rather than only in the browser console.
import React, { ReactNode } from 'react';
import { TerminalButton } from './TerminalButton';

export interface TerminalErrorBoundaryProps {
    children: ReactNode;
    /** What the region is, for the message ("inspector", "query"). */
    label?: string;
    /** Called with the error (log it, report it). */
    onError?: (error: Error) => void;
    /** Custom fallback; receives the error and a reset. */
    fallback?: (error: Error, reset: () => void) => ReactNode;
    /** When this changes the boundary resets (a new selection, a new route). */
    resetKey?: unknown;
}

interface State { error: Error | null }

export class TerminalErrorBoundary extends React.Component<TerminalErrorBoundaryProps, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error) {
        this.props.onError?.(error);
    }

    componentDidUpdate(prev: TerminalErrorBoundaryProps) {
        if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
    }

    reset = () => this.setState({ error: null });

    render() {
        const { error } = this.state;
        if (!error) return this.props.children;
        if (this.props.fallback) return this.props.fallback(error, this.reset);

        return (
            <div className="m-3 border border-midnight-danger/50 p-3 font-mono text-[11px]">
                <div className="text-midnight-danger-bright">{this.props.label ? `${this.props.label} failed to render` : 'failed to render'}</div>
                <div className="mt-1 break-words text-midnight-text-subdued">{String(error.message || error)}</div>
                <div className="mt-2"><TerminalButton size="small" variant="ghost" onClick={this.reset}>try again</TerminalButton></div>
            </div>
        );
    }
}

export default TerminalErrorBoundary;
