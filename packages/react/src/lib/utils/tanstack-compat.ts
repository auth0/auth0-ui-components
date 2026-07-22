/**
 * TanStack Query v4/v5 compatibility utilities.
 * @module tanstack-compat
 * @internal
 */

import type { UseMutationResult, keepPreviousData } from '@tanstack/react-query';
import * as ReactQuery from '@tanstack/react-query';

/**
 * Returns whether a mutation is in a pending/loading state, compatible with both v4 and v5.
 * In v5, `isPending` replaces `isLoading` on mutations.
 * @param mutation - The mutation result object.
 * @returns `true` if the mutation is pending or loading.
 */
export function isMutationLoading<
  T extends Pick<UseMutationResult, 'isPending'> & { isLoading?: boolean },
>(mutation: T): boolean {
  return mutation.isPending ?? mutation.isLoading ?? false;
}

type PlaceholderDataOption = { placeholderData: typeof keepPreviousData };
type LegacyKeepPreviousOption = { keepPreviousData: true };
type PreviousDataOption = PlaceholderDataOption | LegacyKeepPreviousOption;

/**
 * Reads `keepPreviousData` off the TanStack Query namespace, or returns undefined on v4.
 * @returns v5's native keepPreviousData, otherwise undefined.
 */
function getNativeKeepPreviousData(): typeof keepPreviousData | undefined {
  const key = ['keep', 'Previous', 'Data'].join('');
  return (ReactQuery as Record<string, unknown>)[key] as typeof keepPreviousData | undefined;
}

/**
 * Returns the correct query option for keeping previous data, compatible with both v4 and v5.
 * In v5, `keepPreviousData` boolean option was replaced by `placeholderData: keepPreviousData`.
 * @returns The appropriate option object to spread into a query config.
 */
export function getPreviousDataOption(): PreviousDataOption {
  const keepPreviousData = getNativeKeepPreviousData();
  if (typeof keepPreviousData === 'function') {
    return { placeholderData: keepPreviousData };
  }
  return { keepPreviousData: true };
}
