export interface SsoProviderDeleteSchema {
  providerName?: {
    required?: boolean;
    errorMessage?: string;
    exactMatch?: string;
  };
}
