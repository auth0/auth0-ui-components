/**
 * Domain query keys for TanStack Query cache management.
 * @module domain-query-keys
 */
export const domainQueryKeys = {
  all: ['domains'] as const,
  list: () => [...domainQueryKeys.all, 'list'] as const,
  providers: (domainId: string) => [...domainQueryKeys.all, 'providers', domainId] as const,
};

export const ssoDomainQueryKeys = {
  all: ['sso-domains'] as const,
  lists: () => [...ssoDomainQueryKeys.all, 'list'] as const,
  list: (idpId: string) => [...ssoDomainQueryKeys.lists(), idpId] as const,
};
