interface AppConfig {
  auth0: {
    domain: string;
    clientId: string;
  };
}

function getRequiredEnvVar(name: string): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config: AppConfig = {
  auth0: {
    domain: getRequiredEnvVar('VITE_AUTH0_DOMAIN'),
    clientId: getRequiredEnvVar('VITE_AUTH0_CLIENT_ID'),
  },
};
