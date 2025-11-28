import { Auth0Client } from '@auth0/nextjs-auth0/server';

// Validate required environment variables
function validateEnvVars() {
  // Skip validation during build time
  // eslint-disable-next-line no-undef
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'development') {
    // Only validate in development or at runtime, not during build
    return;
  }

  const required = ['AUTH0_SECRET', 'AUTH0_DOMAIN', 'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET'];
  // eslint-disable-next-line no-undef
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required Auth0 environment variables: ${missing.join(', ')}`);
  }
}

// Validate environment variables on module load
validateEnvVars();

export const auth0 = new Auth0Client({
  authorizationParameters: {
    scope:
      // eslint-disable-next-line no-undef
      process.env.AUTH0_SCOPE || 'openid profile email offline_access',
    // Only include audience if it's defined and not empty
    // eslint-disable-next-line no-undef
    ...(process.env.AUTH0_DOMAIN && {
      // eslint-disable-next-line no-undef
      audience: `${process.env.AUTH0_DOMAIN.replace(/\/$/, '')}/my-org/`,
    }),
  },
  // Using SDK defaults: rolling: true, absoluteDuration: 3 days, inactivityDuration: 1 day
});
