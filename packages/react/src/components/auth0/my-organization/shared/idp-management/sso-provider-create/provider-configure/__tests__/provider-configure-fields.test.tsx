import { STRATEGIES, type IdpStrategy } from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

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

    it('should not include use_for_third_party_client_access in getData when showThirdPartyAccess is false', () => {
      const ref = React.createRef<ProviderConfigureFormHandle>();
      renderWithProviders(
        <ProviderConfigureFields ref={ref} strategy={strategy} idpConfig={null} />,
      );
      expect(ref.current?.getData()).not.toHaveProperty('use_for_third_party_client_access');
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

  describe.each(ALL_STRATEGIES)(
    'when strategy is %s, the submitted third-party value',
    (strategy) => {
      const getValue = (props: {
        mode: 'create' | 'edit';
        showThirdPartyAccess: boolean;
        initial?: boolean;
      }) => {
        const ref = React.createRef<ProviderConfigureFormHandle>();
        renderWithProviders(
          <ProviderConfigureFields
            ref={ref}
            strategy={strategy}
            idpConfig={null}
            mode={props.mode}
            showThirdPartyAccess={props.showThirdPartyAccess}
            initialData={
              props.initial === undefined
                ? undefined
                : { use_for_third_party_client_access: props.initial }
            }
          />,
        );
        return ref.current?.getData() as { use_for_third_party_client_access?: boolean };
      };

      it.each(['create', 'edit'] as const)(
        'should never be present in %s mode when the flag is off, whatever the initial value',
        (mode) => {
          for (const initial of [undefined, true, false]) {
            expect(getValue({ mode, showThirdPartyAccess: false, initial })).not.toHaveProperty(
              'use_for_third_party_client_access',
            );
          }
        },
      );

      it.each([
        ['create', undefined, false],
        ['create', true, true],
        ['create', false, false],
        ['edit', undefined, undefined],
        ['edit', true, true],
        ['edit', false, false],
      ] as const)(
        'should resolve in %s mode with initial %s when the flag is on to %s',
        (mode, initial, expected) => {
          expect(
            getValue({ mode, showThirdPartyAccess: true, initial })
              .use_for_third_party_client_access,
          ).toBe(expected);
        },
      );
    },
  );

  describe('when showCrossAppAccess is true', () => {
    it.each(ALL_STRATEGIES)('should render the XAA section for %s', (strategy) => {
      renderWithProviders(
        <ProviderConfigureFields strategy={strategy} idpConfig={null} showCrossAppAccess />,
      );
      expect(screen.getByRole('heading', { name: 'title' })).toBeInTheDocument();
    });

    it('should not include cross_app_access_resource_app in getData when showCrossAppAccess is false', () => {
      const ref = React.createRef<ProviderConfigureFormHandle>();
      renderWithProviders(
        <ProviderConfigureFields
          ref={ref}
          strategy={STRATEGIES.ADFS}
          idpConfig={null}
          initialData={{ cross_app_access_resource_app: { status: 'enabled' } }}
        />,
      );
      expect(ref.current?.getData()).not.toHaveProperty('cross_app_access_resource_app');
    });

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
