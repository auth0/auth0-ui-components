import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdfsProviderForm } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/adfs-sso-configure-form';
import { GoogleAppsProviderForm } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/google-apps-sso-configure-form';
import { OidcProviderForm } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/oidc-sso-configure-form';
import { OktaProviderForm } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/okta-sso-configure-form';
import { PingFederateProviderForm } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/ping-federate-sso-configure-form';
import { SamlpProviderForm } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/samlp-sso-configure-form';
import { WaadProviderForm } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/waad-sso-configure-form';
import { createMockIdpConfiguration } from '@/tests/utils/__mocks__/my-organization/idp-management/idp-config.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

const FORMS = [
  ['OIDC', OidcProviderForm],
  ['Okta', OktaProviderForm],
  ['PingFederate', PingFederateProviderForm],
  ['SAML', SamlpProviderForm],
  ['Entra ID', WaadProviderForm],
  ['ADFS', AdfsProviderForm],
  ['Google Workspace', GoogleAppsProviderForm],
] as const;

const idpConfig = createMockIdpConfiguration();

const loginSettingCheckboxes = () => [
  screen.getByRole('checkbox', { name: 'fields.common.show_as_button.label' }),
  screen.getByRole('checkbox', { name: 'fields.common.assign_membership_on_login.label' }),
];

describe.each(FORMS)('%s form login settings', (_name, Form) => {
  it('locks the login settings with the form when only readOnly is set', () => {
    renderWithProviders(<Form idpConfig={idpConfig} readOnly />);

    loginSettingCheckboxes().forEach((checkbox) => expect(checkbox).toBeDisabled());
  });

  it('lets an explicit isLoginSettingsReadOnly override the form lock', () => {
    renderWithProviders(<Form idpConfig={idpConfig} readOnly isLoginSettingsReadOnly={false} />);

    loginSettingCheckboxes().forEach((checkbox) => expect(checkbox).toBeEnabled());
  });

  it('locks only the login settings when isLoginSettingsReadOnly is set', () => {
    renderWithProviders(<Form idpConfig={idpConfig} isLoginSettingsReadOnly />);

    loginSettingCheckboxes().forEach((checkbox) => expect(checkbox).toBeDisabled());
  });

  it('leaves the login settings editable by default', () => {
    renderWithProviders(<Form idpConfig={idpConfig} />);

    loginSettingCheckboxes().forEach((checkbox) => expect(checkbox).toBeEnabled());
  });
});
