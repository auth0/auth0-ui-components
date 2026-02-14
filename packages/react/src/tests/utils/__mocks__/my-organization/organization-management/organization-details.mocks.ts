import type { Organization } from '@auth0/universal-components-core';

export const createMockOrganization = (): Organization => ({
  id: 'organization_abc123xyz456',
  name: 'auth0-corp',
  display_name: 'Auth0 Corporation',
  branding: {
    logo_url: 'https://cdn.auth0.com/avatars/au.png',
    colors: {
      primary: '#EB5424',
      page_background: '#000000',
    },
  },
});
