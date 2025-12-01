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

export const auth0 = new Auth0Client({
  httpTimeout: 20000, // 20 seconds
  authorizationParameters: {
    scope: process.env.AUTH0_SCOPE || 'openid profile email offline_access',

    ...(process.env.AUTH0_DOMAIN && {
      audience: `${process.env.AUTH0_DOMAIN.replace(/\/$/, '')}/my-org/`,
    }),
  },
  // Using SDK defaults: rolling: true, absoluteDuration: 3 days, inactivityDuration: 1 day
});
