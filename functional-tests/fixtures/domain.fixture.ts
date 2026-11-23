import {
  createDiscoveryDomain,
  deleteDiscoveryDomain,
  type DiscoveryDomain,
} from '../lib/management-api';
import { requireRunState } from '../lib/run-state';

import { test as authTest } from './auth.fixture';

export function uniqueDomain(label: string): string {
  return `ft-${label}-${Date.now()}.com`;
}

interface SeededDomains {
  pendingDomain: DiscoveryDomain;
  verifiedDomain: DiscoveryDomain;
}

async function seed(
  label: string,
  status: DiscoveryDomain['status'],
  provide: (domain: DiscoveryDomain) => Promise<void>,
): Promise<void> {
  const { orgId } = requireRunState();
  const domain = await createDiscoveryDomain(orgId, uniqueDomain(label), status);
  try {
    await provide(domain);
  } finally {
    await deleteDiscoveryDomain(orgId, domain.id);
  }
}

export const test = authTest.extend<SeededDomains>({
  // eslint-disable-next-line no-empty-pattern
  pendingDomain: ({}, use) => seed('pending', 'pending', use),
  // eslint-disable-next-line no-empty-pattern
  verifiedDomain: ({}, use) => seed('verified', 'verified', use),
});

export { expect } from './auth.fixture';
