import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import type { OidcConfigureFormHandle } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/oidc-sso-configure-form';
import { OidcProviderForm } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/oidc-sso-configure-form';
import { createMockI18nService } from '@/tests/utils/__mocks__/core/i18n-service.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

describe('OidcProviderForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    createMockI18nService().translator('idp_management.create_sso_provider.provider_configure');
  });

  describe('third party access section', () => {
    it('should not render ThirdPartyAccessSection when showThirdPartyAccess is false', () => {
      renderWithProviders(<OidcProviderForm idpConfig={null} showThirdPartyAccess={false} />);

      expect(screen.queryByText('title')).not.toBeInTheDocument();
    });

    it('should not render ThirdPartyAccessSection when showThirdPartyAccess is undefined', () => {
      renderWithProviders(<OidcProviderForm idpConfig={null} />);

      expect(screen.queryByRole('group')).not.toBeInTheDocument();
    });

    it('should render ThirdPartyAccessSection when showThirdPartyAccess is true', () => {
      renderWithProviders(<OidcProviderForm idpConfig={null} showThirdPartyAccess={true} />);

      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('label')).toBeInTheDocument();
      expect(screen.getByText('helper_text')).toBeInTheDocument();
    });

    it('should include use_for_third_party_client_access in form data when toggled', async () => {
      const user = userEvent.setup();
      const formRef = React.createRef<OidcConfigureFormHandle>();

      renderWithProviders(
        <OidcProviderForm ref={formRef} idpConfig={null} showThirdPartyAccess={true} />,
      );

      const checkbox = screen.getByRole('checkbox', { name: 'label' });
      await user.click(checkbox);

      await waitFor(() => {
        const data = formRef.current?.getData();
        expect(data?.use_for_third_party_client_access).toBe(true);
      });
    });

    it('should initialize use_for_third_party_client_access from initialData', async () => {
      const formRef = React.createRef<OidcConfigureFormHandle>();
      const initialData = {
        discovery_url: 'https://example.com/.well-known/openid-configuration',
        client_id: 'test-client-id',
        use_for_third_party_client_access: true,
      };

      renderWithProviders(
        <OidcProviderForm
          ref={formRef}
          idpConfig={null}
          showThirdPartyAccess={true}
          initialData={initialData}
        />,
      );

      await waitFor(() => {
        const data = formRef.current?.getData();
        expect(data?.use_for_third_party_client_access).toBe(true);
      });

      const checkbox = screen.getByRole('checkbox', { name: 'label' });
      expect(checkbox).toBeChecked();
    });

    it('should disable ThirdPartyAccessSection checkbox when readOnly is true', () => {
      renderWithProviders(
        <OidcProviderForm idpConfig={null} showThirdPartyAccess={true} readOnly={true} />,
      );

      const checkbox = screen.getByRole('checkbox', { name: 'label' });
      expect(checkbox).toBeDisabled();
    });
  });

  describe('form type selection', () => {
    it('should default to back_channel type', async () => {
      const formRef = React.createRef<OidcConfigureFormHandle>();
      renderWithProviders(<OidcProviderForm ref={formRef} idpConfig={null} />);

      await waitFor(() => {
        const data = formRef.current?.getData();
        expect(data?.type).toBe('back_channel');
      });
    });

    it('should show client_secret field when back_channel is selected', () => {
      renderWithProviders(<OidcProviderForm idpConfig={null} />);

      expect(screen.getByText('fields.oidc.client_secret.label')).toBeInTheDocument();
    });

    it('should hide client_secret field when front_channel is selected', async () => {
      const user = userEvent.setup();
      renderWithProviders(<OidcProviderForm idpConfig={null} />);

      const frontChannelRadio = screen.getByRole('radio', {
        name: 'fields.oidc.type.options.front_channel.label',
      });
      await user.click(frontChannelRadio);

      await waitFor(() => {
        expect(screen.queryByText('fields.oidc.client_secret.label')).not.toBeInTheDocument();
      });
    });
  });

  describe('form dirty state', () => {
    it('should call onFormDirty when form becomes dirty', async () => {
      const user = userEvent.setup();
      const onFormDirty = vi.fn();
      renderWithProviders(<OidcProviderForm idpConfig={null} onFormDirty={onFormDirty} />);

      const discoveryUrlField = screen.getByPlaceholderText(
        'fields.oidc.discovery_url.placeholder',
      );
      await user.type(discoveryUrlField, 'https://example.com/.well-known/openid-configuration');

      await waitFor(() => {
        expect(onFormDirty).toHaveBeenLastCalledWith(true);
      });
    });
  });
});
