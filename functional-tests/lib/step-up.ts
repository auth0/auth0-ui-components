// Must match tenant/step-up-action.js. Only users carrying this flag are ever challenged.
export const STEP_UP_APP_METADATA = { ft_step_up: true } as const;

// Fixed per run so teardown can find and delete the user even if the spec never got to.
export function stepUpUserEmail(orgId: string): string {
  return `ft-stepup-${orgId}@example.com`.toLowerCase();
}
