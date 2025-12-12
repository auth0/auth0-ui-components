import { vi } from 'vitest';

import type { initializeMyOrgClient } from '../my-org-api-service';

/**
 * Creates a mock MyOrg API client
 */
export const createMockMyOrgClient = (): ReturnType<typeof initializeMyOrgClient> => {
  return {
    client: {} as any,
    setLatestScopes: vi.fn(),
  };
};
