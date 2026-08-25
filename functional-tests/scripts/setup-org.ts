/**
 * Creates the run's ephemeral organization and makes the CI user an admin of it.
 *
 * Runs **before** Playwright (and therefore before the example app's dev server)
 * because `VITE_AUTH0_ORGANIZATION` is baked in at server start.
 *
 * Chain (each step is required; a fresh org alone is useless, because the
 * components edit whichever org the *session* is scoped to):
 *   1. POST   /organizations                          — with branding colors required by the edit form schema
 *   2. POST   /organizations/{id}/enabled_connections — so the CI user can log in to it
 *   3. POST   /organizations/{id}/members             — add the CI user
 *   4. POST   /organizations/{id}/members/{uid}/roles — grant admin, or the token carries no `my_org` scopes
 *   5. PATCH  client refresh-token leeway             — overlapping exchanges (parallel mounts) die with
 *                                                       "invalid refresh token" without it; left in place by teardown
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadEnv } from 'dotenv';

import {
  addMembers,
  assignMemberRoles,
  createOrganization,
  deleteOrganization,
  enableConnection,
  findConnectionIdByName,
  findRoleIdByName,
  findUserIdByEmail,
  getClientRefreshTokenPolicy,
  setClientRefreshTokenLeeway,
} from '../lib/management-api';
import { clearRunState, readRunState, writeRunState } from '../lib/run-state';

const dirname = path.dirname(fileURLToPath(import.meta.url));

loadEnv({ path: path.resolve(dirname, '../.env') });

const DEFAULT_CONNECTION_NAME = 'Universal-Components-Demo';
const DEFAULT_ADMIN_ROLE_NAME = 'admin';

function generateOrgName(): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `ci-org-${Date.now()}-${suffix}`;
}

async function discardStaleOrganization(): Promise<void> {
  const stale = readRunState();
  if (!stale) return;

  await deleteOrganization(stale.orgId).catch(() => undefined);
  clearRunState();
  console.log(`· discarded stale organization ${stale.orgName} (${stale.orgId})`);
}

const REFRESH_TOKEN_LEEWAY_SECONDS = 120;

async function ensureRefreshTokenLeeway(): Promise<void> {
  const clientId = process.env.FT_AUTH0_SPA_CLIENT_ID;
  if (!clientId) return;

  try {
    const policy = await getClientRefreshTokenPolicy(clientId);
    if (policy?.rotation_type !== 'rotating') return;

    const current = policy.leeway ?? 0;
    if (current >= REFRESH_TOKEN_LEEWAY_SECONDS) {
      console.log(`· refresh-token rotation leeway already ${current}s`);
      return;
    }

    // Must send the whole policy — partial update wipes the MRRT `policies` the components depend on.
    await setClientRefreshTokenLeeway(clientId, policy, REFRESH_TOKEN_LEEWAY_SECONDS);
    console.log(
      `· refresh-token rotation leeway ${current}s → ${REFRESH_TOKEN_LEEWAY_SECONDS}s on client ${clientId}`,
    );
  } catch (error) {
    console.warn(
      `· warning: could not set refresh-token leeway (needs read:clients + update:clients): ${String(error)}`,
    );
  }
}

async function main(): Promise<void> {
  const connectionName = process.env.FT_CONNECTION_NAME ?? DEFAULT_CONNECTION_NAME;
  const adminRoleName = process.env.FT_ADMIN_ROLE_NAME ?? DEFAULT_ADMIN_ROLE_NAME;
  const userEmail = process.env.FT_TEST_USER_EMAIL;

  if (!userEmail) {
    throw new Error('FT_TEST_USER_EMAIL is not set — see functional-tests/.env.example');
  }

  await discardStaleOrganization();

  const [connectionId, adminRoleId, userId] = await Promise.all([
    findConnectionIdByName(connectionName),
    findRoleIdByName(adminRoleName),
    findUserIdByEmail(userEmail),
  ]);

  const orgName = generateOrgName();
  const organization = await createOrganization({
    name: orgName,
    display_name: `FT ${orgName}`,
    branding: {
      logo_url: 'https://cdn.auth0.com/website/bob/press/logo-light.png',
      colors: { primary: '#635dff', page_background: '#f4f4f8' },
    },
  });

  try {
    await enableConnection(organization.id, connectionId);
    await addMembers(organization.id, [userId]);
    await assignMemberRoles(organization.id, userId, [adminRoleId]);
  } catch (error) {
    await deleteOrganization(organization.id).catch(() => undefined);
    throw error;
  }

  writeRunState({ orgId: organization.id, orgName });

  fs.rmSync(path.resolve(dirname, '../.auth'), { recursive: true, force: true });

  await ensureRefreshTokenLeeway();

  console.log(`✔ ephemeral organization ${orgName} (${organization.id})`);
  console.log(`  admin: ${userEmail} · connection: ${connectionName} · role: ${adminRoleName}`);
}

await main();
