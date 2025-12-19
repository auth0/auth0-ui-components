interface Auth0Config {
  issuerBaseUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  audience?: string;
  baseUrl: string;
  secret: string;
}

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    // During build time, return placeholder values to prevent build failures
    // These will be overridden at runtime with actual values
    const placeholders: Record<string, string> = {
      AUTH0_DOMAIN: 'https://placeholder.auth0.com',
      AUTH0_CLIENT_ID: 'placeholder-client-id',
      AUTH0_CLIENT_SECRET: 'placeholder-client-secret',
      AUTH0_SECRET: 'placeholder-secret-32-characters-long',
      APP_BASE_URL: 'http://localhost:3000',
    };

    const placeholder = placeholders[name];
    if (placeholder) {
      return placeholder;
    }

    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalEnvVar(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export const auth0Config: Auth0Config = {
  // Standard Auth0 Next.js environment variables
  issuerBaseUrl: getRequiredEnvVar('AUTH0_DOMAIN'),
  clientId: getRequiredEnvVar('AUTH0_CLIENT_ID'),
  clientSecret: getRequiredEnvVar('AUTH0_CLIENT_SECRET'),
  secret: getRequiredEnvVar('AUTH0_SECRET'),
  baseUrl: getOptionalEnvVar('APP_BASE_URL', 'http://localhost:5173'),
  scope: getOptionalEnvVar('AUTH0_SCOPE', 'openid profile email'),
  audience: getOptionalEnvVar('AUTH0_AUDIENCE', ''),
};
