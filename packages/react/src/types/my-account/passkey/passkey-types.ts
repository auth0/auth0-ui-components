/**
 * Passkey management types.
 * @module passkey-types
 */

import type { UpdatePasskeyResponse } from '@auth0/universal-components-core';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

export interface Passkey {
  id: string;
  name?: string;
  createdAt?: string;
}

export interface UseUserPasskeyServiceResult {
  passkeysQuery: UseQueryResult<Passkey[]>;
  enrollMutation: UseMutationResult<void, Error, void>;
  revokeMutation: UseMutationResult<void, Error, string>;
  renameMutation: UseMutationResult<UpdatePasskeyResponse, Error, { id: string; name: string }>;
}
