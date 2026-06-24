/**
 * TanStack Query v4/v5 compatibility utilities.
 * @module tanstack-compat
 * @internal
 */

import type { UseMutationResult } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';

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
 * Returns the correct query option for keeping previous data, compatible with both v4 and v5.
 * In v5, `keepPreviousData` boolean option was replaced by `placeholderData: keepPreviousData`.
 * @returns The appropriate option object to spread into a query config.
 */
export function getPreviousDataOption(): PreviousDataOption {
  if (typeof keepPreviousData === 'function') {
    return { placeholderData: keepPreviousData };
  }
  return { keepPreviousData: true };
}
