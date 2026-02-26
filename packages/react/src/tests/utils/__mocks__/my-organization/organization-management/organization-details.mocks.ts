import type { Organization } from '@auth0/universal-components-core';

import type {
  OrganizationDetailsEditLogicProps,
  OrganizationDetailsEditHandlerProps,
} from '@/types/my-organization/organization-management/organization-details-edit-types';

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

export function createMockOrganizationDetailsEditLogic(
  overrides: Partial<OrganizationDetailsEditLogicProps> = {},
): OrganizationDetailsEditLogicProps {
  return {
    organization: { ...createMockOrganization() },
    isFetchLoading: false,
    schema: undefined,
    styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    customMessages: {},
    readOnly: false,
    hideHeader: false,
    backButton: undefined,
    ...overrides,
  };
}

export function createMockOrganizationDetailsEditHandler(
  overrides: Partial<OrganizationDetailsEditHandlerProps> = {},
): OrganizationDetailsEditHandlerProps {
  return {
    formActions: {
      isLoading: false,
      nextAction: {
        disabled: false,
        onClick: () => Promise.resolve(true),
      },
    },
    ...overrides,
  };
}
