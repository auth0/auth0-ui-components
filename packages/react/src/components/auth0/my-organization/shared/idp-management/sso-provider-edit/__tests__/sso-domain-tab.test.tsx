import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SsoDomainTab } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-domain-tab';
import { useSsoDomainTab } from '@/hooks/my-organization/use-sso-domain-tab';
import {
  createMockSsoDomainTabReturn,
  createMockSsoProvider,
  createMockVerifiedSsoDomain,
} from '@/tests/utils/__mocks__/my-organization/idp-management/sso-domain.mocks';
import {
  ALL_IDP_PERMISSIONS,
  createIdpPermissions,
} from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { SsoDomainsTabProps } from '@/types/my-organization/idp-management/sso-domain/sso-domain-tab-types';

vi.mock('@/hooks/my-organization/use-sso-domain-tab', () => ({
  useSsoDomainTab: vi.fn(),
}));

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: (key: string) => key,
    changeLanguage: vi.fn(),
    currentLanguage: 'en',
    fallbackLanguage: 'en',
  }),
}));

vi.mock('@/hooks/shared/use-theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

const mockedUseSsoDomainTab = vi.mocked(useSsoDomainTab);

const mockProps: SsoDomainsTabProps = {
  idpId: 'idp_123',
  domains: {},
  provider: null,
  customMessages: {},
  styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  permissions: ALL_IDP_PERMISSIONS,
};

describe('SsoDomainTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseSsoDomainTab.mockReturnValue(createMockSsoDomainTabReturn());
  });

  describe('refresh indicator', () => {
    it('renders the refresh control when domains data is stale, and refetches domains on click', async () => {
      const user = userEvent.setup();
      const refetchDomains = vi.fn();
      mockedUseSsoDomainTab.mockReturnValue(
        createMockSsoDomainTabReturn({
          isDomainsStale: true,
          isRefetchingDomains: false,
          refetchDomains,
        }),
      );

      renderWithProviders(<SsoDomainTab {...mockProps} />);

      const refreshButton = screen.getByRole('button', { name: 'refresh' });
      expect(refreshButton).toBeInTheDocument();

      await user.click(refreshButton);
      expect(refetchDomains).toHaveBeenCalledTimes(1);
    });

    it('does render the refresh button as disabled when domains data is not stale', () => {
      mockedUseSsoDomainTab.mockReturnValue(
        createMockSsoDomainTabReturn({ isDomainsStale: false }),
      );

      renderWithProviders(<SsoDomainTab {...mockProps} />);

      expect(screen.queryByRole('button', { name: 'refresh' })).toBeDisabled();
    });
  });

  describe('assigned domains table', () => {
    const verifiedDomain = createMockVerifiedSsoDomain({
      id: 'domain-1',
      domain: 'testdomain.acmetest.org',
    });
    const provider = createMockSsoProvider({ display_name: 'Pepe the King Prawn' });

    it('lists the domains assigned to the provider with their status', () => {
      mockedUseSsoDomainTab.mockReturnValue(
        createMockSsoDomainTabReturn({ domainsList: [verifiedDomain] }),
      );

      renderWithProviders(<SsoDomainTab {...mockProps} provider={provider} />);

      const row = screen.getByRole('row', { name: /testdomain\.acmetest\.org/i });
      expect(within(row).getByText('table.domain_statuses.verified')).toBeInTheDocument();
    });

    it('renders a remove button instead of a toggle or verify button', () => {
      mockedUseSsoDomainTab.mockReturnValue(
        createMockSsoDomainTabReturn({ domainsList: [verifiedDomain] }),
      );

      renderWithProviders(<SsoDomainTab {...mockProps} provider={provider} />);

      const row = screen.getByRole('row', { name: /testdomain\.acmetest\.org/i });
      expect(within(row).getByRole('button')).toBeInTheDocument();
      expect(within(row).queryByRole('switch')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'table.columns.verify' }),
      ).not.toBeInTheDocument();
    });

    it('removes the domain from the provider when the remove button is clicked', async () => {
      const user = userEvent.setup();
      const handleRemove = vi.fn();
      mockedUseSsoDomainTab.mockReturnValue(
        createMockSsoDomainTabReturn({ domainsList: [verifiedDomain], handleRemove }),
      );

      renderWithProviders(<SsoDomainTab {...mockProps} provider={provider} />);

      await user.click(
        within(screen.getByRole('row', { name: /testdomain\.acmetest\.org/i })).getByRole('button'),
      );

      expect(handleRemove).toHaveBeenCalledWith(verifiedDomain);
    });

    it('shows the empty state when no domain is assigned', () => {
      renderWithProviders(<SsoDomainTab {...mockProps} provider={provider} />);

      expect(screen.getByText('table.empty_message')).toBeInTheDocument();
    });

    it('does not render pagination', () => {
      mockedUseSsoDomainTab.mockReturnValue(
        createMockSsoDomainTabReturn({ domainsList: [verifiedDomain] }),
      );

      renderWithProviders(<SsoDomainTab {...mockProps} provider={provider} />);

      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
    });

    it('hides the remove button when read only', () => {
      mockedUseSsoDomainTab.mockReturnValue(
        createMockSsoDomainTabReturn({ domainsList: [verifiedDomain] }),
      );

      renderWithProviders(<SsoDomainTab {...mockProps} provider={provider} readOnly />);

      const row = screen.getByRole('row', { name: /testdomain\.acmetest\.org/i });
      expect(within(row).queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('assign domain', () => {
    it('renders Assign Domain instead of Add Domain and opens the assign modal', async () => {
      const user = userEvent.setup();
      const setShowAssignModal = vi.fn();
      mockedUseSsoDomainTab.mockReturnValue(createMockSsoDomainTabReturn({ setShowAssignModal }));

      renderWithProviders(<SsoDomainTab {...mockProps} />);

      await user.click(screen.getByRole('button', { name: 'create_button_text' }));

      expect(setShowAssignModal).toHaveBeenCalledWith(true);
    });

    it('disables Assign Domain without the associate permission', () => {
      renderWithProviders(
        <SsoDomainTab
          {...mockProps}
          permissions={createIdpPermissions(['delete:my_org:identity_providers_domains'])}
        />,
      );

      expect(screen.getByRole('button', { name: 'create_button_text' })).toBeDisabled();
    });

    it('hides Assign Domain when read only', () => {
      renderWithProviders(<SsoDomainTab {...mockProps} readOnly />);

      expect(screen.queryByRole('button', { name: 'create_button_text' })).not.toBeInTheDocument();
    });

    it('lists the available domains in the assign modal and assigns the selection', async () => {
      const user = userEvent.setup();
      const handleAssign = vi.fn().mockResolvedValue(true);
      const available = createMockVerifiedSsoDomain({ id: 'domain-9', domain: 'free.example.com' });
      mockedUseSsoDomainTab.mockReturnValue(
        createMockSsoDomainTabReturn({
          showAssignModal: true,
          availableDomains: [available],
          handleAssign,
        }),
      );

      renderWithProviders(<SsoDomainTab {...mockProps} />);

      await user.click(screen.getByLabelText('field.label'));
      await user.click(await screen.findByText('free.example.com'));
      await user.click(screen.getByRole('button', { name: 'actions.assign_button_text' }));

      expect(handleAssign).toHaveBeenCalledWith([available]);
    });
  });
  describe('domain verification mode', () => {
    const domain = createMockVerifiedSsoDomain({
      id: 'domain-1',
      domain: 'testdomain.acmetest.org',
    });
    const renderTab = (
      mode: SsoDomainsTabProps['domainVerificationMode'],
      providerOverrides: Parameters<typeof createMockSsoProvider>[0] = {},
      tabProps: Partial<SsoDomainsTabProps> = {},
      listedDomains = [domain],
    ) => {
      mockedUseSsoDomainTab.mockReturnValue(
        createMockSsoDomainTabReturn({ domainsList: listedDomains }),
      );
      return renderWithProviders(
        <SsoDomainTab
          {...mockProps}
          domainVerificationMode={mode}
          provider={createMockSsoProvider(providerOverrides)}
          {...tabProps}
        />,
      );
    };
    const removeButton = () =>
      within(screen.getByRole('row', { name: /testdomain\.acmetest\.org/i })).getByRole('button');
    const assignButton = () => screen.getByRole('button', { name: 'create_button_text' });
    const describedBy = (element: HTMLElement) =>
      document.getElementById(element.getAttribute('aria-describedby')!);

    it('hands the mode to the hook so assigning is skipped in none mode', () => {
      renderTab('none');

      expect(mockedUseSsoDomainTab).toHaveBeenCalledWith(
        'idp_123',
        expect.objectContaining({ domainVerificationMode: 'none' }),
      );
    });

    it.each([undefined, 'optional'] as const)(
      'shows no alert and allows assigning in %s mode',
      (mode) => {
        renderTab(mode, { is_enabled: true, domains: ['testdomain.acmetest.org', 'other.com'] });

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(assignButton()).toBeEnabled();
        expect(removeButton()).toBeEnabled();
      },
    );

    it('explains that association is unavailable in none mode and disables Assign', () => {
      renderTab('none');

      expect(screen.getByRole('alert')).toHaveTextContent('alerts.domain_verification_none');
      expect(assignButton()).toBeDisabled();
      expect(describedBy(assignButton())).toHaveTextContent(
        'table.actions.domain_association_unavailable_tooltip',
      );
    });

    it('still lets a domain be removed in none mode', () => {
      renderTab('none', { is_enabled: true, domains: ['testdomain.acmetest.org', 'other.com'] });

      expect(removeButton()).toBeEnabled();
    });

    it('asks for a verified domain in required mode when the provider has none', () => {
      renderTab('required', { domains: [] });

      expect(screen.getByRole('alert')).toHaveTextContent('alerts.domain_verification_required');
      expect(assignButton()).toBeEnabled();
    });

    it('hides the required alert once the provider has a domain', () => {
      renderTab('required', { domains: ['testdomain.acmetest.org'], is_enabled: false });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('keeps the last verified domain of an enabled provider in required mode', () => {
      renderTab('required', { is_enabled: true, domains: ['testdomain.acmetest.org'] });

      expect(screen.getByRole('alert')).toHaveTextContent(
        'table.actions.last_verified_domain_tooltip',
      );
      expect(removeButton()).toHaveAttribute('aria-disabled', 'true');
      expect(describedBy(removeButton())).toHaveTextContent(
        'table.actions.last_verified_domain_tooltip',
      );
    });

    it('lets an enabled provider drop a domain when it has another one', () => {
      renderTab(
        'required',
        { is_enabled: true, domains: ['testdomain.acmetest.org', 'other.com'] },
        {},
        [domain, createMockVerifiedSsoDomain({ id: 'domain-2', domain: 'other.com' })],
      );

      expect(removeButton()).toBeEnabled();
    });

    it('lets a disabled provider drop its last domain in required mode', () => {
      renderTab('required', { is_enabled: false, domains: ['testdomain.acmetest.org'] });

      expect(removeButton()).toBeEnabled();
    });
  });

  describe('use for discovery column', () => {
    const policy = { default_value: false, allowed_values: [true, false] };

    const renderWithDomains = (props: Partial<SsoDomainsTabProps> = {}) => {
      mockedUseSsoDomainTab.mockReturnValue(
        createMockSsoDomainTabReturn({
          domainsList: [
            createMockVerifiedSsoDomain({
              id: 'domain-on',
              domain: 'on.acmetest.org',
              use_for_organization_discovery: true,
            }),
            createMockVerifiedSsoDomain({
              id: 'domain-off',
              domain: 'off.acmetest.org',
              use_for_organization_discovery: false,
            }),
            createMockVerifiedSsoDomain({ id: 'domain-unset', domain: 'unset.acmetest.org' }),
          ],
        }),
      );
      return renderWithProviders(<SsoDomainTab {...mockProps} {...props} />);
    };

    it('is hidden when the organization has no discovery policy', () => {
      renderWithDomains();

      expect(screen.queryByText('table.columns.use_for_discovery')).not.toBeInTheDocument();
    });

    it('shows Yes or No for each domain when a policy exists', () => {
      renderWithDomains({ discoveryPolicy: policy });

      expect(screen.getByText('table.columns.use_for_discovery')).toBeInTheDocument();
      const onRow = screen.getByRole('row', { name: /on\.acmetest\.org/i });
      const offRow = screen.getByRole('row', { name: /off\.acmetest\.org/i });
      expect(within(onRow).getByText('table.discovery_values.yes')).toBeInTheDocument();
      expect(within(offRow).getByText('table.discovery_values.no')).toBeInTheDocument();
    });

    it('does not offer sorting on a column that shows a resolved value', () => {
      renderWithDomains({ discoveryPolicy: policy });

      const header = screen.getByText('table.columns.use_for_discovery').closest('th')!;
      expect(header).not.toHaveClass('cursor-pointer');
      expect(screen.getByText('table.columns.name').closest('th')).toHaveClass('cursor-pointer');
    });

    it('uses the policy default for a domain that does not report a value', () => {
      renderWithDomains({ discoveryPolicy: { ...policy, default_value: true } });

      const row = screen.getByRole('row', { name: /unset\.acmetest\.org/i });
      expect(within(row).getByText('table.discovery_values.yes')).toBeInTheDocument();
    });

    it('has no toggle, only the value', () => {
      renderWithDomains({ discoveryPolicy: policy });

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });
  });

  describe('provider access level', () => {
    const domain = createMockVerifiedSsoDomain({
      id: 'domain-1',
      domain: 'testdomain.acmetest.org',
    });
    const renderWithAccess = (
      access_level: 'readonly' | 'limited' | 'full' | undefined,
      tabProps: Partial<SsoDomainsTabProps> = {},
    ) => {
      mockedUseSsoDomainTab.mockReturnValue(
        createMockSsoDomainTabReturn({ domainsList: [domain] }),
      );
      return renderWithProviders(
        <SsoDomainTab
          {...mockProps}
          provider={createMockSsoProvider({ access_level })}
          {...tabProps}
        />,
      );
    };
    const assignButton = () => screen.getByRole('button', { name: 'create_button_text' });
    const removeButton = () =>
      within(screen.getByRole('row', { name: /testdomain\.acmetest\.org/i })).getByRole('button');

    it.each([undefined, 'full'] as const)(
      'allows assigning and removing with %s access',
      (level) => {
        renderWithAccess(level);

        expect(assignButton()).toBeEnabled();
        expect(removeButton()).toBeEnabled();
      },
    );

    it.each(['readonly', 'limited'] as const)(
      'disables Assign and Remove with %s access and says why',
      (level) => {
        renderWithAccess(level);

        expect(assignButton()).toBeDisabled();
        expect(removeButton()).toHaveAttribute('aria-disabled', 'true');
        expect(
          document.getElementById(assignButton().getAttribute('aria-describedby')!),
        ).toHaveTextContent('table.actions.provider_access_restricted_tooltip');
        expect(
          document.getElementById(removeButton().getAttribute('aria-describedby')!),
        ).toHaveTextContent('table.actions.provider_access_restricted_tooltip');
      },
    );

    it('reports a missing permission before the access level', () => {
      renderWithAccess('limited', {
        permissions: createIdpPermissions(['delete:my_org:identity_providers_domains']),
      });

      expect(
        document.getElementById(assignButton().getAttribute('aria-describedby')!),
      ).toHaveTextContent('error.forbidden');
    });

    it('lets keyboard users reach why Assign is disabled', async () => {
      const user = userEvent.setup();
      renderWithAccess('limited');

      await user.tab();

      expect(assignButton().parentElement).toHaveFocus();
    });
  });
});
