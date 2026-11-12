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
import { ALL_IDP_PERMISSIONS } from '@/tests/utils/__mocks__/permissions/permission.mocks';
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

  describe('domain toggle', () => {
    const verifiedDomain = createMockVerifiedSsoDomain({
      id: 'domain-1',
      domain: 'testdomain.acmetest.org',
    });

    it('renders toggle as checked when domain is associated with the provider', () => {
      mockedUseSsoDomainTab.mockReturnValue(
        createMockSsoDomainTabReturn({
          domainsList: [verifiedDomain],
          idpDomains: ['domain-1'],
        }),
      );

      renderWithProviders(<SsoDomainTab {...mockProps} />);

      const row = screen.getByRole('row', { name: /testdomain\.acmetest\.org/i });
      const toggle = within(row).getByRole('switch');
      expect(toggle).toBeChecked();
    });

    it('renders toggle as unchecked when domain is not associated with the provider', () => {
      mockedUseSsoDomainTab.mockReturnValue(
        createMockSsoDomainTabReturn({
          domainsList: [verifiedDomain],
          idpDomains: [],
        }),
      );

      renderWithProviders(<SsoDomainTab {...mockProps} />);

      const row = screen.getByRole('row', { name: /testdomain\.acmetest\.org/i });
      const toggle = within(row).getByRole('switch');
      expect(toggle).not.toBeChecked();
    });

    it('updates toggle state when idpDomains changes', () => {
      const { rerender } = renderWithProviders(<SsoDomainTab {...mockProps} />);

      mockedUseSsoDomainTab.mockReturnValue(
        createMockSsoDomainTabReturn({
          domainsList: [verifiedDomain],
          idpDomains: [],
        }),
      );

      rerender(<SsoDomainTab {...mockProps} />);

      let row = screen.getByRole('row', { name: /testdomain\.acmetest\.org/i });
      let toggle = within(row).getByRole('switch');
      expect(toggle).not.toBeChecked();

      mockedUseSsoDomainTab.mockReturnValue(
        createMockSsoDomainTabReturn({
          domainsList: [verifiedDomain],
          idpDomains: ['domain-1'],
        }),
      );

      rerender(<SsoDomainTab {...mockProps} />);

      row = screen.getByRole('row', { name: /testdomain\.acmetest\.org/i });
      toggle = within(row).getByRole('switch');
      expect(toggle).toBeChecked();
    });
  });

  describe('domain verification mode', () => {
    const verifiedDomain = createMockVerifiedSsoDomain({
      id: 'domain-1',
      domain: 'testdomain.acmetest.org',
    });

    const renderTab = (props: Partial<SsoDomainsTabProps> = {}, associated = true) => {
      mockedUseSsoDomainTab.mockReturnValue(
        createMockSsoDomainTabReturn({
          domainsList: [verifiedDomain],
          idpDomains: associated ? ['domain-1'] : [],
        }),
      );
      return renderWithProviders(<SsoDomainTab {...mockProps} {...props} />);
    };

    it('shows no alert in optional mode', () => {
      renderTab({ domainVerificationMode: 'optional' });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows no alert when the mode is not provided', () => {
      renderTab();

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('explains that association is unavailable in none mode and disables the switches', () => {
      renderTab({ domainVerificationMode: 'none' });

      expect(screen.getByRole('alert')).toHaveTextContent('alerts.domain_verification_none');
      const row = screen.getByRole('row', { name: /testdomain\.acmetest\.org/i });
      expect(within(row).getByRole('switch')).toBeDisabled();
    });

    it('asks for a verified domain in required mode when the provider has none', () => {
      renderTab({
        domainVerificationMode: 'required',
        provider: createMockSsoProvider({ is_enabled: false, domains: [] }),
      });

      expect(screen.getByRole('alert')).toHaveTextContent('alerts.domain_verification_required');
    });

    it('hides the required alert once the provider has a domain', () => {
      renderTab({
        domainVerificationMode: 'required',
        provider: createMockSsoProvider({
          is_enabled: false,
          domains: ['testdomain.acmetest.org'],
        }),
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('keeps the last verified domain of an enabled provider associated in required mode', () => {
      renderTab({
        domainVerificationMode: 'required',
        provider: createMockSsoProvider({ is_enabled: true, domains: ['testdomain.acmetest.org'] }),
      });

      const row = screen.getByRole('row', { name: /testdomain\.acmetest\.org/i });
      expect(within(row).getByRole('switch')).toBeDisabled();
    });

    it('lets an enabled provider drop a domain when it has another one', () => {
      renderTab({
        domainVerificationMode: 'required',
        provider: createMockSsoProvider({
          is_enabled: true,
          domains: ['testdomain.acmetest.org', 'other.acmetest.org'],
        }),
      });

      const row = screen.getByRole('row', { name: /testdomain\.acmetest\.org/i });
      expect(within(row).getByRole('switch')).toBeEnabled();
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
          idpDomains: [],
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
  });
});
