interface AppConfig {
  auth0: {
    domain: string;
    clientId: string;
  };
  features: {
    enableMyAccount: boolean;
  };
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

export const config: AppConfig = {
  auth0: {
    domain: getRequiredEnvVar('VITE_AUTH0_DOMAIN'),
    clientId: getRequiredEnvVar('VITE_AUTH0_CLIENT_ID'),
  },
  features: {
    enableMyAccount: getOptionalEnvVar('VITE_ENABLE_MY_ACCOUNT', 'false') === 'true',
  },
};
