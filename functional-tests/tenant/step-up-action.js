/**
 * Post-login Action for specs/step-up.spec.ts. scripts/setup-org.ts deploys and binds it, and
 * redeploys when this file changes. It only fires for users that spec creates
 * (app_metadata.ft_step_up), so no other user or spec is affected.
 *
 * The scope arrives in requested_scopes on /authorize (the popup) and in the body on a refresh
 * token exchange (the components' per-call token request), so check both.
 */
exports.onExecutePostLogin = async (event, api) => {
  if (event.user.app_metadata?.ft_step_up !== true) return;
  if (event.authentication?.methods?.some((method) => method.name === 'mfa')) return;

  const requested = [
    ...(event.transaction?.requested_scopes ?? []),
    ...String(event.request?.body?.scope ?? '').split(' '),
  ];
  if (!requested.includes('create:my_org:member_invitations')) return;

  api.authentication.challengeWith({ type: 'otp' });
};
