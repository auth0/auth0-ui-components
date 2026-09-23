import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import type { SamlpConfigureFormHandle } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/samlp-sso-configure-form';
import { SamlpProviderForm } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/samlp-sso-configure-form';
import { createMockI18nService } from '@/tests/utils/__mocks__/core/i18n-service.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

describe('SamlpProviderForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    createMockI18nService().translator('idp_management.create_sso_provider.provider_configure');
  });

  describe('binding method', () => {
    describe('URN format', () => {
      it('should use full SAML URN format for default binding method value', async () => {
        const formRef = React.createRef<SamlpConfigureFormHandle>();
        renderWithProviders(<SamlpProviderForm ref={formRef} idpConfig={null} />);

        await waitFor(() => {
          const data = formRef.current?.getData();
          expect(data?.bindingMethod).toBe('urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST');
        });
      });

      it('should preserve initial binding method value with full URN format', async () => {
        const formRef = React.createRef<SamlpConfigureFormHandle>();
        const initialData = {
          bindingMethod: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
          metadataUrl: 'https://example.com/metadata',
        };

        renderWithProviders(
          <SamlpProviderForm ref={formRef} idpConfig={null} initialData={initialData} />,
        );

        await waitFor(() => {
          const data = formRef.current?.getData();
          expect(data?.bindingMethod).toBe('urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect');
        });
      });
    });

    describe('protocolBinding sync', () => {
      it('should default protocolBinding to HTTP-POST, matching bindingMethod', async () => {
        const formRef = React.createRef<SamlpConfigureFormHandle>();
        renderWithProviders(<SamlpProviderForm ref={formRef} idpConfig={null} />);

        await waitFor(() => {
          const data = formRef.current?.getData();
          expect(data?.protocolBinding).toBe('urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST');
          expect(data?.protocolBinding).toBe(data?.bindingMethod);
        });
      });

      it('should mirror an initial HTTP-Redirect bindingMethod into protocolBinding', async () => {
        const formRef = React.createRef<SamlpConfigureFormHandle>();
        const initialData = {
          bindingMethod: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
          metadataUrl: 'https://example.com/metadata',
        };

        renderWithProviders(
          <SamlpProviderForm ref={formRef} idpConfig={null} initialData={initialData} />,
        );

        await waitFor(() => {
          const data = formRef.current?.getData();
          expect(data?.protocolBinding).toBe('urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect');
          expect(data?.protocolBinding).toBe(data?.bindingMethod);
        });
      });

      it('should mirror an initial HTTP-POST bindingMethod into protocolBinding', async () => {
        const formRef = React.createRef<SamlpConfigureFormHandle>();
        const initialData = {
          bindingMethod: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
          metadataUrl: 'https://example.com/metadata',
        };

        renderWithProviders(
          <SamlpProviderForm ref={formRef} idpConfig={null} initialData={initialData} />,
        );

        await waitFor(() => {
          const data = formRef.current?.getData();
          expect(data?.protocolBinding).toBe('urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST');
          expect(data?.protocolBinding).toBe(data?.bindingMethod);
        });
      });
    });

    describe('rendering', () => {
      it('should render binding method field in advanced settings', async () => {
        const user = userEvent.setup();
        renderWithProviders(<SamlpProviderForm idpConfig={null} />);

        const accordionTrigger = screen.getByRole('button', {
          name: 'fields.samlp.advanced_settings.title',
        });
        await user.click(accordionTrigger);

        expect(
          screen.getByText('fields.samlp.advanced_settings.request_protocol_binding.label'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('advanced settings', () => {
    describe('sign request', () => {
      it('should render signature algorithm fields when sign request is enabled', async () => {
        const user = userEvent.setup();
        renderWithProviders(<SamlpProviderForm idpConfig={null} />);

        expect(
          screen.queryByText('fields.samlp.advanced_settings.sign_request_algorithm.label'),
        ).not.toBeInTheDocument();

        const accordionTrigger = screen.getByRole('button', {
          name: 'fields.samlp.advanced_settings.title',
        });
        await user.click(accordionTrigger);

        const checkbox = screen.getByRole('checkbox');
        await user.click(checkbox);

        expect(
          screen.getByText('fields.samlp.advanced_settings.sign_request_algorithm.label'),
        ).toBeInTheDocument();
        expect(
          screen.getByText('fields.samlp.advanced_settings.sign_request_algorithm_digest.label'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('form dirty state', () => {
    it('should call onFormDirty when form becomes dirty', async () => {
      const user = userEvent.setup();
      const onFormDirty = vi.fn();
      renderWithProviders(<SamlpProviderForm idpConfig={null} onFormDirty={onFormDirty} />);

      const metadataUrlField = screen.getByPlaceholderText(
        'fields.samlp.meta_data_url.placeholder',
      );
      await user.type(metadataUrlField, 'https://example.com/metadata');

      await waitFor(() => {
        expect(onFormDirty).toHaveBeenLastCalledWith(true);
      });
    });
  });

  describe('third party access section', () => {
    it('should not render ThirdPartyAccessSection when showThirdPartyAccess is false', () => {
      renderWithProviders(<SamlpProviderForm idpConfig={null} showThirdPartyAccess={false} />);

      expect(screen.queryByText('title')).not.toBeInTheDocument();
    });

    it('should not render ThirdPartyAccessSection when showThirdPartyAccess is undefined', () => {
      renderWithProviders(<SamlpProviderForm idpConfig={null} />);

      expect(screen.queryByRole('heading', { name: 'title' })).not.toBeInTheDocument();
    });

    it('should render ThirdPartyAccessSection when showThirdPartyAccess is true', () => {
      renderWithProviders(<SamlpProviderForm idpConfig={null} showThirdPartyAccess={true} />);

      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('label')).toBeInTheDocument();
      expect(screen.getByText('helper_text')).toBeInTheDocument();
    });

    it('should include use_for_third_party_client_access in form data when toggled', async () => {
      const user = userEvent.setup();
      const formRef = React.createRef<SamlpConfigureFormHandle>();

      renderWithProviders(
        <SamlpProviderForm ref={formRef} idpConfig={null} showThirdPartyAccess={true} />,
      );

      const checkbox = screen.getByRole('checkbox', { name: 'label' });
      await user.click(checkbox);

      await waitFor(() => {
        const data = formRef.current?.getData();
        expect(data?.use_for_third_party_client_access).toBe(true);
      });
    });

    it('should initialize use_for_third_party_client_access from initialData', async () => {
      const formRef = React.createRef<SamlpConfigureFormHandle>();
      const initialData = {
        metadataUrl: 'https://example.com/metadata',
        use_for_third_party_client_access: true,
      };

      renderWithProviders(
        <SamlpProviderForm
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
        <SamlpProviderForm idpConfig={null} showThirdPartyAccess={true} readOnly={true} />,
      );

      const checkbox = screen.getByRole('checkbox', { name: 'label' });
      expect(checkbox).toBeDisabled();
    });
  });

  describe('SP metadata fields', () => {
    it('should render all three SP metadata field labels and helper texts', () => {
      renderWithProviders(<SamlpProviderForm idpConfig={null} />);

      expect(screen.getByText('fields.samlp.callback_url.label')).toBeInTheDocument();
      expect(screen.getByText('fields.samlp.callback_url.helper_text')).toBeInTheDocument();
      expect(screen.getByText('fields.samlp.acs_url.label')).toBeInTheDocument();
      expect(screen.getByText('fields.samlp.acs_url.helper_text')).toBeInTheDocument();
      expect(screen.getByText('fields.samlp.sp_metadata_url.label')).toBeInTheDocument();
      expect(screen.getByText('fields.samlp.sp_metadata_url.helper_text')).toBeInTheDocument();
    });

    it('should render the SP metadata fields as read-only with copy buttons', () => {
      renderWithProviders(
        <SamlpProviderForm idpConfig={null} connectionName="my-saml-connection" />,
      );

      // One copy button per field (CopyableTextField's aria-label resolves to the "copy" key).
      expect(screen.getAllByLabelText('copy')).toHaveLength(3);

      const callbackInput = screen.getByDisplayValue(
        'https://test-domain.auth0.com/login/callback',
      );
      expect(callbackInput).toHaveAttribute('readonly');
    });

    it('should compute URLs from the tenant domain, appending connection param to ACS and metadata', () => {
      renderWithProviders(
        <SamlpProviderForm idpConfig={null} connectionName="my-saml-connection" />,
      );

      expect(
        screen.getByDisplayValue('https://test-domain.auth0.com/login/callback'),
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(
          'https://test-domain.auth0.com/login/callback?connection=my-saml-connection',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(
          'https://test-domain.auth0.com/samlp/metadata?connection=my-saml-connection',
        ),
      ).toBeInTheDocument();
    });

    it('should use the configured tenant domain when computing URLs', () => {
      renderWithProviders(<SamlpProviderForm idpConfig={null} connectionName="acme" />, {
        authDetails: { domain: 'example.auth0.com' },
      });

      expect(
        screen.getByDisplayValue('https://example.auth0.com/login/callback'),
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('https://example.auth0.com/login/callback?connection=acme'),
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('https://example.auth0.com/samlp/metadata?connection=acme'),
      ).toBeInTheDocument();
    });

    it('should omit the connection param when connectionName is not provided', () => {
      renderWithProviders(<SamlpProviderForm idpConfig={null} />);

      // Callback and ACS collapse to the same value without a connection param.
      expect(
        screen.getAllByDisplayValue('https://test-domain.auth0.com/login/callback'),
      ).toHaveLength(2);
      expect(
        screen.getByDisplayValue('https://test-domain.auth0.com/samlp/metadata'),
      ).toBeInTheDocument();
    });

    it('should derive URLs from connectionName in the edit flow (initialData present)', () => {
      const initialData = {
        metadataUrl: 'https://idp.example.com/metadata',
        bindingMethod: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      };

      renderWithProviders(
        <SamlpProviderForm
          idpConfig={null}
          initialData={initialData}
          connectionName="existing-conn"
        />,
      );

      expect(
        screen.getByDisplayValue(
          'https://test-domain.auth0.com/login/callback?connection=existing-conn',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(
          'https://test-domain.auth0.com/samlp/metadata?connection=existing-conn',
        ),
      ).toBeInTheDocument();
    });

    it('should not include the SP metadata URLs in the form payload (display-only)', async () => {
      const formRef = React.createRef<SamlpConfigureFormHandle>();

      renderWithProviders(
        <SamlpProviderForm ref={formRef} idpConfig={null} connectionName="my-saml-connection" />,
      );

      await waitFor(() => {
        const data = formRef.current?.getData() as Record<string, unknown>;
        expect(data).toBeDefined();
        expect(data.callback_url).toBeUndefined();
        expect(data.acs_url).toBeUndefined();
        expect(data.sp_metadata_url).toBeUndefined();
      });
    });
  });
});
