// Shared state between setup-org, Playwright specs, and teardown-org — which run as separate
// processes with no shared memory, so a file is the only reliable handoff mechanism.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const stateFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.run-state.json');

// Identity only — mutable fields (display_name, members, …) are omitted to prevent stale cache making specs order-dependent.
export interface RunState {
  orgId: string;
  orgName: string;
}

export function readRunState(): RunState | null {
  if (!fs.existsSync(stateFile)) return null;
  return JSON.parse(fs.readFileSync(stateFile, 'utf8')) as RunState;
}

export function requireRunState(): RunState {
  const state = readRunState();
  if (!state) {
    throw new Error(
      'No ephemeral organization found. Run `pnpm test` (which wraps setup/teardown) rather ' +
        'than `pnpm run test:only`, or create one with `pnpm run org:setup`.',
    );
  }
  return state;
}

export function writeRunState(state: RunState): void {
  fs.writeFileSync(stateFile, `${JSON.stringify(state, null, 2)}\n`);
}

export function clearRunState(): void {
  fs.rmSync(stateFile, { force: true });
}
