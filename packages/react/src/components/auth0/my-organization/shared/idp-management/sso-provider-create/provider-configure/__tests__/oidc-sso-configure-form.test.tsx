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
