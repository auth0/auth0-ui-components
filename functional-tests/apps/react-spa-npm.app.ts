import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readRunState } from '../lib/run-state';

import type { AppAdapter } from './types';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const organizationId = readRunState()?.orgId ?? '';

const PORT = 5173;
const webServerCommand = process.env.CI
  ? `pnpm exec vite build && pnpm exec vite preview --port ${PORT} --strictPort`
  : 'pnpm dev';

export const reactSpaNpmApp: AppAdapter = {
  name: 'react-spa-npm',
  baseURL: `http://localhost:${PORT}`,
  authMode: 'spa',
  routes: {
    organizationManagement: '/organization-management',
    memberManagement: '/member-management',
    memberDetail: (userId: string) => `/member-management/${userId}`,
    domainManagement: '/domain-management',
    ssoProviders: '/sso-providers',
    ssoProviderCreate: '/sso-provider/create',
    ssoProviderEdit: (providerId: string) => `/sso-provider/edit/${providerId}`,
  },
  webServer: {
    command: webServerCommand,
    cwd: path.resolve(dirname, '../../examples/react-spa-npm'),
    env: {
      VITE_AUTH0_DOMAIN: process.env.FT_AUTH0_DOMAIN ?? '',
      VITE_AUTH0_CLIENT_ID: process.env.FT_AUTH0_SPA_CLIENT_ID ?? '',
      VITE_AUTH0_ORGANIZATION: organizationId,
      // 0 makes data stale immediately so the Refresh button is always clickable
      VITE_QUERY_STALE_TIME_MS: '0',
    },
  },
};
