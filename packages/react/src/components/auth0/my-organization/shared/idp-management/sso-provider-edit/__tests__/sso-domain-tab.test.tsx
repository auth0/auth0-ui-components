import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SsoDomainTab } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-domain-tab';
import { useSsoDomainTab } from '@/hooks/my-organization/use-sso-domain-tab';
import { createMockSsoDomainTabReturn, renderWithProviders } from '@/tests/utils';
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
});
