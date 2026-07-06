/**
 * Domain query keys for TanStack Query cache management.
 * @module domain-query-keys
 */
export const domainQueryKeys = {
  all: ['domains'] as const,
  lists: () => [...domainQueryKeys.all, 'list'] as const,
  list: (params?: { pageSize?: number; fromToken?: string }) =>
    [...domainQueryKeys.lists(), params ?? {}] as const,
  providers: (domainId: string) => [...domainQueryKeys.all, 'providers', domainId] as const,
};

export const ssoDomainQueryKeys = {
  all: ['sso-domains'] as const,
  lists: () => [...ssoDomainQueryKeys.all, 'list'] as const,
  list: (idpId: string) => [...ssoDomainQueryKeys.lists(), idpId] as const,
};
