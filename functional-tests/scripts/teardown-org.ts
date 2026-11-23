import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import '../env';

import {
  deleteOrganization,
  deleteSsoProvider,
  deleteUser,
  findUserIdByEmail,
  listConnections,
} from '../lib/management-api';
import { clearRunState, readRunState } from '../lib/run-state';
import { stepUpUserEmail } from '../lib/step-up';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const state = readRunState();

/**
 * Deletes any connections this run left behind. Specs try to clean up themselves, but they ignore
 * failures and are skipped if the run is cancelled, and leftovers break later lookups by name.
 */
async function sweepOrganizationConnections(orgId: string): Promise<void> {
  const orphans = (await listConnections()).filter((connection) => connection.name.includes(orgId));

  if (orphans.length === 0) return;

  await Promise.all(
    orphans.map((connection) => deleteSsoProvider(connection.id).catch(() => undefined)),
  );
  console.log(`· deleted ${orphans.length} connection(s) belonging to ${orgId}`);
}

// Deleting the org doesn't delete its users, and this one is an org admin with a known MFA secret.
async function deleteStepUpUser(orgId: string): Promise<void> {
  const userId = await findUserIdByEmail(stepUpUserEmail(orgId));
  if (!userId) return;

  await deleteUser(userId);
  console.log(`· deleted step-up user for ${orgId}`);
}

if (!state) {
  console.log('· no ephemeral organization recorded, nothing to tear down');
} else {
  await sweepOrganizationConnections(state.orgId).catch((error) => {
    console.warn(`· warning: could not sweep connections for ${state.orgId}: ${String(error)}`);
  });
  await deleteStepUpUser(state.orgId).catch((error) => {
    console.warn(`· warning: could not delete step-up user for ${state.orgId}: ${String(error)}`);
  });
  await deleteOrganization(state.orgId);
  clearRunState();
  // The cached session is scoped to an organization that no longer exists.
  fs.rmSync(path.resolve(dirname, '../.auth'), { recursive: true, force: true });
  console.log(`✔ deleted ephemeral organization ${state.orgName} (${state.orgId})`);
}
