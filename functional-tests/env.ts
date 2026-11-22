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

const missing = REQUIRED_VARS.filter((name) => !process.env[name]);
if (missing.length > 0) {
  throw new Error(
    `Missing environment variables: ${missing.join(', ')}. See functional-tests/.env.example`,
  );
}

export const env = process.env as Record<(typeof REQUIRED_VARS)[number], string>;
