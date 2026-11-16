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
});
