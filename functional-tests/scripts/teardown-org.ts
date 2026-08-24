import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadEnv } from 'dotenv';

import { deleteOrganization } from '../lib/management-api';
import { clearRunState, readRunState } from '../lib/run-state';

const dirname = path.dirname(fileURLToPath(import.meta.url));

loadEnv({ path: path.resolve(dirname, '../.env') });

const state = readRunState();

if (!state) {
  console.log('· no ephemeral organization recorded, nothing to tear down');
} else {
  await deleteOrganization(state.orgId);
  clearRunState();
  // The cached session is scoped to an organization that no longer exists.
  fs.rmSync(path.resolve(dirname, '../.auth'), { recursive: true, force: true });
  console.log(`✔ deleted ephemeral organization ${state.orgName} (${state.orgId})`);
}
