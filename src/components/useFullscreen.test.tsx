import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFullscreen } from './useFullscreen';

// jsdom has no Fullscreen API; this stands in for a browser that has one.
let current: Element | null = null;
const changed = () => document.dispatchEvent(new Event('fullscreenchange'));

const install = (refuse = false) => {
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => current });
    document.documentElement.requestFullscreen = vi.fn(async function (this: Element) {
        if (refuse) throw new TypeError('Permissions check failed');
        current = this;
        changed();
    });
    document.exitFullscreen = vi.fn(async () => {
        current = null;
        changed();
    });
};

beforeEach(() => {
    current = null;
    install();
});

afterEach(() => {
    delete (document as unknown as Record<string, unknown>).fullscreenElement;
    delete (document.documentElement as unknown as Record<string, unknown>).requestFullscreen;
});

describe('useFullscreen', () => {
    it('reports support and starts inactive', () => {
        const { result } = renderHook(() => useFullscreen());
        expect(result.current.supported).toBe(true);
        expect(result.current.active).toBe(false);
    });

    it('enters full screen and follows the browser into it', async () => {
        const { result } = renderHook(() => useFullscreen());
        let ok = false;
        await act(async () => {
            ok = await result.current.enter();
        });
        expect(ok).toBe(true);
        expect(result.current.active).toBe(true);
    });

    it('follows the browser out when the user presses Escape', async () => {
        const { result } = renderHook(() => useFullscreen());
        await act(async () => {
            await result.current.enter();
        });
        act(() => {
            current = null;
            changed();
        });
        expect(result.current.active).toBe(false);
    });

    it('resolves false, without throwing, when the browser refuses', async () => {
        install(true);
        const { result } = renderHook(() => useFullscreen());
        let ok = true;
        await act(async () => {
            ok = await result.current.enter();
        });
        expect(ok).toBe(false);
        expect(result.current.active).toBe(false);
    });

    it('reports unsupported, and enter resolves false, where the API is missing', async () => {
        delete (document.documentElement as unknown as Record<string, unknown>).requestFullscreen;
        const { result } = renderHook(() => useFullscreen());
        expect(result.current.supported).toBe(false);
        let ok = true;
        await act(async () => {
            ok = await result.current.enter();
        });
        expect(ok).toBe(false);
    });

    it('toggles in and out', async () => {
        const { result } = renderHook(() => useFullscreen());
        await act(async () => {
            expect(await result.current.toggle()).toBe(true);
        });
        expect(result.current.active).toBe(true);
        await act(async () => {
            expect(await result.current.toggle()).toBe(false);
        });
        expect(result.current.active).toBe(false);
        expect(document.exitFullscreen).toHaveBeenCalledTimes(1);
    });

    it('is active only for its own element when given a target', async () => {
        const el = document.createElement('div');
        document.body.appendChild(el);
        el.requestFullscreen = vi.fn(async function (this: Element) {
            current = this;
            changed();
        });
        const { result } = renderHook(() => useFullscreen({ current: el }));
        act(() => {
            current = document.body;
            changed();
        });
        expect(result.current.active).toBe(false);
        await act(async () => {
            await result.current.enter();
        });
        expect(el.requestFullscreen).toHaveBeenCalled();
        expect(result.current.active).toBe(true);
        el.remove();
    });

    it('stops listening when unmounted', () => {
        const remove = vi.spyOn(document, 'removeEventListener');
        const { unmount } = renderHook(() => useFullscreen());
        unmount();
        expect(remove).toHaveBeenCalledWith('fullscreenchange', expect.any(Function));
        remove.mockRestore();
    });
});
