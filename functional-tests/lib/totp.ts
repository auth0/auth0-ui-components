/**
 * TOTP codes for the step-up user, computed from the secret the same way an authenticator app does.
 */
import { Secret, TOTP } from 'otpauth';

const PERIOD_MS = 30_000;
// A code generated in its window's last seconds can expire before Auth0 checks it.
const MIN_REMAINING_MS = 3_000;

export function generateTotpSecret(): string {
  return new Secret({ size: 20 }).base32;
}

export function totpAt(secret: string, timestampMs: number): string {
  return new TOTP({
    secret: Secret.fromBase32(secret),
    algorithm: 'SHA1',
    digits: 6,
    period: PERIOD_MS / 1000,
  }).generate({ timestamp: timestampMs });
}

let lastUsedStep = -1;

// Auth0 rejects a code it already accepted, so a second challenge in the same window waits for the next one.
export async function nextTotpCode(secret: string): Promise<string> {
  const now = Date.now();
  let step = Math.floor(now / PERIOD_MS);
  if ((step + 1) * PERIOD_MS - now < MIN_REMAINING_MS) step += 1;
  step = Math.max(step, lastUsedStep + 1);

  const wait = step * PERIOD_MS - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait + 250));

  lastUsedStep = step;
  return totpAt(secret, step * PERIOD_MS);
}
