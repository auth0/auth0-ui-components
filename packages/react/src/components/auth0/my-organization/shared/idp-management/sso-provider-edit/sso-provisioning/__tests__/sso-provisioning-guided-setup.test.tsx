import type { IdpKnownResponse } from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SsoProvisioningGuidedSetup } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-guided-setup';
import { ALL_IDP_PERMISSIONS } from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

const PROVIDER = {
  id: 'con_123',
  name: 'my-okta',
  strategy: 'okta',
  is_enabled: true,
  options: {},
} as unknown as IdpKnownResponse;

const SCIM_NAMESPACE = 'urn:ietf:params:scim:schemas:core:2.0:User';

const IDP_CONFIG = {
  organization: {},
  strategies: {
    okta: {
      enabled_features: ['provisioning'],
      provisioning_methods: ['scim'],
      user_attributes: {
        email: {
          label: 'Email',
          profile_required: true,
          provisioning_field_name: 'emails[primary eq true].value',
        },
      },
    },
  },
} as unknown as React.ComponentProps<typeof SsoProvisioningGuidedSetup>['idpConfig'];

const mockListScimTokens = vi.fn(async () => ({ scim_tokens: [] }));

const renderSetup = (
  props: Partial<React.ComponentProps<typeof SsoProvisioningGuidedSetup>> = {},
) =>
  renderWithProviders(
    <SsoProvisioningGuidedSetup
      provider={PROVIDER}
      provisioningConfig={null}
      idpConfig={IDP_CONFIG}
      onComplete={vi.fn()}
      isScimTokensLoading={false}
      isScimTokenCreating={false}
      isScimTokenDeleting={false}
      onListScimTokens={mockListScimTokens}
      onCreateScimToken={vi.fn()}
      onDeleteScimToken={vi.fn()}
      permissions={ALL_IDP_PERMISSIONS}
      {...props}
    />,
  );

const pageTitle = () => document.getElementById('sso-guided-setup-page-title');
const next = () => screen.getByRole('button', { name: /^next$/ });

describe('SsoProvisioningGuidedSetup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the provisioning pages without the group page', async () => {
    renderSetup();

    await waitFor(() => expect(pageTitle()).toHaveTextContent('Add SCIM Template App'));
    ['Configure SCIM', 'SCIM Mapping'].forEach((title) =>
      expect(screen.getAllByText(title).length).toBeGreaterThan(0),
    );
    expect(screen.queryByText('Sync Groups')).not.toBeInTheDocument();
  });

  it('shows the SCIM endpoint and the bearer token manager', async () => {
    renderSetup();
    await waitFor(() => expect(pageTitle()).toHaveTextContent('Add SCIM Template App'));

    await userEvent.click(next());

    expect(
      screen.getByDisplayValue('https://test-domain.auth0.com/scim/v2/connections/con_123/'),
    ).toBeInTheDocument();
    await waitFor(() => expect(mockListScimTokens).toHaveBeenCalled());
  });

  it('shows the namespace once and the configured mappings', async () => {
    renderSetup();
    await waitFor(() => expect(pageTitle()).toHaveTextContent('Add SCIM Template App'));

    await userEvent.click(next());
    await userEvent.click(next());

    expect(pageTitle()).toHaveTextContent('SCIM Mapping');
    expect(screen.getAllByDisplayValue(SCIM_NAMESPACE)).toHaveLength(1);
    expect(screen.getByDisplayValue('emails[primary eq true].value')).toBeInTheDocument();
  });

  it('uses the provisioning attributes when the configuration has no mappings', async () => {
    renderSetup({
      idpConfig: { organization: {}, strategies: {} } as typeof IDP_CONFIG,
      provisioningConfig: {
        strategy: 'okta',
        attributes: [
          {
            user_attribute: 'email',
            label: 'Email',
            is_required: true,
            is_extra: false,
            is_missing: false,
            provisioning_field: 'emails[work].value',
          },
        ],
      } as unknown as React.ComponentProps<typeof SsoProvisioningGuidedSetup>['provisioningConfig'],
    });
    await waitFor(() => expect(pageTitle()).toHaveTextContent('Add SCIM Template App'));

    await userEvent.click(next());
    await userEvent.click(next());

    expect(screen.getByDisplayValue('emails[work].value')).toBeInTheDocument();
  });

  it('calls onComplete on Done', async () => {
    const onComplete = vi.fn();
    renderSetup({ onComplete });
    await waitFor(() => expect(pageTitle()).toHaveTextContent('Add SCIM Template App'));

    await userEvent.click(next());
    await userEvent.click(next());
    await userEvent.click(screen.getByRole('button', { name: /^done$/ }));

    expect(onComplete).toHaveBeenCalled();
  });
});
