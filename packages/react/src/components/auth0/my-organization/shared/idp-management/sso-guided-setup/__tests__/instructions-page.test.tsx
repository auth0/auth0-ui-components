import type { IdpStrategy } from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { InstructionsPage } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instructions-page';
import { createMockCoreClient } from '@/tests/utils/__mocks__/core/core-client.mocks';
import {
  createMockIdpInstructions,
  createMockIdpProvisioningInstructions,
} from '@/tests/utils/__mocks__/my-organization/idp-management/idp-instructions.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type {
  InstructionContentProps,
  InstructionSetup,
} from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

const BASE_URL = 'https://acme.auth0.com/my-org/public/instructions';
const STRATEGIES: IdpStrategy[] = [
  'okta',
  'oidc',
  'samlp',
  'waad',
  'google-apps',
  'adfs',
  'pingfederate',
];

const setup = (overrides: Partial<InstructionSetup> = {}): InstructionSetup => ({
  kind: 'creation',
  strategy: 'okta',
  ...overrides,
});

const renderPage = (
  page: Parameters<typeof InstructionsPage>[0]['page'],
  options: {
    setup?: InstructionSetup;
    renderers?: Parameters<typeof InstructionsPage>[0]['renderers'];
    coreClient?: ReturnType<typeof createMockCoreClient>;
  } = {},
) =>
  renderWithProviders(
    <InstructionsPage page={page} setup={options.setup ?? setup()} renderers={options.renderers} />,
    { coreClient: options.coreClient },
  );

describe('InstructionsPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fixtures for every strategy', () => {
    it.each(STRATEGIES)('renders every creation page for %s', (strategy) => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      createMockIdpInstructions(strategy).pages.forEach((page) => {
        const { container, unmount } = renderPage(page, { setup: setup({ strategy }) });
        expect(container.querySelector(`[data-page="${page.key}"]`)).toBeInTheDocument();
        unmount();
      });
    });

    it.each(STRATEGIES)('renders every provisioning page for %s', (strategy) => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      createMockIdpProvisioningInstructions(strategy).pages.forEach((page) => {
        const { container, unmount } = renderPage(page, {
          setup: setup({ strategy, kind: 'provisioning' }),
        });
        expect(container.querySelector(`[data-page="${page.key}"]`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  it('fills markdown images and the company name from the cached instructions', async () => {
    const [createApplication] = createMockIdpInstructions('okta').pages;

    renderPage(createApplication!);

    expect(await screen.findByText('Create Application for Okta and acme.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Create Application' })).toHaveAttribute(
      'src',
      `${BASE_URL}/img/okta/okta-create-application.png`,
    );
  });

  it('requests the instructions once however many markdown blocks the page has', async () => {
    const coreClient = createMockCoreClient();
    const get =
      coreClient.getMyOrganizationApiClient().organization.configuration
        .identityProviderInstructions.get;
    const page = {
      key: 'p',
      title: 'Page',
      contents: ['one', 'two', 'three'].map((text) => ({
        key: text,
        type: 'markdown_component',
        markdown_component: { text: `Step ${text} for {{companyName}}.` },
      })),
    } as never;

    renderPage(page, { coreClient });

    expect(await screen.findByText('Step three for acme.')).toBeInTheDocument();
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('renders the notice variant as a callout', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const configureScim = createMockIdpProvisioningInstructions('okta').pages.find(
      (page) => page.key === 'okta-configure-scim',
    )!;

    renderPage(configureScim, { setup: setup({ kind: 'provisioning' }) });

    await waitFor(() =>
      expect(screen.getByRole('note')).toHaveTextContent('Note for configure scim.'),
    );
  });

  it('opens the default tab and renders the other tab on switch', async () => {
    const assignAccess = createMockIdpInstructions('waad').pages.find(
      (page) => page.key === 'waad-assign-access',
    )!;

    renderPage(assignAccess, { setup: setup({ strategy: 'waad' }) });

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(tabs[1]!);

    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('skips content types without a renderer and warns once per type', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const page = {
      key: 'p',
      title: 'Page',
      contents: [
        { key: 'a', type: 'future_widget_component' },
        { key: 'b', type: 'future_widget_component' },
        { key: 'c', type: 'markdown_component', markdown_component: { text: 'Still shown.' } },
      ],
    } as never;

    renderPage(page);

    expect(screen.getByText('Still shown.')).toBeInTheDocument();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('future_widget_component');
  });

  it('passes the setup to custom renderers, including inside tabs', async () => {
    const Markdown = ({ setup: { strategy, connectionName } }: InstructionContentProps) => (
      <p>{`${strategy}:${connectionName}`}</p>
    );
    const assignAccess = createMockIdpInstructions('waad').pages.find(
      (page) => page.key === 'waad-assign-access',
    )!;

    renderPage(assignAccess, {
      setup: setup({ strategy: 'waad', connectionName: 'my-entra' }),
      renderers: { markdown_component: Markdown },
    });
    await userEvent.click(screen.getAllByRole('tab')[1]!);

    expect(screen.getAllByText('waad:my-entra').length).toBeGreaterThan(0);
  });
});
