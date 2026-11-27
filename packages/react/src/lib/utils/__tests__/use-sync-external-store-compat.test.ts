import { act, renderHook } from '@testing-library/react';
import type * as ReactModule from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';

/**
 * `use-sync-external-store-compat` selects its implementation once at module load, so each case
 * resets the module registry and imports it fresh against a controlled `react` mock.
 */
describe('use-sync-external-store-compat', () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock('react');
  });

  const createStore = () => {
    let value = 'first';
    const listeners = new Set<() => void>();
    return {
      subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      getSnapshot: () => value,
      set: (next: string) => {
        value = next;
        listeners.forEach((listener) => listener());
      },
      listenerCount: () => listeners.size,
    };
  };

  function mockReactWithoutUseSyncExternalStore(): void {
    vi.resetModules();
    vi.doMock('react', async () => {
      const actual = await vi.importActual<typeof ReactModule>('react');
      const withoutHook = { ...actual, useSyncExternalStore: undefined };
      return { ...withoutHook, default: withoutHook };
    });
  }

  it.each([
    ['React 18+ (native hook)', () => {}],
    ['React 17 (shim)', mockReactWithoutUseSyncExternalStore],
  ])('follows the store on %s', async (_name, prepare) => {
    prepare();
    const { useSyncExternalStore } = await import('../use-sync-external-store-compat');
    const store = createStore();

    const { result, unmount } = renderHook(() =>
      useSyncExternalStore(store.subscribe, store.getSnapshot),
    );
    expect(result.current).toBe('first');

    act(() => store.set('second'));
    expect(result.current).toBe('second');

    unmount();
    expect(store.listenerCount()).toBe(0);
  });

  it('shim: does not subscribe again when getSnapshot is an inline function', async () => {
    mockReactWithoutUseSyncExternalStore();
    const { useSyncExternalStore } = await import('../use-sync-external-store-compat');
    const store = createStore();
    const subscribe = vi.fn(store.subscribe);
    const { rerender } = renderHook(() =>
      useSyncExternalStore(subscribe, () => store.getSnapshot()),
    );

    rerender();
    rerender();

    expect(subscribe).toHaveBeenCalledTimes(1);
  });

  it('shim: returns the new snapshot in the same render when getSnapshot changes', async () => {
    mockReactWithoutUseSyncExternalStore();
    const { useSyncExternalStore } = await import('../use-sync-external-store-compat');
    const store = createStore();
    const seen: string[] = [];
    const { rerender } = renderHook(
      ({ suffix }: { suffix: string }) => {
        const value = useSyncExternalStore(store.subscribe, () => store.getSnapshot() + suffix);
        seen.push(value);
        return value;
      },
      { initialProps: { suffix: '-a' } },
    );

    rerender({ suffix: '-b' });

    expect(seen).not.toContain('first-a-b');
    expect(seen[seen.length - 1]).toBe('first-b');
    expect(seen.indexOf('first-b')).toBe(1);
  });

  it('shim: picks up a change made before it subscribed', async () => {
    mockReactWithoutUseSyncExternalStore();
    const { useSyncExternalStore } = await import('../use-sync-external-store-compat');
    const store = createStore();
    const { result } = renderHook(() => useSyncExternalStore(store.subscribe, store.getSnapshot));

    act(() => store.set('later'));

    expect(result.current).toBe('later');
  });
});
