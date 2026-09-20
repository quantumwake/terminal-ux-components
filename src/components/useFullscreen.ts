import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';

export interface FullscreenState {
    /** Whether the browser is showing the page (or the target element) full screen right now. */
    active: boolean;
    /** Whether this browser offers the Fullscreen API at all (false in some embedded views). */
    supported: boolean;
    /** Ask for full screen. Resolves false, without throwing, when the browser refuses. */
    enter: () => Promise<boolean>;
    /** Leave full screen; does nothing when not in it. */
    exit: () => Promise<void>;
    /** Enter or leave. Resolves whether full screen is now on. */
    toggle: () => Promise<boolean>;
}

/**
 * useFullscreen wraps the browser's Fullscreen API for the whole page, or for
 * the element in `target`. Browsers only grant it inside a user gesture such
 * as a click, and the user can leave with Escape at any time, so `active`
 * follows the browser's own state rather than the calls made here; `enter`
 * resolves false when refused, so a host can fall back to its own full-window
 * mode.
 */
export function useFullscreen(target?: RefObject<HTMLElement | null>): FullscreenState {
    const inBrowser = typeof document !== 'undefined';
    const supported = inBrowser && typeof document.documentElement?.requestFullscreen === 'function';

    const isActive = useCallback(() => {
        if (!inBrowser || !document.fullscreenElement) return false;
        return !target?.current || document.fullscreenElement === target.current;
    }, [inBrowser, target]);

    const [active, setActive] = useState(isActive);

    useEffect(() => {
        if (!inBrowser) return undefined;
        const sync = () => setActive(isActive());
        document.addEventListener('fullscreenchange', sync);
        sync();
        return () => document.removeEventListener('fullscreenchange', sync);
    }, [inBrowser, isActive]);

    const enter = useCallback(async () => {
        if (!supported) return false;
        try {
            await (target?.current ?? document.documentElement).requestFullscreen();
            return true;
        } catch {
            return false;
        }
    }, [supported, target]);

    const exit = useCallback(async () => {
        if (!inBrowser || !document.fullscreenElement) return;
        try {
            await document.exitFullscreen();
        } catch {
            /* already out */
        }
    }, [inBrowser]);

    const toggle = useCallback(async () => {
        if (isActive()) {
            await exit();
            return false;
        }
        return enter();
    }, [isActive, enter, exit]);

    return { active, supported, enter, exit, toggle };
}

export default useFullscreen;
