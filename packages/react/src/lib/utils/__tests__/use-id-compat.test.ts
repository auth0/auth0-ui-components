import { renderHook } from '@testing-library/react';
import type * as ReactModule from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';

/**
 * `use-id-compat` selects its implementation once at module load: it reads
 * `useId` off the React namespace and falls back to a ref-based shim when the
 * export is absent (React 17). These tests therefore reset the module registry
 * and dynamically import the module so each case evaluates it fresh against a
 * controlled `react` mock.
 */
describe('use-id-compat', () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock('react');
  });

  /**
   * Re-exports real React with `useId` forced to undefined to simulate React 17.
   * Vitest's mocked module throws on access to an omitted export, so the absent
   * native hook must be modeled as an explicit `undefined` rather than removed.
   */
  function mockReactWithoutUseId(): void {
    vi.resetModules();
    vi.doMock('react', async () => {
      const actual = await vi.importActual<typeof ReactModule>('react');
      const withoutUseId = { ...actual, useId: undefined };
      return { ...withoutUseId, default: withoutUseId };
    });
  }

  describe('React 18+ (native useId available)', () => {
    it("delegates to React's native useId", async () => {
      const { useId } = await import('../use-id-compat');
      const { result } = renderHook(() => useId());

      // React's native useId yields a non-empty string id.
      expect(typeof result.current).toBe('string');
      expect(result.current.length).toBeGreaterThan(0);
    });

    it('returns a stable id across re-renders', async () => {
      const { useId } = await import('../use-id-compat');
      const { result, rerender } = renderHook(() => useId());

      const first = result.current;
      rerender();
      expect(result.current).toBe(first);
    });

    it('returns distinct ids for separate component instances', async () => {
      const { useId } = await import('../use-id-compat');
      const a = renderHook(() => useId());
      const b = renderHook(() => useId());

      expect(a.result.current).not.toBe(b.result.current);
    });
  });

  describe('React 17 (native useId absent — shim path)', () => {
    it('falls back to the ref-based shim and produces a :r..: id', async () => {
      mockReactWithoutUseId();

      const { useId } = await import('../use-id-compat');
      const { result } = renderHook(() => useId());

      expect(result.current).toMatch(/^:r\d+:$/);
    });

    it('shim returns a stable id across re-renders', async () => {
      mockReactWithoutUseId();

      const { useId } = await import('../use-id-compat');
      const { result, rerender } = renderHook(() => useId());

      const first = result.current;
      rerender();
      expect(result.current).toBe(first);
    });

    it('shim returns distinct, incrementing ids for separate instances', async () => {
      mockReactWithoutUseId();

      const { useId } = await import('../use-id-compat');
      const a = renderHook(() => useId());
      const b = renderHook(() => useId());

      expect(a.result.current).toMatch(/^:r\d+:$/);
      expect(b.result.current).toMatch(/^:r\d+:$/);
      expect(a.result.current).not.toBe(b.result.current);
    });
  });
});
