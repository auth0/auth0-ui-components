interface AppConfig {
  auth0: {
    domain: string;
    clientId: string;
    // Scopes the session to this org; omit to keep the default post-login org prompt.
    organization?: string;
  };
  features: {
    enableMyAccount: boolean;
  };
  // Overrides query cache `staleTime` (ms).
  queryStaleTimeMs?: number;
}

function getRequiredEnvVar(name: string): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalEnvVar(name: string, defaultValue: string): string {
  return import.meta.env[name] || defaultValue;
}

// Returns `undefined` instead of empty string — Auth0 rejects `&organization=` with a blank value.
function getOptionalEnvVarOrUndefined(name: string): string | undefined {
  return import.meta.env[name] || undefined;
}

export const config: AppConfig = {
  auth0: {
    domain: getRequiredEnvVar('VITE_AUTH0_DOMAIN'),
    clientId: getRequiredEnvVar('VITE_AUTH0_CLIENT_ID'),
    organization: getOptionalEnvVarOrUndefined('VITE_AUTH0_ORGANIZATION'),
  },
  features: {
    enableMyAccount: getOptionalEnvVar('VITE_ENABLE_MY_ACCOUNT', 'false') === 'true',
  },
  queryStaleTimeMs: (() => {
    const raw = getOptionalEnvVarOrUndefined('VITE_QUERY_STALE_TIME_MS');
    return raw === undefined ? undefined : Number(raw);
  })(),
};
