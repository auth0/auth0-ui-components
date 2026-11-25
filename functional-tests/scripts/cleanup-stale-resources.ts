/**
 * Deletes functional-test resources that teardown or a spec's afterAll failed to remove:
 * `ci-org-*` orgs, their `con-org-*` connections, `ft-*` users and roles, and the JIT Okta SSO user.
 * Only touches resources older than 24h, so a live CI or local run is never affected.
 *
 * Usage: pnpm run cleanup:stale [--dry-run]
 */
import fs from 'node:fs';

import { env } from '../env';
import {
  deleteOrganization,
  deleteRole,
  deleteSsoProvider,
  deleteUser,
  listConnections,
  listOrganizations,
  listRolesByPrefix,
  listUsersByEmail,
  listUsersOnConnection,
  ManagementApiError,
  organizationExists,
} from '../lib/management-api';

const MAX_AGE_MS = 24 * 60 * 60 * 1000;
// Bounds the damage of a bad match. Lists are read one page of 100 for the same reason;
// anything beyond waits for the next weekly run.
const MAX_DELETIONS_PER_TYPE = 100;
const CONNECTION_NAME = process.env.FT_CONNECTION_NAME || 'Universal-Components-Demo';
const STEP_SUMMARY_FILE = process.env.GITHUB_STEP_SUMMARY;

// Must match the names built in setup-org.ts and the specs; anything else is skipped silently.
const ORG_NAME = /^ci-org-(\d{13})-[a-z0-9]{1,6}$/;
const USER_EMAIL = /^ft-[a-z0-9-]+-(\d{13})@example\.com$/;
const ROLE_NAME = /^ft-role-(\d{13})$/;
const CONNECTION_ORG_ID = /^con-org-(org_[A-Za-z0-9]+)-/;

const dryRun = process.argv.includes('--dry-run');
const cutoff = Date.now() - MAX_AGE_MS;

interface Candidate {
  label: string;
  remove: () => Promise<void>;
}

interface SweepResult {
  type: string;
  found: number;
  deleted: number;
  failed: number;
}

function isStale(name: string, pattern: RegExp): boolean {
  const match = pattern.exec(name);
  return match !== null && Number(match[1]) < cutoff;
}

// A failed listing counts as one failure for that type, so the other types still get cleaned.
async function sweep(type: string, find: () => Promise<Candidate[]>): Promise<SweepResult> {
  let candidates: Candidate[];
  try {
    candidates = await find();
  } catch (error) {
    console.warn(`· failed to list ${type}s: ${String(error)}`);
    return { type, found: 0, deleted: 0, failed: 1 };
  }

  const batch = candidates.slice(0, MAX_DELETIONS_PER_TYPE);
  let deleted = 0;
  let failed = 0;

  for (const candidate of batch) {
    if (dryRun) {
      console.log(`· would delete ${type} ${candidate.label}`);
      continue;
    }
    try {
      await candidate.remove();
      deleted += 1;
      console.log(`· deleted ${type} ${candidate.label}`);
    } catch (error) {
      if (error instanceof ManagementApiError && error.status === 404) {
        deleted += 1;
        continue;
      }
      failed += 1;
      console.warn(`· failed to delete ${type} ${candidate.label}: ${String(error)}`);
    }
  }

  if (candidates.length > batch.length) {
    console.log(`· ${candidates.length - batch.length} more ${type}(s) left for the next run`);
  }

  return { type, found: candidates.length, deleted, failed };
}

function writeSummary(results: SweepResult[]): void {
  if (!STEP_SUMMARY_FILE) return;

  const lines = [
    `## Leaked functional-test resources${dryRun ? ' (dry run)' : ''}`,
    '',
    '| Type | Found | Deleted | Failed |',
    '| --- | --- | --- | --- |',
    ...results.map((r) => `| ${r.type} | ${r.found} | ${dryRun ? '-' : r.deleted} | ${r.failed} |`),
    '',
  ];
  fs.appendFileSync(STEP_SUMMARY_FILE, lines.join('\n'));
}

async function main(): Promise<void> {
  const staleOrgIds = new Set<string>();
  const results: SweepResult[] = [];

  results.push(
    await sweep('organization', async () => {
      const orgs = (await listOrganizations()).filter((org) => isStale(org.name, ORG_NAME));
      for (const org of orgs) staleOrgIds.add(org.id);
      return orgs.map((org) => ({
        label: `${org.name} (${org.id})`,
        remove: () => deleteOrganization(org.id),
      }));
    }),
  );

  results.push(
    await sweep('connection', async () => {
      // Checked per connection rather than against the org list, which is only the first page.
      const orphans: Candidate[] = [];
      for (const connection of await listConnections()) {
        const orgId = CONNECTION_ORG_ID.exec(connection.name)?.[1];
        if (orgId && (staleOrgIds.has(orgId) || !(await organizationExists(orgId)))) {
          orphans.push({ label: connection.name, remove: () => deleteSsoProvider(connection.id) });
        }
      }
      return orphans;
    }),
  );

  results.push(
    await sweep('user', async () =>
      (await listUsersOnConnection(CONNECTION_NAME))
        .filter((user) => user.email !== undefined && isStale(user.email, USER_EMAIL))
        .map((user) => ({
          label: user.email ?? user.user_id,
          remove: () => deleteUser(user.user_id),
        })),
    ),
  );

  // Rethrow without the cause: the request path holds the URL-encoded email, which log masking misses.
  results.push(
    await sweep('Okta SSO user', async () => {
      const users = await listUsersByEmail(env.FT_OKTA_SSO_USER_EMAIL).catch((error: unknown) => {
        const status = error instanceof ManagementApiError ? ` (${error.status})` : '';
        throw new Error(`Okta SSO user lookup failed${status}`);
      });
      return users
        .filter(
          (user) =>
            user.identities.every((identity) => identity.provider !== 'auth0') &&
            Date.parse(user.created_at) < cutoff,
        )
        .map((user) => ({ label: user.user_id, remove: () => deleteUser(user.user_id) }));
    }),
  );

  results.push(
    await sweep('role', async () =>
      (await listRolesByPrefix('ft-role-'))
        .filter((role) => isStale(role.name, ROLE_NAME))
        .map((role) => ({ label: role.name, remove: () => deleteRole(role.id) })),
    ),
  );

  writeSummary(results);

  const failed = results.reduce((sum, r) => sum + r.failed, 0);
  console.log(
    `${failed > 0 ? '✘' : '✔'} cleanup ${dryRun ? 'dry run ' : ''}done: ` +
      results.map((r) => `${r.found} ${r.type}(s)`).join(', '),
  );
  if (failed > 0) process.exitCode = 1;
}

await main();
