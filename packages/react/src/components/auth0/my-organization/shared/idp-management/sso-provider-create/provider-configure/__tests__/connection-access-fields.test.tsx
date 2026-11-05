import { STRATEGIES, type IdpStrategy } from '@auth0/universal-components-core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ConnectionAccessFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/connection-access-fields';
import { Form } from '@/components/ui/form';
import { createMockI18nService } from '@/tests/utils/__mocks__/core/i18n-service.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { ConnectionAccessFieldsProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

type Values = {
  use_for_third_party_client_access?: boolean;
  cross_app_access_resource_app?: { status: 'enabled' | 'disabled' };
  discovery_url?: string;
};

let latestValues: () => Values = () => ({});

function Harness(props: ConnectionAccessFieldsProps & { defaultValues?: Values }) {
  const { defaultValues, ...rest } = props;
  const form = useForm<Values>({ defaultValues });
  latestValues = () => form.getValues();
  return (
    <Form {...form}>
      <ConnectionAccessFields {...rest} />
    </Form>
  );
}

const thirdPartyCheckbox = () => screen.getByRole('checkbox', { name: 'label' });

describe('ConnectionAccessFields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMockI18nService().translator('idp_management.create_sso_provider.provider_configure');
  });

  describe('when rendering third-party access', () => {
    it('should render nothing when showThirdPartyAccess and showCrossAppAccess are false', () => {
      renderWithProviders(<Harness strategy={STRATEGIES.WAAD} />);
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('should render the checkbox when showThirdPartyAccess is true', () => {
      renderWithProviders(<Harness strategy={STRATEGIES.WAAD} showThirdPartyAccess />);
      expect(thirdPartyCheckbox()).toBeInTheDocument();
    });

    it('should write use_for_third_party_client_access to the form when toggled', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Harness
          strategy={STRATEGIES.ADFS}
          showThirdPartyAccess
          defaultValues={{ use_for_third_party_client_access: false }}
        />,
      );
      await user.click(thirdPartyCheckbox());
      expect(latestValues().use_for_third_party_client_access).toBe(true);
    });

    it.each<[string, Partial<ConnectionAccessFieldsProps>]>([
      ['readOnly', { readOnly: true }],
      ['isThirdPartyAccessReadOnly', { isThirdPartyAccessReadOnly: true }],
      ['isOrganizationBlocked', { isOrganizationBlocked: true }],
    ])('should disable the checkbox when %s', (_, extra) => {
      renderWithProviders(
        <Harness strategy={STRATEGIES.GOOGLE_APPS} showThirdPartyAccess {...extra} />,
      );
      expect(thirdPartyCheckbox()).toBeDisabled();
    });

    it('should keep the checkbox enabled when no read-only flag is set', () => {
      renderWithProviders(<Harness strategy={STRATEGIES.PINGFEDERATE} showThirdPartyAccess />);
      expect(thirdPartyCheckbox()).toBeEnabled();
    });
  });

  describe('when rendering cross app access', () => {
    it.each<IdpStrategy>([STRATEGIES.OIDC, STRATEGIES.OKTA, STRATEGIES.SAMLP])(
      'should render for %s when showCrossAppAccess is true',
      (strategy) => {
        renderWithProviders(<Harness strategy={strategy} showCrossAppAccess />);
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
      },
    );

    it.each<IdpStrategy>([
      STRATEGIES.WAAD,
      STRATEGIES.ADFS,
      STRATEGIES.GOOGLE_APPS,
      STRATEGIES.PINGFEDERATE,
    ])('should never render for %s even when showCrossAppAccess is true', (strategy) => {
      renderWithProviders(<Harness strategy={strategy} showCrossAppAccess />);
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('should write { status: "enabled" } when toggled on for okta', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Harness strategy={STRATEGIES.OKTA} showCrossAppAccess />);
      await user.click(screen.getByRole('checkbox'));
      expect(latestValues().cross_app_access_resource_app).toEqual({ status: 'enabled' });
    });

    it('should disable the checkbox when isCrossAppAccessReadOnly is true', () => {
      renderWithProviders(
        <Harness strategy={STRATEGIES.OIDC} showCrossAppAccess isCrossAppAccessReadOnly />,
      );
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('should update discovery_url through the form for samlp', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Harness
          strategy={STRATEGIES.SAMLP}
          showCrossAppAccess
          defaultValues={{ discovery_url: '' }}
        />,
      );
      await user.type(
        screen.getByRole('textbox'),
        'https://idp.example.com/.well-known/openid-configuration',
      );
      expect(latestValues().discovery_url).toBe(
        'https://idp.example.com/.well-known/openid-configuration',
      );
    });
  });
});
