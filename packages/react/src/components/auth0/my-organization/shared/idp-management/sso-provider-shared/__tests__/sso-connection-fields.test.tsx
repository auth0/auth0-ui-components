import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { AdfsProviderForm } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/adfs-sso-configure-form';
import { SamlpProviderForm } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/samlp-sso-configure-form';
import { SsoAdfsConnectionFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-adfs-connection-fields';
import { SsoFileField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-file-field';
import { SsoSamlRequestSettings } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-saml-request-settings';
import { SsoUrlField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-url-field';
import { Form } from '@/components/ui/form';
import { renderWithProviders } from '@/tests/utils/test-provider';

type Values = Record<string, unknown>;

let formRef: ReturnType<typeof useForm<Values>> | undefined;

function Harness({ defaults = {}, children }: { defaults?: Values; children: React.ReactNode }) {
  const form = useForm<Values>({
    defaultValues: {
      meta_data_source: 'meta_data_url',
      adfs_server: '',
      meta_data_location_url: '',
      fedMetadataXml: '',
      url: '',
      cert: '',
      signSAMLRequest: false,
      bindingMethod: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      ...defaults,
    },
  });
  formRef = form;
  return <Form {...form}>{children}</Form>;
}

const renderIn = (ui: React.ReactNode, defaults?: Values) =>
  renderWithProviders(<Harness defaults={defaults}>{ui}</Harness>);

describe('SsoUrlField', () => {
  it('renders label, placeholder and helper text from the message key', () => {
    renderIn(<SsoUrlField name="url" messageKey="fields.samlp.meta_data_url" />);

    expect(screen.getByText('fields.samlp.meta_data_url.label')).toBeInTheDocument();
    expect(screen.getByText('fields.samlp.meta_data_url.helper_text')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('fields.samlp.meta_data_url.placeholder')).toHaveAttribute(
      'type',
      'url',
    );
  });

  it('sets aria-required only when required', () => {
    const { unmount } = renderIn(<SsoUrlField name="url" messageKey="k" required />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
    unmount();

    renderIn(<SsoUrlField name="url" messageKey="k" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-required');
  });

  it('adds a copy button when copyable', () => {
    renderIn(<SsoUrlField name="url" messageKey="k" copyable />);

    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('writes typed values to the form', async () => {
    renderIn(<SsoUrlField name="url" messageKey="k" />);

    await userEvent.type(screen.getByRole('textbox'), 'https://idp.example.com');

    expect(formRef?.getValues('url')).toBe('https://idp.example.com');
  });
});

describe('SsoFileField', () => {
  const dropInvalidFile = async (container: HTMLElement) => {
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { files: [new File(['x'], 'notes.txt')] } });
    });
  };

  // The invalid-file message itself is covered by the PingFederate form test, which needs the
  // strategy schema to keep the manual error.
  it('does not set an error without an invalid file message key', async () => {
    const { container } = renderIn(
      <SsoFileField name="cert" messageKey="fields.samlp.cert" accept=".pem,.cer" />,
    );

    await dropInvalidFile(container);

    expect(formRef?.formState.errors.cert).toBeUndefined();
  });
});

describe('SsoAdfsConnectionFields', () => {
  it('shows the metadata URL and copyable location URL for the URL source', () => {
    renderIn(<SsoAdfsConnectionFields />);

    expect(screen.getByText('fields.adfs.meta_data_url.label')).toBeInTheDocument();
    expect(screen.getByText('fields.adfs.meta_data_location_url.label')).toBeInTheDocument();
    expect(
      screen.queryByText('fields.adfs.federation_metadata_file.label'),
    ).not.toBeInTheDocument();
  });

  it('shows the federation metadata file upload for the file source', () => {
    renderIn(<SsoAdfsConnectionFields />, { meta_data_source: 'meta_data_file' });

    expect(screen.getByText('fields.adfs.federation_metadata_file.label')).toBeInTheDocument();
    expect(screen.queryByText('fields.adfs.meta_data_url.label')).not.toBeInTheDocument();
  });

  it('switches source with Automatic / Manual tabs', async () => {
    renderIn(<SsoAdfsConnectionFields sourceSelector="tabs" />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      'fields.common.connection_method.automatic',
      'fields.common.connection_method.manual',
    ]);

    await userEvent.click(tabs[1]!);

    expect(formRef?.getValues('meta_data_source')).toBe('meta_data_file');
    expect(screen.getByText('fields.adfs.federation_metadata_file.label')).toBeInTheDocument();
  });
});

describe('SsoSamlRequestSettings options', () => {
  const open = async () => {
    await act(async () => {
      fireEvent.click(screen.getByText('fields.ping-federate.advanced_settings.title'));
    });
  };

  it('uses the given message key and a single help text', async () => {
    renderIn(
      <SsoSamlRequestSettings
        signRequestCertUrl="x"
        messageKey="fields.ping-federate.advanced_settings"
        signRequestHelperText="single"
      />,
    );
    await open();

    expect(
      screen.getByText('fields.ping-federate.advanced_settings.sign_request.label'),
    ).toBeInTheDocument();
  });

  it('hides the protocol binding when showProtocolBinding is false', async () => {
    renderIn(
      <SsoSamlRequestSettings
        signRequestCertUrl="x"
        messageKey="fields.ping-federate.advanced_settings"
        showProtocolBinding={false}
      />,
    );
    await open();

    expect(
      screen.queryByText('fields.ping-federate.advanced_settings.request_protocol_binding.label'),
    ).not.toBeInTheDocument();
  });
});

describe('connectionSourceSelector on the forms', () => {
  it('renders tabs on the SAML-P form when set to tabs', () => {
    renderWithProviders(<SamlpProviderForm idpConfig={null} connectionSourceSelector="tabs" />);

    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('renders tabs on the ADFS form when set to tabs', () => {
    renderWithProviders(<AdfsProviderForm idpConfig={null} connectionSourceSelector="tabs" />);

    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('keeps the radio selector by default', () => {
    renderWithProviders(<AdfsProviderForm idpConfig={null} />);

    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });
});
