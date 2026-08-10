import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SsoDomainTab } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-domain-tab';
import { useSsoDomainTab } from '@/hooks/my-organization/use-sso-domain-tab';
import {
  createMockSsoDomainTabReturn,
  createMockVerifiedSsoDomain,
} from '@/tests/utils/__mocks__/my-organization/idp-management/sso-domain.mocks';
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
  readOnly: false,
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
});
