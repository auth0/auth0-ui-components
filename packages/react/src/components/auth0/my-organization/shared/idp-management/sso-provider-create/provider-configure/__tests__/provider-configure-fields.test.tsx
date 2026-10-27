import { STRATEGIES, type IdpStrategy } from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { CROSS_APP_ACCESS_STRATEGIES } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/connection-access-defaults';
import {
  ProviderConfigureFields,
  type ProviderConfigureFormHandle,
} from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/provider-configure-fields';
import { createMockI18nService } from '@/tests/utils/__mocks__/core/i18n-service.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

const ALL_STRATEGIES: IdpStrategy[] = [
  STRATEGIES.OKTA,
  STRATEGIES.GOOGLE_APPS,
  STRATEGIES.WAAD,
  STRATEGIES.PINGFEDERATE,
  STRATEGIES.ADFS,
  STRATEGIES.SAMLP,
  STRATEGIES.OIDC,
];
const thirdPartyCheckbox = () => screen.getByRole('checkbox', { name: 'label' });

describe('ProviderConfigureFields connection-level third-party access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMockI18nService().translator('idp_management.create_sso_provider.provider_configure');
  });

  it('should cover every strategy in STRATEGIES', () => {
    expect([...ALL_STRATEGIES].sort()).toEqual([...Object.values(STRATEGIES)].sort());
  });

  describe.each(ALL_STRATEGIES)('when strategy is %s', (strategy) => {
    it('should not render the 3P checkbox when showThirdPartyAccess is false', () => {
      renderWithProviders(<ProviderConfigureFields strategy={strategy} idpConfig={null} />);
      expect(screen.queryByRole('checkbox', { name: 'label' })).not.toBeInTheDocument();
    });

    it('should render the 3P checkbox when showThirdPartyAccess is true', () => {
      renderWithProviders(
        <ProviderConfigureFields strategy={strategy} idpConfig={null} showThirdPartyAccess />,
      );
      expect(thirdPartyCheckbox()).toBeEnabled();
    });

    it('should include use_for_third_party_client_access in getData after toggling', async () => {
      const user = userEvent.setup();
      const ref = React.createRef<ProviderConfigureFormHandle>();
      renderWithProviders(
        <ProviderConfigureFields
          ref={ref}
          strategy={strategy}
          idpConfig={null}
          showThirdPartyAccess
        />,
      );
      await user.click(thirdPartyCheckbox());
      await waitFor(() =>
        expect(
          (ref.current?.getData() as { use_for_third_party_client_access?: boolean })
            .use_for_third_party_client_access,
        ).toBe(true),
      );
    });

    it('should initialize the 3P checkbox from initialData', () => {
      renderWithProviders(
        <ProviderConfigureFields
          strategy={strategy}
          idpConfig={null}
          showThirdPartyAccess
          initialData={{ use_for_third_party_client_access: true }}
        />,
      );
      expect(thirdPartyCheckbox()).toBeChecked();
    });

    it.each([
      ['readOnly', { readOnly: true }],
      ['isThirdPartyAccessReadOnly', { isThirdPartyAccessReadOnly: true }],
      ['isOrganizationBlocked', { isOrganizationBlocked: true }],
    ])('should disable the 3P checkbox when %s', (_, extra) => {
      renderWithProviders(
        <ProviderConfigureFields
          strategy={strategy}
          idpConfig={null}
          showThirdPartyAccess
          {...extra}
        />,
      );
      expect(thirdPartyCheckbox()).toBeDisabled();
    });
  });

  describe('when showCrossAppAccess is true', () => {
    it.each(ALL_STRATEGIES)(
      'should render the XAA section for %s only when supported',
      (strategy) => {
        renderWithProviders(
          <ProviderConfigureFields strategy={strategy} idpConfig={null} showCrossAppAccess />,
        );
        const section = screen.queryByRole('heading', { name: 'title' });
        if (CROSS_APP_ACCESS_STRATEGIES.includes(strategy)) {
          expect(section).toBeInTheDocument();
        } else {
          expect(section).not.toBeInTheDocument();
        }
      },
    );

    it('should seed OIDC create from crossAppAccessDefaultValue', () => {
      const ref = React.createRef<ProviderConfigureFormHandle>();
      renderWithProviders(
        <ProviderConfigureFields
          ref={ref}
          strategy={STRATEGIES.OIDC}
          idpConfig={null}
          showCrossAppAccess
          crossAppAccessDefaultValue="enabled"
        />,
      );
      expect(
        (ref.current?.getData() as { cross_app_access_resource_app?: unknown })
          .cross_app_access_resource_app,
      ).toEqual({ status: 'enabled' });
    });
  });
});
