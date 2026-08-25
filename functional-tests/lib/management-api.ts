/**
 * Management API client for test setup, teardown, and independent verification.
 * Uses M2M credentials (not the end-user session) so reads here confirm what the component actually persisted.
 */

const API_VERSION_PATH = 'api/v2';

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | undefined;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set — see functional-tests/.env.example`);
  }
  return value;
}

function domain(): string {
  return requireEnv('FT_AUTH0_DOMAIN');
}

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
    return tokenCache.accessToken;
  }

  const MAX_TOKEN_RETRIES = 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_TOKEN_RETRIES; attempt += 1) {
    try {
      const response = await fetch(`https://${domain()}/oauth/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: requireEnv('FT_AUTH0_MGMT_CLIENT_ID'),
          client_secret: requireEnv('FT_AUTH0_MGMT_CLIENT_SECRET'),
          audience: `https://${domain()}/${API_VERSION_PATH}/`,
        }),
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        throw new Error(
          `Management API token request failed: ${response.status} ${await response.text()}`,
        );
      }

      const body = (await response.json()) as { access_token: string; expires_in: number };
      tokenCache = {
        accessToken: body.access_token,
        expiresAt: Date.now() + body.expires_in * 1000,
      };

      return tokenCache.accessToken;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_TOKEN_RETRIES - 1) await sleep(2 ** attempt * 500);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_RATE_LIMIT_RETRIES = 4;
const MAX_SERVER_ERROR_RETRIES = 2;

// Returns ms to wait before retrying, or null to give up. 5xx is retried because occasional server
// errors on setup calls (seen on POST /users) should not fail a spec; createOrRecover() absorbs the
// 409 that a retried create then lands on.
function retryWaitMs(response: Response, attempt: number): number | null {
  if (response.status === 429) {
    if (attempt >= MAX_RATE_LIMIT_RETRIES) return null;
    const retryAfterSeconds = Number(response.headers.get('retry-after'));
    return Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
      ? retryAfterSeconds * 1000
      : 2 ** attempt * 500;
  }

  if (response.status >= 500 && attempt < MAX_SERVER_ERROR_RETRIES) {
    return 2 ** attempt * 500;
  }

  return null;
}

async function mgmt<T>(method: string, path: string, body?: unknown): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    const token = await getAccessToken();

    let response: Response;
    try {
      response = await fetch(`https://${domain()}/${API_VERSION_PATH}/${path}`, {
        method,
        headers: {
          authorization: `Bearer ${token}`,
          ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      if (attempt < MAX_SERVER_ERROR_RETRIES) {
        await sleep(2 ** attempt * 500);
        continue;
      }
      throw error;
    }

    const waitMs = retryWaitMs(response, attempt);
    if (waitMs !== null) {
      await sleep(waitMs);
      continue;
    }

    if (!response.ok) {
      throw new Error(
        `Management API ${method} ${path} failed: ${response.status} ${await response.text()}`,
      );
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}

/**
 * Polls until a Management API read reflects a prior write.
 *
 * Auth0 is eventually consistent — reading immediately after a write can miss it,
 * making a spec fail for a reason unrelated to the code under test.
 *
 * @param description - Included in the timeout error message.
 * @param read - Performs the read.
 * @param isReady - Returns true once the read reflects the write.
 * @returns The first value for which `isReady` returned true.
 */
export async function waitForPropagation<T>(
  description: string,
  read: () => Promise<T>,
  isReady: (value: T) => boolean,
): Promise<T> {
  const deadline = Date.now() + 15_000;
  let last: T | undefined;

  for (;;) {
    last = await read().catch(() => undefined as T | undefined);
    if (last !== undefined && isReady(last)) return last;
    if (Date.now() >= deadline) {
      throw new Error(
        `Timed out after 15000ms waiting for ${description}. ` +
          `Last read: ${JSON.stringify(last)}`,
      );
    }
    await sleep(500);
  }
}

// Absorbs a 409 on `create` by reading the resource back via `recover`. Safe because every caller
// uses a unique name/email — a 409 can only mean an earlier timed-out attempt of this call won.
async function createOrRecover<T>(create: () => Promise<T>, recover: () => Promise<T>): Promise<T> {
  try {
    return await create();
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes(' failed: 409 ')) throw error;
    return recover();
  }
}

export interface OrganizationBranding {
  logo_url?: string;
  colors?: { primary?: string; page_background?: string };
}

export interface Organization {
  id: string;
  name: string;
  display_name?: string;
  branding?: OrganizationBranding;
}

export interface CreateOrganizationInput {
  name: string;
  display_name: string;
  branding?: OrganizationBranding;
}

export function createOrganization(input: CreateOrganizationInput): Promise<Organization> {
  return mgmt<Organization>('POST', 'organizations', input);
}

export function getOrganization(organizationId: string): Promise<Organization> {
  return mgmt<Organization>('GET', `organizations/${organizationId}`);
}

export function deleteOrganization(organizationId: string): Promise<void> {
  return mgmt<void>('DELETE', `organizations/${organizationId}`);
}

export function enableConnection(organizationId: string, connectionId: string): Promise<void> {
  return mgmt<void>('POST', `organizations/${organizationId}/enabled_connections`, {
    connection_id: connectionId,
    assign_membership_on_login: false,
    is_signup_enabled: false,
  });
}

export interface SsoProvider {
  id: string;
  name: string;
  display_name?: string;
  strategy: string;
  options?: Record<string, unknown>;
  enabled_clients?: string[];
}

export function getConnection(connectionId: string): Promise<SsoProvider> {
  return mgmt<SsoProvider>('GET', `connections/${encodeURIComponent(connectionId)}`);
}

export function deleteSsoProvider(connectionId: string): Promise<void> {
  return mgmt<void>('DELETE', `connections/${encodeURIComponent(connectionId)}`);
}

export function listOrgEnabledConnections(
  organizationId: string,
): Promise<Array<{ connection_id: string; connection: { name: string; strategy: string } }>> {
  return mgmt('GET', `organizations/${organizationId}/enabled_connections`);
}

// identityProviders.create() stores the connection as `con-org-{orgId}-{name}` —
// match by suffix so specs can look up by the name typed in the wizard.
export async function findSsoConnectionIdByProviderName(providerName: string): Promise<string> {
  let match: { id: string; name: string } | undefined;

  await waitForPropagation(
    `SSO connection ending in "${providerName}" to appear on tenant ${domain()}`,
    async () => {
      const connections = await mgmt<Array<{ id: string; name: string }>>(
        'GET',
        'connections?per_page=100',
      );
      match = connections.find((connection) => connection.name.endsWith(`-${providerName}`));
      return match !== undefined;
    },
    (found) => found,
  );

  if (!match) {
    throw new Error(`SSO connection ending in "${providerName}" not found on tenant ${domain()}`);
  }
  return match.id;
}

export interface ClientRefreshTokenPolicy {
  rotation_type?: string;
  leeway?: number;
  [key: string]: unknown;
}

// Requires `read:clients` on the M2M app; used by the setup preflight only.
export async function getClientRefreshTokenPolicy(
  clientId: string,
): Promise<ClientRefreshTokenPolicy | undefined> {
  const client = await mgmt<{ refresh_token?: ClientRefreshTokenPolicy }>(
    'GET',
    `clients/${encodeURIComponent(clientId)}?fields=refresh_token`,
  );
  return client.refresh_token;
}

/**
 * Sets a client's refresh-token rotation leeway, preserving every other field.
 *
 * Requires `update:clients`. The full policy must be passed in (read it with
 * `getClientRefreshTokenPolicy`) because this endpoint replaces the whole `refresh_token`
 * object — patching `{ leeway }` alone is rejected, and patching without `policies` would
 * wipe the MRRT scope policies the components depend on.
 *
 * @param clientId - Client to update.
 * @param policy - The client's current refresh-token policy, read immediately before.
 * @param leewaySeconds - Grace period during which the previous refresh token stays valid.
 */
export function setClientRefreshTokenLeeway(
  clientId: string,
  policy: ClientRefreshTokenPolicy,
  leewaySeconds: number,
): Promise<void> {
  return mgmt<void>('PATCH', `clients/${encodeURIComponent(clientId)}`, {
    refresh_token: { ...policy, leeway: leewaySeconds },
  });
}

export function addMembers(organizationId: string, userIds: string[]): Promise<void> {
  return mgmt<void>('POST', `organizations/${organizationId}/members`, { members: userIds });
}

export function assignMemberRoles(
  organizationId: string,
  userId: string,
  roleIds: string[],
): Promise<void> {
  return mgmt<void>(
    'POST',
    `organizations/${organizationId}/members/${encodeURIComponent(userId)}/roles`,
    { roles: roleIds },
  );
}

export async function findConnectionIdByName(name: string): Promise<string> {
  const connections = await mgmt<Array<{ id: string; name: string }>>(
    'GET',
    'connections?per_page=100',
  );
  const match = connections.find((connection) => connection.name === name);
  if (!match) {
    throw new Error(`Connection "${name}" not found on tenant ${domain()}`);
  }
  return match.id;
}

export async function findRoleIdByName(name: string): Promise<string> {
  const roles = await mgmt<Array<{ id: string; name: string }>>(
    'GET',
    `roles?name_filter=${encodeURIComponent(name)}&per_page=100`,
  );
  const match = roles.find((role) => role.name === name);
  if (!match) {
    throw new Error(`Role "${name}" not found on tenant ${domain()}`);
  }
  return match.id;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export function createRole(input: { name: string; description?: string }): Promise<Role> {
  return createOrRecover(
    () => mgmt<Role>('POST', 'roles', input),
    async () => ({
      id: await waitForPropagation(
        `the role "${input.name}" created by a retried POST /roles to be readable`,
        () => findRoleIdByName(input.name),
        Boolean,
      ),
      name: input.name,
      description: input.description,
    }),
  );
}

export function deleteRole(roleId: string): Promise<void> {
  return mgmt<void>('DELETE', `roles/${encodeURIComponent(roleId)}`);
}

export async function findUserIdByEmail(email: string): Promise<string> {
  const users = await mgmt<Array<{ user_id: string; email: string }>>(
    'GET',
    `users-by-email?email=${encodeURIComponent(email)}`,
  );
  const match = users[0];
  if (!match) {
    throw new Error(`No user found with email ${email} on tenant ${domain()}`);
  }
  return match.user_id;
}

/** Used by the orphan sweeper to find `ci-*` leftover organizations. */
export function listOrganizations(): Promise<Organization[]> {
  return mgmt<Organization[]>('GET', 'organizations?per_page=100');
}

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  connectionName: string;
}

export interface User {
  user_id: string;
  email: string;
  name?: string;
}

export function createUser(input: CreateUserInput): Promise<User> {
  return createOrRecover(
    () =>
      mgmt<User>('POST', 'users', {
        email: input.email,
        password: input.password,
        name: input.name,
        connection: input.connectionName,
        email_verified: true,
      }),
    async () => ({
      user_id: await waitForPropagation(
        `the user for ${input.email} created by a retried POST /users to be readable`,
        () => findUserIdByEmail(input.email),
        Boolean,
      ),
      email: input.email,
      name: input.name,
    }),
  );
}

export function deleteUser(userId: string): Promise<void> {
  return mgmt<void>('DELETE', `users/${encodeURIComponent(userId)}`);
}

export interface OrgMember {
  user_id: string;
  email?: string;
  name?: string;
  roles?: Array<{ id: string; name: string }>;
}

export function listOrgMembers(organizationId: string): Promise<OrgMember[]> {
  return mgmt<OrgMember[]>(
    'GET',
    `organizations/${organizationId}/members?fields=user_id,email,name,roles`,
  );
}

export function listOrgMemberRoles(
  organizationId: string,
  userId: string,
): Promise<Array<{ id: string; name: string }>> {
  return mgmt<Array<{ id: string; name: string }>>(
    'GET',
    `organizations/${organizationId}/members/${encodeURIComponent(userId)}/roles`,
  );
}

export async function waitForOrgMember(organizationId: string, userId: string): Promise<void> {
  await waitForPropagation(
    `user ${userId} to appear as a member of ${organizationId}`,
    () => listOrgMembers(organizationId),
    (members) => members.some((member) => member.user_id === userId),
  );
}

export async function waitForMemberRole(
  organizationId: string,
  userId: string,
  roleId: string,
): Promise<void> {
  await waitForPropagation(
    `role ${roleId} to be assigned to ${userId} in ${organizationId}`,
    () => listOrgMemberRoles(organizationId, userId),
    (roles) => roles.some((role) => role.id === roleId),
  );
}

// Removes from org membership — does not delete the user account.
export function removeMember(organizationId: string, userId: string): Promise<void> {
  return mgmt<void>('DELETE', `organizations/${organizationId}/members`, { members: [userId] });
}

export interface Invitation {
  id: string;
  invitee: { email: string };
  invitation_url?: string;
  roles?: string[];
}

export function createInvitation(
  organizationId: string,
  input: { email: string; inviterName: string; clientId: string; roles?: string[] },
): Promise<Invitation> {
  return mgmt<Invitation>('POST', `organizations/${organizationId}/invitations`, {
    inviter: { name: input.inviterName },
    invitee: { email: input.email },
    client_id: input.clientId,
    ...(input.roles ? { roles: input.roles } : {}),
  });
}

export function listOrgInvitations(organizationId: string): Promise<Invitation[]> {
  return mgmt<Invitation[]>('GET', `organizations/${organizationId}/invitations`);
}

export async function waitForOrgInvitation(organizationId: string, email: string): Promise<void> {
  await waitForPropagation(
    `an invitation for ${email} to be listed on ${organizationId}`,
    () => listOrgInvitations(organizationId),
    (invitations) => invitations.some((invitation) => invitation.invitee.email === email),
  );
}

export function deleteInvitation(organizationId: string, invitationId: string): Promise<void> {
  return mgmt<void>(
    'DELETE',
    `organizations/${organizationId}/invitations/${encodeURIComponent(invitationId)}`,
  );
}
