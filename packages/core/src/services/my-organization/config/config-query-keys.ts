/**
 * Config query keys for TanStack Query cache management.
 * @module config-query-keys
 */
export const configQueryKeys = {
  all: ['config'] as const,
  details: () => [...configQueryKeys.all, 'details'] as const,
};

export const idpConfigQueryKeys = {
  all: ['idp-config'] as const,
  config: () => [...idpConfigQueryKeys.all, 'config'] as const,
};
