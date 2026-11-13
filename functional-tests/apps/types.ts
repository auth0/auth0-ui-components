export type FeatureKey =
  | 'organizationManagement'
  | 'memberManagement'
  | 'domainManagement'
  | 'ssoProviders'
  | 'ssoProviderCreate';

export interface AppAdapter {
  name: 'react-spa-npm' | 'next-rwa' | 'react-spa-shadcn';
  baseURL: string;
  webServer: { command: string; cwd: string; env: Record<string, string> };
  routes: Record<FeatureKey, string> & {
    memberDetail: (userId: string) => string;
    ssoProviderEdit: (providerId: string) => string;
  };
  authMode: 'spa' | 'rwa';
}
