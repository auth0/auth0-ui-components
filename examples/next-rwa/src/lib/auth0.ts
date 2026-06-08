import { Auth0Client } from '@auth0/nextjs-auth0/server';

// Validate required environment variables
function validateEnvVars() {
  // Skip validation during build time

  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'development') {
    // Only validate in development or at runtime, not during build
    return;
  }

  const required = ['AUTH0_SECRET', 'AUTH0_DOMAIN', 'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET'];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required Auth0 environment variables: ${missing.join(', ')}`);
  }
}

// Validate environment variables on module load
validateEnvVars();

const BASE_SCOPES = 'openid profile email offline_access';

const MY_ACCOUNT_SCOPES = [
  'create:me:authentication_methods',
  'read:me:authentication_methods',
  'update:me:authentication_methods',
  'delete:me:authentication_methods',
  'read:me:factors',
];

const MY_ORG_SCOPES = [
  'read:my_org:details',
  'update:my_org:details',
  'create:my_org:identity_providers',
  'read:my_org:identity_providers',
  'update:my_org:identity_providers',
  'delete:my_org:identity_providers',
  'update:my_org:identity_providers_detach',
  'read:my_org:domains',
  'delete:my_org:domains',
  'create:my_org:domains',
  'update:my_org:domains',
  'create:my_org:identity_providers_domains',
  'delete:my_org:identity_providers_domains',
  'read:my_org:identity_providers_scim_tokens',
  'create:my_org:identity_providers_scim_tokens',
  'delete:my_org:identity_providers_scim_tokens',
  'create:my_org:identity_providers_provisioning',
  'read:my_org:identity_providers_provisioning',
  'delete:my_org:identity_providers_provisioning',
  'read:my_org:configuration',
];

const domain = process.env.AUTH0_DOMAIN?.replace(/\/$/, '');

export const auth0 = new Auth0Client({
  httpTimeout: 20000, // 20 seconds
  authorizationParameters: {
    audience: domain ? `${domain}/my-org/` : undefined,
    scope: {
      [`${domain}/me/`]: `${BASE_SCOPES} ${MY_ACCOUNT_SCOPES.join(' ')}`,
      [`${domain}/my-org/`]: `${BASE_SCOPES} ${MY_ORG_SCOPES.join(' ')}`,
    },
  },
  // Using SDK defaults: rolling: true, absoluteDuration: 3 days, inactivityDuration: 1 day
});
