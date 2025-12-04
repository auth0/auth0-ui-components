interface ClientConfig {
  auth0Domain: string;
}

interface FeaturesConfig {
  enableMyAccount: boolean;
}

// Client-safe configuration (uses NEXT_PUBLIC_ env vars)
export const clientConfig: ClientConfig = {
  auth0Domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN || '',
};

export const featuresConfig: FeaturesConfig = {
  enableMyAccount: process.env.NEXT_PUBLIC_ENABLE_MY_ACCOUNT === 'true' || false,
};
