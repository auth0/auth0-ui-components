/**
 * Passkey constants.
 * @module passkey-constants
 * @internal
 */

export const passkeyQueryKeys = {
  all: ['passkeys'] as const,
  list: () => [...passkeyQueryKeys.all, 'list'] as const,
};
