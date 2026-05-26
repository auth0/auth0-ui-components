/**
 * TanStack Query v4/v5 compatibility utilities.
 * @module tanstack-compat
 * @internal
 */

import type { UseMutationResult } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';

type MutationV4Compat = { isLoading?: boolean };

/**
 * Returns whether a mutation is in a pending/loading state, compatible with both v4 and v5.
 * In v5, `isPending` replaces `isLoading` on mutations.
 * @param mutation - The mutation result object.
 * @returns `true` if the mutation is pending or loading.
 */
export function isMutationPending<
  T extends Pick<UseMutationResult, 'isPending'> & MutationV4Compat,
>(mutation: T): boolean {
  return mutation.isPending ?? mutation.isLoading ?? false;
}

type KeepPreviousDataOptionV5 = { placeholderData: typeof keepPreviousData };
type KeepPreviousDataOptionV4 = { keepPreviousData: true };
type KeepPreviousDataOption = KeepPreviousDataOptionV5 | KeepPreviousDataOptionV4;

/**
 * Returns the correct query option for keeping previous data, compatible with both v4 and v5.
 * In v5, `keepPreviousData` boolean option was replaced by `placeholderData: keepPreviousData`.
 * @returns The appropriate option object to spread into a query config.
 */
export function getKeepPreviousDataOption(): KeepPreviousDataOption {
  if (typeof keepPreviousData === 'function') {
    return { placeholderData: keepPreviousData };
  }
  return { keepPreviousData: true };
}
