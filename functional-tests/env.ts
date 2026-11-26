import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadEnv } from 'dotenv';

// Must be the first import in every entry point (playwright.config.ts, scripts/*) — ESM evaluates
// imports in declaration order, so this populates process.env before any other module reads it.
loadEnv({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env') });

const REQUIRED_VARS = [
  'FT_AUTH0_DOMAIN',
  'FT_AUTH0_SPA_CLIENT_ID',
  'FT_AUTH0_MGMT_CLIENT_ID',
  'FT_AUTH0_MGMT_CLIENT_SECRET',
  'FT_TEST_USER_EMAIL',
  'FT_TEST_USER_PASSWORD',
  'FT_OKTA_DOMAIN',
  'FT_OKTA_CLIENT_ID',
  'FT_OKTA_CLIENT_SECRET',
  'FT_OKTA_SSO_USER_EMAIL',
  'FT_OKTA_SSO_USER_PASSWORD',
] as const;

/**
 * Required vars, checked when read rather than at import, so a standalone script (the cleanup job)
 * only needs the vars it uses. Read required vars through this, never `process.env`; optional vars
 * and flags (`FT_CONNECTION_NAME`, `CI`, …) use `process.env`.
 */
export const env = {} as Record<(typeof REQUIRED_VARS)[number], string>;

for (const name of REQUIRED_VARS) {
  Object.defineProperty(env, name, {
    enumerable: true,
    get() {
      const value = process.env[name];
      if (!value) {
        throw new Error(`Missing environment variable ${name}. See functional-tests/.env.example`);
      }
      return value;
    },
  });
}

// Called by setup-org.ts so a test run with any secret missing fails before it starts.
export function requireAllEnv(): void {
  const missing = REQUIRED_VARS.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Missing environment variables: ${missing.join(', ')}. See functional-tests/.env.example`,
    );
  }
}
