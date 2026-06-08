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

const isMyAccount = process.env.NEXT_PUBLIC_ENABLE_MY_ACCOUNT === 'true';
const domain = process.env.AUTH0_DOMAIN?.replace(/\/$/, '');

export const auth0 = new Auth0Client({
  httpTimeout: 20000, // 20 seconds
  authorizationParameters: {
    ...(domain && {
      audience: isMyAccount ? `${domain}/me/` : `${domain}/my-org/`,
    }),
    scope: isMyAccount
      ? 'openid profile email offline_access read:me:factors read:me:authentication_methods create:me:authentication_methods delete:me:authentication_methods'
      : process.env.AUTH0_SCOPE || 'openid profile email offline_access',
  },
  // Using SDK defaults: rolling: true, absoluteDuration: 3 days, inactivityDuration: 1 day
});
