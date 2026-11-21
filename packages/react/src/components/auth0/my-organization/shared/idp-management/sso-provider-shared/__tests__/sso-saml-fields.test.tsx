import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { SsoSamlConnectionFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-saml-connection-fields';
import { SsoSamlRequestSettings } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-saml-request-settings';
import { SsoSamlServiceProviderFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-saml-service-provider-fields';
import { SsoServiceProviderField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-service-provider-field';
import { Form } from '@/components/ui/form';
import { renderWithProviders } from '@/tests/utils/test-provider';

type Values = Record<string, unknown>;

let formRef: ReturnType<typeof useForm<Values>> | undefined;

function Harness({ defaults = {}, children }: { defaults?: Values; children: React.ReactNode }) {
  const form = useForm<Values>({
    defaultValues: {
      meta_data_source: 'meta_data_url',
      metadataUrl: '',
      signInEndpoint: '',
      signingCert: '',
      signSAMLRequest: false,
      signatureAlgorithm: 'rsa-sha256',
      digestAlgorithm: 'sha256',
      bindingMethod: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      callback_url: 'https://acme.auth0.com/login/callback',
      acs_url: 'https://acme.auth0.com/login/callback?connection=c',
      sp_metadata_url: 'https://acme.auth0.com/samlp/metadata?connection=c',
      ...defaults,
    },
  });
  formRef = form;
  return <Form {...form}>{children}</Form>;
}

const renderIn = (ui: React.ReactNode, defaults?: Values) =>
  renderWithProviders(<Harness defaults={defaults}>{ui}</Harness>);

describe('SsoSamlConnectionFields', () => {
  it('shows the metadata URL field for the URL source', () => {
    renderIn(<SsoSamlConnectionFields />);

    expect(screen.getByText('fields.samlp.meta_data_url.label')).toBeInTheDocument();
    expect(
      screen.queryByText('fields.samlp.single_sign_on_login_url.label'),
    ).not.toBeInTheDocument();
  });

  it('shows the sign-in URL and certificate for the manual source', () => {
    renderIn(<SsoSamlConnectionFields />, { meta_data_source: 'meta_data_file' });

    expect(screen.getByText('fields.samlp.single_sign_on_login_url.label')).toBeInTheDocument();
    expect(screen.getByText('fields.samlp.cert.label')).toBeInTheDocument();
    expect(screen.queryByText('fields.samlp.meta_data_url.label')).not.toBeInTheDocument();
  });

  it('switches source with the radio selector by default', async () => {
    renderIn(<SsoSamlConnectionFields />);

    expect(screen.getAllByRole('radio')).toHaveLength(2);
    await userEvent.click(screen.getAllByRole('radio')[1]!);

    expect(formRef?.getValues('meta_data_source')).toBe('meta_data_file');
    expect(screen.getByText('fields.samlp.cert.label')).toBeInTheDocument();
  });

  it('switches source with tabs when sourceSelector is tabs', async () => {
    renderIn(<SsoSamlConnectionFields sourceSelector="tabs" />);

    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      'fields.common.connection_method.automatic',
      'fields.common.connection_method.manual',
    ]);

    await userEvent.click(tabs[1]!);

    expect(formRef?.getValues('meta_data_source')).toBe('meta_data_file');
    expect(screen.getByText('fields.samlp.single_sign_on_login_url.label')).toBeInTheDocument();
  });

  it('marks the source change as dirty in both selectors', async () => {
    renderIn(<SsoSamlConnectionFields sourceSelector="tabs" />);

    await userEvent.click(screen.getAllByRole('tab')[1]!);

    expect(formRef?.formState.dirtyFields.meta_data_source).toBe(true);
  });

  it('disables the selector when read only', () => {
    renderIn(<SsoSamlConnectionFields sourceSelector="tabs" readOnly />);

    screen.getAllByRole('tab').forEach((tab) => expect(tab).toBeDisabled());
  });
});

describe('SsoSamlRequestSettings', () => {
  const openSettings = async () => {
    await act(async () => {
      fireEvent.click(screen.getByText('fields.samlp.advanced_settings.title'));
    });
  };

  it('links the sign request help text to the certificate URL', async () => {
    renderIn(
      <SsoSamlRequestSettings signRequestCertUrl="https://acme.auth0.com/pem?cert=connection" />,
    );
    await openSettings();

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://acme.auth0.com/pem?cert=connection',
    );
  });

  it('shows the algorithms only while sign request is enabled', async () => {
    renderIn(<SsoSamlRequestSettings signRequestCertUrl="x" />, { signSAMLRequest: true });
    await openSettings();

    expect(
      screen.getByText('fields.samlp.advanced_settings.sign_request_algorithm.label'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('fields.samlp.advanced_settings.sign_request_algorithm_digest.label'),
    ).toBeInTheDocument();
  });

  it('keeps the protocol binding when sign request is hidden', async () => {
    renderIn(<SsoSamlRequestSettings signRequestCertUrl="x" showSignRequest={false} />, {
      signSAMLRequest: true,
    });
    await openSettings();

    expect(
      screen.queryByText('fields.samlp.advanced_settings.sign_request.label'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('fields.samlp.advanced_settings.request_protocol_binding.label'),
    ).toBeInTheDocument();
  });
});

describe('SsoServiceProviderField', () => {
  it('shows a form field value read-only', () => {
    renderIn(
      <SsoServiceProviderField name="callback_url" label="Callback URL" helperText="help" />,
    );

    const input = screen.getByDisplayValue('https://acme.auth0.com/login/callback');
    expect(input).toHaveAttribute('readonly');
    expect(screen.getByText('help')).toBeInTheDocument();
  });

  it('shows a plain value without a form', () => {
    renderWithProviders(
      <SsoServiceProviderField id="entity" label="Entity ID" value="urn:auth0:acme:c" />,
    );

    expect(screen.getByLabelText('Entity ID')).toHaveValue('urn:auth0:acme:c');
  });

  it('omits the helper text when none is given', () => {
    const { container } = renderWithProviders(
      <SsoServiceProviderField id="entity" label="Entity ID" value="v" />,
    );

    expect(container.querySelector('p')).toBeNull();
  });
});

describe('SsoSamlServiceProviderFields', () => {
  it('shows the callback, ACS and metadata URLs from the form and the given issuer URN', () => {
    renderIn(<SsoSamlServiceProviderFields spIssuerUrn="urn:auth0:acme:c" />);

    expect(screen.getByDisplayValue('https://acme.auth0.com/login/callback')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('https://acme.auth0.com/login/callback?connection=c'),
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('https://acme.auth0.com/samlp/metadata?connection=c'),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('urn:auth0:acme:c')).toBeInTheDocument();
  });
});
