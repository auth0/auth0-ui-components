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
 *   6. Step-up MFA tenant config                      — OTP factor, MFA-in-Actions setting, and the step-up Action
 *                                                       bound to post-login. Each piece is read first and only written
 *                                                       when missing or different, so an already set-up tenant costs
 *                                                       a few GETs. Never removed: the Action only challenges users the
 *                                                       step-up spec flags, so leaving it bound can't affect other specs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { env } from '../env';
import {
  addMembers,
  appendPostLoginBinding,
  assignMemberRoles,
  createOrganization,
  createPostLoginAction,
  deleteOrganization,
  deployAction,
  enableConnection,
  enableCustomizeMfaInActions,
  enableGuardianFactor,
  findConnectionIdByName,
  findPostLoginAction,
  findRoleIdByName,
  findUserIdByEmail,
  getClientRefreshTokenPolicy,
  getCustomizeMfaInActions,
  listGuardianFactors,
  listPostLoginBindings,
  setClientRefreshTokenLeeway,
  updateActionCode,
} from '../lib/management-api';
import { clearRunState, readRunState, writeRunState } from '../lib/run-state';

const dirname = path.dirname(fileURLToPath(import.meta.url));

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

const REFRESH_TOKEN_LEEWAY_SECONDS = 300;

async function ensureRefreshTokenLeeway(): Promise<void> {
  const clientId = env.FT_AUTH0_SPA_CLIENT_ID;

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

const STEP_UP_ACTION_NAME = 'ft-step-up-mfa';
const stepUpActionPath = path.resolve(dirname, '../tenant/step-up-action.js');

async function ensureStepUpTenantConfig(): Promise<void> {
  const changes: string[] = [];

  try {
    const [factors, settings] = await Promise.all([
      listGuardianFactors(),
      getCustomizeMfaInActions(),
    ]);
    if (!factors.some((factor) => factor.name === 'otp' && factor.enabled)) {
      await enableGuardianFactor('otp');
      changes.push('enabled the OTP factor');
    }
    if (settings.customize_mfa_in_postlogin_action !== true) {
      await enableCustomizeMfaInActions();
      changes.push('enabled MFA customization in Actions');
    }

    const code = fs.readFileSync(stepUpActionPath, 'utf8');
    let action = await findPostLoginAction(STEP_UP_ACTION_NAME);
    if (!action) {
      action = await createPostLoginAction(STEP_UP_ACTION_NAME, code);
      changes.push('created the step-up Action');
    } else if (action.code !== code) {
      action = await updateActionCode(action.id, code);
      changes.push('updated the step-up Action code');
    }
    if (!action.all_changes_deployed) {
      await deployAction(action.id);
      changes.push('deployed the step-up Action');
    }

    const bindings = await listPostLoginBindings();
    if (!bindings.some((binding) => binding.action?.name === STEP_UP_ACTION_NAME)) {
      await appendPostLoginBinding(STEP_UP_ACTION_NAME);
      changes.push('bound the step-up Action to post-login');
    }

    console.log(
      changes.length > 0
        ? `· step-up: ${changes.join(', ')}`
        : '· step-up tenant config already in place',
    );
  } catch (error) {
    console.warn(
      `· warning: step-up tenant config incomplete${changes.length > 0 ? ` (done: ${changes.join(', ')})` : ''}; ` +
        `specs/step-up.spec.ts will fail: ${String(error)}`,
    );
  }
}

async function main(): Promise<void> {
  const connectionName = process.env.FT_CONNECTION_NAME || DEFAULT_CONNECTION_NAME;
  const adminRoleName = process.env.FT_ADMIN_ROLE_NAME || DEFAULT_ADMIN_ROLE_NAME;
  const userEmail = env.FT_TEST_USER_EMAIL;

  await discardStaleOrganization();

  const [connectionId, adminRoleId, userId] = await Promise.all([
    findConnectionIdByName(connectionName),
    findRoleIdByName(adminRoleName),
    findUserIdByEmail(userEmail),
  ]);
  if (!userId) throw new Error(`No user found with email ${userEmail}`);

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
  await ensureStepUpTenantConfig();

  console.log(`✔ ephemeral organization ${orgName} (${organization.id})`);
  console.log(`  admin: ${userEmail} · connection: ${connectionName} · role: ${adminRoleName}`);
}

await main();
