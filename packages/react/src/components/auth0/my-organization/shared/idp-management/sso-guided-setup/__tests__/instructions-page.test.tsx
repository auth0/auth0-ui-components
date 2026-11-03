import type { IdpStrategy } from '@auth0/universal-components-core';
import { renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { InstructionsPage } from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/instructions-page';
import {
  SsoGuidedSetupProvider,
  useSsoGuidedSetupContext,
} from '@/components/auth0/my-organization/shared/idp-management/sso-guided-setup/sso-guided-setup-context';
import {
  createMockIdpInstructions,
  createMockIdpProvisioningInstructions,
} from '@/tests/utils/__mocks__/my-organization/idp-management/idp-instructions.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type {
  InstructionContentProps,
  SsoGuidedSetupContextValue,
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

const context = (
  overrides: Partial<SsoGuidedSetupContextValue> = {},
): SsoGuidedSetupContextValue => ({
  kind: 'creation',
  strategy: 'okta',
  baseUrl: BASE_URL,
  companyName: 'Acme Corp',
  ...overrides,
});

const renderPage = (
  page: Parameters<typeof InstructionsPage>[0]['page'],
  options: {
    value?: SsoGuidedSetupContextValue;
    renderers?: Parameters<typeof InstructionsPage>[0]['renderers'];
  } = {},
) =>
  renderWithProviders(
    <SsoGuidedSetupProvider value={options.value ?? context()}>
      <InstructionsPage page={page} renderers={options.renderers} />
    </SsoGuidedSetupProvider>,
  );

describe('InstructionsPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fixtures for every strategy', () => {
    it.each(STRATEGIES)('renders every creation page for %s without crashing', (strategy) => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { pages } = createMockIdpInstructions(strategy);

      pages.forEach((page) => {
        const { container, unmount } = renderPage(page, { value: context({ strategy }) });
        expect(container.querySelector(`[data-page="${page.key}"]`)).toBeInTheDocument();
        unmount();
      });
    });

    it.each(STRATEGIES)('renders every provisioning page for %s without crashing', (strategy) => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { pages } = createMockIdpProvisioningInstructions(strategy);

      pages.forEach((page) => {
        const { unmount } = renderPage(page, {
          value: context({ strategy, kind: 'provisioning' }),
        });
        unmount();
      });
    });
  });

  it('renders markdown with base_url images and the company name', () => {
    const [createApplication] = createMockIdpInstructions('okta').pages;

    renderPage(createApplication!);

    expect(screen.getByText(/Create Application for Okta and Acme Corp\./)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Create Application' })).toHaveAttribute(
      'src',
      `${BASE_URL}/img/okta/okta-create-application.png`,
    );
  });

  it('renders the notice variant as a callout', () => {
    const configureScim = createMockIdpProvisioningInstructions('okta').pages.find(
      (page) => page.key === 'okta-configure-scim',
    )!;
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    renderPage(configureScim, { value: context({ kind: 'provisioning' }) });

    expect(screen.getByRole('note')).toHaveTextContent('Note for configure scim.');
  });

  it('opens the default tab and switches tabs', async () => {
    const assignAccess = createMockIdpInstructions('waad').pages.find(
      (page) => page.key === 'waad-assign-access',
    )!;

    renderPage(assignAccess, { value: context({ strategy: 'waad' }) });

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

  it('uses custom renderers for interactive content types', () => {
    const CallbackUrl = ({ content }: InstructionContentProps) => {
      const { strategy } = useSsoGuidedSetupContext();
      return <p>{`${content.type} for ${strategy}`}</p>;
    };
    const [createApplication] = createMockIdpInstructions('okta').pages;

    renderPage(createApplication!, { renderers: { callback_url_component: CallbackUrl } });

    expect(screen.getByText('callback_url_component for okta')).toBeInTheDocument();
  });

  it('lets custom renderers replace the defaults', () => {
    const Markdown = () => <p>custom markdown</p>;
    const [createApplication] = createMockIdpInstructions('okta').pages;
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    renderPage(createApplication!, { renderers: { markdown_component: Markdown } });

    expect(screen.getAllByText('custom markdown').length).toBeGreaterThan(0);
  });
});

describe('useSsoGuidedSetupContext', () => {
  it('throws outside SsoGuidedSetupProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useSsoGuidedSetupContext())).toThrow(
      'useSsoGuidedSetupContext must be used within SsoGuidedSetupProvider',
    );
  });

  it('returns the provided value', () => {
    const value = context({ connectionName: 'my-okta' });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SsoGuidedSetupProvider value={value}>{children}</SsoGuidedSetupProvider>
    );

    const { result } = renderHook(() => useSsoGuidedSetupContext(), { wrapper });

    expect(result.current.connectionName).toBe('my-okta');
  });
});
