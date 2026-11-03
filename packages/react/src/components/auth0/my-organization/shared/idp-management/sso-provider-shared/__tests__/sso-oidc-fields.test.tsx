import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { SsoCallbackUrlField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-callback-url-field';
import { SsoClientCredentialsFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-client-credentials-fields';
import { SsoIdpDomainField } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-idp-domain-field';
import { SsoOidcConnectionFields } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-oidc-connection-fields';
import { Form } from '@/components/ui/form';
import { renderWithProviders } from '@/tests/utils/test-provider';

type Values = Record<string, unknown>;

let formRef: ReturnType<typeof useForm<Values>> | undefined;

function Harness({ defaults = {}, children }: { defaults?: Values; children: React.ReactNode }) {
  const form = useForm<Values>({
    defaultValues: {
      domain: '',
      client_id: '',
      client_secret: '',
      callback_url: 'https://acme.auth0.com/login/callback',
      discovery_url: '',
      type: 'back_channel',
      ...defaults,
    },
  });
  formRef = form;
  return <Form {...form}>{children}</Form>;
}

const renderIn = (ui: React.ReactNode, defaults?: Values) =>
  renderWithProviders(<Harness defaults={defaults}>{ui}</Harness>);

describe('SsoIdpDomainField', () => {
  it('shows the help link only when a help URL is given', () => {
    const { unmount } = renderIn(
      <SsoIdpDomainField
        name="domain"
        messageKey="fields.okta.domain"
        helpUrl="https://developer.okta.com/docs/guides/find-your-domain/main/"
      />,
    );
    expect(screen.getByText('fields.okta.domain.helper_text')).toBeInTheDocument();
    unmount();

    renderIn(<SsoIdpDomainField name="domain" messageKey="fields.waad.tenant_domain" />);
    expect(screen.queryByText('fields.waad.tenant_domain.helper_text')).not.toBeInTheDocument();
  });

  it('writes the typed domain to the form', async () => {
    renderIn(<SsoIdpDomainField name="domain" messageKey="fields.okta.domain" />);

    await userEvent.type(screen.getByRole('textbox'), 'acme.okta.com');

    expect(formRef?.getValues('domain')).toBe('acme.okta.com');
  });
});

describe('SsoClientCredentialsFields', () => {
  it('renders the client ID and a password client secret', () => {
    renderIn(<SsoClientCredentialsFields messageKey="fields.okta" />);

    expect(screen.getByPlaceholderText('fields.okta.client_id.placeholder')).toHaveAttribute(
      'type',
      'text',
    );
    expect(screen.getByPlaceholderText('fields.okta.client_secret.placeholder')).toHaveAttribute(
      'type',
      'password',
    );
  });

  it('hides the client secret when showClientSecret is false', () => {
    renderIn(<SsoClientCredentialsFields messageKey="fields.oidc" showClientSecret={false} />);

    expect(
      screen.queryByPlaceholderText('fields.oidc.client_secret.placeholder'),
    ).not.toBeInTheDocument();
  });

  it('sets aria-required only when required', () => {
    renderIn(<SsoClientCredentialsFields messageKey="fields.oidc" required />);

    expect(screen.getByPlaceholderText('fields.oidc.client_id.placeholder')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('does not set aria-required by default', () => {
    renderIn(<SsoClientCredentialsFields messageKey="fields.waad" />);

    expect(screen.getByPlaceholderText('fields.waad.client_id.placeholder')).not.toHaveAttribute(
      'aria-required',
    );
  });
});

describe('SsoCallbackUrlField', () => {
  it('shows the callback URL from the form read-only', () => {
    renderIn(<SsoCallbackUrlField messageKey="fields.okta" />);

    expect(screen.getByDisplayValue('https://acme.auth0.com/login/callback')).toHaveAttribute(
      'readonly',
    );
    expect(screen.getByText('fields.okta.callback_url.helper_text')).toBeInTheDocument();
  });
});

describe('SsoOidcConnectionFields', () => {
  it('shows the client secret for the back channel', () => {
    renderIn(<SsoOidcConnectionFields />);

    expect(
      screen.getByPlaceholderText('fields.oidc.client_secret.placeholder'),
    ).toBeInTheDocument();
  });

  it('hides and clears the client secret when switching to the front channel', async () => {
    renderIn(<SsoOidcConnectionFields />, { client_secret: 'secret' });

    await userEvent.click(screen.getByLabelText('fields.oidc.type.options.front_channel.label'));

    expect(
      screen.queryByPlaceholderText('fields.oidc.client_secret.placeholder'),
    ).not.toBeInTheDocument();
    expect(formRef?.getValues('client_secret')).toBe('');
  });

  it('marks the discovery URL and credentials as required', () => {
    renderIn(<SsoOidcConnectionFields />);

    expect(screen.getByPlaceholderText('fields.oidc.discovery_url.placeholder')).toHaveAttribute(
      'aria-required',
      'true',
    );
    expect(screen.getByPlaceholderText('fields.oidc.client_id.placeholder')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });
});
