import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadEnv } from 'dotenv';

import { deleteOrganization, deleteSsoProvider, listConnections } from '../lib/management-api';
import { clearRunState, readRunState } from '../lib/run-state';

const dirname = path.dirname(fileURLToPath(import.meta.url));

loadEnv({ path: path.resolve(dirname, '../.env') });

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

if (!state) {
  console.log('· no ephemeral organization recorded, nothing to tear down');
} else {
  await sweepOrganizationConnections(state.orgId).catch((error) => {
    console.warn(`· warning: could not sweep connections for ${state.orgId}: ${String(error)}`);
  });
  await deleteOrganization(state.orgId);
  clearRunState();
  // The cached session is scoped to an organization that no longer exists.
  fs.rmSync(path.resolve(dirname, '../.auth'), { recursive: true, force: true });
  console.log(`✔ deleted ephemeral organization ${state.orgName} (${state.orgId})`);
}
