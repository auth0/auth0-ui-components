import { vi, describe, it, expect, beforeEach } from 'vitest';

import { SsoProviderDetails } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provider-details';
import { SsoProviderTab } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provider-tab';
import { createMockI18nService } from '@/tests/utils/__mocks__/core/i18n-service.mocks';
import { ALL_IDP_PERMISSIONS } from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { SsoProviderTabProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-tab-types';

vi.mock(
  '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provider-details',
  () => ({ SsoProviderDetails: vi.fn(() => null) }),
);

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: createMockI18nService().translator('idp_management.edit_sso_provider.tabs.sso'),
    changeLanguage: vi.fn(),
    currentLanguage: 'en',
    fallbackLanguage: 'en',
  }),
}));

vi.mock('@/hooks/shared/use-theme', () => ({
  useTheme: () => ({
    isDarkMode: false,
  }),
}));

describe('SsoProviderTab third-party access props', () => {
  const mockProps: SsoProviderTabProps = {
    permissions: ALL_IDP_PERMISSIONS,
    provider: {
      id: 'test-id',
      name: 'Test Provider',
      display_name: 'Test Provider Display',
      options: {},
      strategy: 'oidc',
      attributes: [],
    },
    onDelete: vi.fn(),
    onRemove: vi.fn(),
    organization: {
      id: 'organization-123',
      name: 'Test Organization',
      display_name: 'Test Organization Display',
      branding: {
        colors: {
          primary: '',
          page_background: '',
        },
        logo_url: undefined,
      },
    },
    isDeleting: false,
    isRemoving: false,
    shouldAllowDeletion: true,
    formActions: {},
    idpConfig: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([true, false])(
    'should forward isThirdPartyAccessReadOnly=%s to SsoProviderDetails',
    (value) => {
      renderWithProviders(
        <SsoProviderTab {...mockProps} showThirdPartyAccess isThirdPartyAccessReadOnly={value} />,
      );

      expect(vi.mocked(SsoProviderDetails).mock.calls[0]?.[0]).toEqual(
        expect.objectContaining({ showThirdPartyAccess: true, isThirdPartyAccessReadOnly: value }),
      );
    },
  );
});
