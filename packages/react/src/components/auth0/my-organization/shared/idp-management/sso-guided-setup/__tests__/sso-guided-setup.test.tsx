import type { IdpKnownResponse } from '@auth0/universal-components-core';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SsoGuidedSetup } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/sso-guided-setup';
import { renderWithProviders } from '@/tests/utils/test-provider';

const PROVIDER = {
  id: 'con_123',
  name: 'my-okta',
  display_name: 'My Okta',
  strategy: 'okta',
  options: {},
  attributes: [
    {
      user_attribute_profile_id: 'email',
      label: 'Email',
      description: 'Email',
      sso_field: ['email'],
      is_required: true,
    },
  ],
} as unknown as IdpKnownResponse;

// The page title, by id: other headings exist on some pages, and an open modal hides the page.
const pageTitle = () => document.getElementById('sso-guided-setup-page-title') as HTMLElement;
const primary = (name: RegExp) => screen.getByRole('button', { name });

const renderSetup = (props: Partial<React.ComponentProps<typeof SsoGuidedSetup>> = {}) =>
  renderWithProviders(<SsoGuidedSetup strategy="okta" connectionName="my-okta" {...props} />);

describe('SsoGuidedSetup', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the strategy and its pages in a vertical stepper', async () => {
    renderSetup();

    expect(await screen.findByText('Okta')).toBeInTheDocument();
    const stepper = screen.getByRole('navigation', { name: 'stepper_label' });
    expect(stepper.querySelector('[data-slot="stepper"]')).toHaveAttribute(
      'data-orientation',
      'vertical',
    );
    [
      'Create Application',
      'Configure Connection',
      'Claims Mapping',
      'Assign Access',
      'Test SSO',
    ].forEach((title) => expect(screen.getAllByText(title).length).toBeGreaterThan(0));
    expect(pageTitle()).toHaveTextContent('Create Application');
  });

  it('renders copy values on the page with the tenant domain', async () => {
    renderSetup();

    expect(
      await screen.findByDisplayValue('https://test-domain.auth0.com/login/callback'),
    ).toBeInTheDocument();
  });

  it('leaves the copy value descriptions to the instructions', async () => {
    renderSetup();

    await screen.findByDisplayValue('https://test-domain.auth0.com/login/callback');
    expect(screen.queryByText(/helper_text/)).not.toBeInTheDocument();
  });

  it('moves forward with Next and back through the stepper', async () => {
    renderSetup();
    await screen.findByText('Okta');

    await userEvent.click(primary(/^next$/));
    expect(pageTitle()).toHaveTextContent('Configure Connection');

    await userEvent.click(screen.getByRole('button', { name: /create application/i }));
    expect(pageTitle()).toHaveTextContent('Create Application');
  });

  it('has no step Back button or unsaved changes label', async () => {
    renderSetup();
    await screen.findByText('Okta');

    await userEvent.click(primary(/^next$/));
    expect(screen.queryByRole('button', { name: /^back$/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();
  });

  it('reports the page being left before moving', async () => {
    const onLeavePage = vi.fn();
    renderSetup({ onLeavePage });
    await screen.findByText('Okta');

    await userEvent.click(primary(/^next$/));
    expect(onLeavePage).toHaveBeenLastCalledWith(
      expect.objectContaining({ key: 'okta-create-application' }),
    );

    await userEvent.click(screen.getByRole('button', { name: /create application/i }));
    expect(onLeavePage).toHaveBeenLastCalledWith(
      expect.objectContaining({ key: 'okta-configure-connection' }),
    );
    expect(onLeavePage).toHaveBeenCalledTimes(2);
  });

  describe('creating the provider', () => {
    const goToConfigure = async () => {
      await screen.findByText('Okta');
      await userEvent.click(primary(/^next$/));
    };

    it('asks for confirmation before creating and stays when validation fails', async () => {
      const onBeforeCreate = vi.fn().mockResolvedValue(false);
      renderSetup({ onBeforeCreate });
      await goToConfigure();

      await userEvent.click(primary(/create_provider/));

      expect(onBeforeCreate).toHaveBeenCalled();
      expect(screen.queryByText('create_modal.title')).not.toBeInTheDocument();
    });

    it('creates on Proceed and moves on once the provider exists', async () => {
      const onCreateProvider = vi.fn().mockResolvedValue(true);
      const { rerender } = renderSetup({ onCreateProvider });
      await goToConfigure();

      await userEvent.click(primary(/create_provider/));
      expect(await screen.findByText('create_modal.title')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'create_modal.proceed' }));

      expect(onCreateProvider).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(screen.queryByText('create_modal.title')).not.toBeInTheDocument());

      rerender(
        <SsoGuidedSetup
          strategy="okta"
          connectionName="my-okta"
          onCreateProvider={onCreateProvider}
          provider={PROVIDER}
        />,
      );

      await waitFor(() => expect(pageTitle()).toHaveTextContent('Claims Mapping'));
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('keeps the confirmation open when creating fails', async () => {
      const onCreateProvider = vi.fn().mockResolvedValue(false);
      renderSetup({ onCreateProvider });
      await goToConfigure();

      await userEvent.click(primary(/create_provider/));
      await userEvent.click(await screen.findByRole('button', { name: 'create_modal.proceed' }));

      expect(screen.getByText('create_modal.title')).toBeInTheDocument();
      expect(pageTitle()).toHaveTextContent('Configure Connection');
    });

    it('does not let the stepper skip past the configure page before creation', async () => {
      renderSetup();
      await screen.findByText('Okta');

      await userEvent.click(primary(/^next$/));

      expect(screen.queryByRole('button', { name: /Test SSO/ })).not.toBeInTheDocument();
    });
  });

  it('finishes with Done on the last page', async () => {
    const onComplete = vi.fn();
    renderSetup({
      provider: PROVIDER,
      initialPageKey: 'okta-test-connection',
      onComplete,
    });

    await waitFor(() => expect(pageTitle()).toHaveTextContent('Test SSO'));
    await userEvent.click(primary(/done/));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  describe('content renderers', () => {
    it('renders the strategy form from context on the configure page', async () => {
      const ref = React.createRef<never>();
      renderSetup({
        configure: { ref, props: { idpConfig: null } },
        initialPageKey: 'okta-configure-connection',
      });

      expect(await screen.findByText('fields.okta.domain.label')).toBeInTheDocument();
    });

    it('notes that mappings appear once the provider exists', async () => {
      renderSetup({ initialPageKey: 'okta-claims-mapping' });

      expect(await screen.findByText('attribute_mapping_pending')).toBeInTheDocument();
    });

    it('fills the test connection slot', async () => {
      renderSetup({
        provider: PROVIDER,
        initialPageKey: 'okta-test-connection',
        slots: { testConnection: <p>test slot</p> },
      });

      expect(await screen.findByText('test slot')).toBeInTheDocument();
    });

    it('renders SAML copy values with the connection name', async () => {
      renderSetup({ strategy: 'samlp', connectionName: 'my-saml' });

      expect(
        await screen.findByDisplayValue(
          'https://test-domain.auth0.com/login/callback?connection=my-saml',
        ),
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue('urn:auth0:test-domain:my-saml')).toBeInTheDocument();
    });
  });

  it('says guided setup is unavailable when there are no pages', async () => {
    renderSetup({ kind: 'provisioning', strategy: 'adfs' });

    expect(await screen.findByText('unavailable')).toBeInTheDocument();
  });

  it('does not load instructions when disabled', () => {
    renderSetup({ enabled: false });

    expect(screen.getByRole('status')).toHaveTextContent('unavailable');
  });

  it('fills {{companyName}} from the tenant in the instructions response', async () => {
    renderSetup();

    expect(await screen.findByText('Create Application for Okta and acme.')).toBeInTheDocument();
  });

  it('shows the confirmation with the company name', async () => {
    renderSetup();
    await screen.findByText('Okta');
    await act(async () => {
      await userEvent.click(primary(/^next$/));
    });
    await userEvent.click(primary(/create_provider/));

    expect(await screen.findByText(/create_modal.description/)).toBeInTheDocument();
  });
});
