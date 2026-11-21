import type * as ReactQueryModule from '@tanstack/react-query';
import { describe, it, expect, vi, afterEach } from 'vitest';

/**
 * `tanstack-compat` selects its `keepPreviousData` implementation at call time by
 * reading the export off the `@tanstack/react-query` namespace: v5 exposes a
 * `keepPreviousData` function, v4 does not. These tests reset the module registry
 * and dynamically import the module so each case evaluates it fresh against a
 * controlled `@tanstack/react-query` mock.
 */
describe('tanstack-compat', () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock('@tanstack/react-query');
  });

  /**
   * Re-exports real TanStack Query with `keepPreviousData` forced to undefined to
   * simulate v4, which never shipped that export. Vitest's mocked module throws on
   * access to an omitted export, so the absent function must be modeled as an
   * explicit `undefined` rather than removed.
   */
  function mockReactQueryWithoutKeepPreviousData(): void {
    vi.resetModules();
    vi.doMock('@tanstack/react-query', async () => {
      const actual = await vi.importActual<typeof ReactQueryModule>('@tanstack/react-query');
      return { ...actual, keepPreviousData: undefined };
    });
  }

  describe('getPreviousDataOption', () => {
    it('returns placeholderData with the native keepPreviousData on v5', async () => {
      const reactQuery = await import('@tanstack/react-query');
      const { getPreviousDataOption } = await import('../tanstack-compat');

      expect(getPreviousDataOption()).toEqual({ placeholderData: reactQuery.keepPreviousData });
    });

    it('falls back to the legacy keepPreviousData boolean on v4', async () => {
      mockReactQueryWithoutKeepPreviousData();

      const { getPreviousDataOption } = await import('../tanstack-compat');

      expect(getPreviousDataOption()).toEqual({ keepPreviousData: true });
    });
  });

  describe('isMutationLoading', () => {
    it('returns the isPending value when present', async () => {
      const { isMutationLoading } = await import('../tanstack-compat');

      expect(isMutationLoading({ isPending: true })).toBe(true);
      expect(isMutationLoading({ isPending: false, isLoading: true })).toBe(false);
    });

    it('falls back to isLoading when isPending is undefined (v4)', async () => {
      const { isMutationLoading } = await import('../tanstack-compat');

      expect(isMutationLoading({ isPending: undefined as never, isLoading: true })).toBe(true);
      expect(isMutationLoading({ isPending: undefined as never, isLoading: false })).toBe(false);
    });

    it('defaults to false when neither flag is set', async () => {
      const { isMutationLoading } = await import('../tanstack-compat');

      expect(isMutationLoading({ isPending: undefined as never })).toBe(false);
    });
  });
});
