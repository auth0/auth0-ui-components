import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { OrganizationMemberDetail } from '@/components/auth0/my-organization/organization-member-detail.composable';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockMember,
  createMockAvailableRoles,
  createMockOrganizationMemberDetailProps,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';

mockToast();
const { initMockCoreClient } = mockCore();

const waitForComponentToLoad = async () => {
  return await screen.findByText('member.detail.back_button');
};

describe('OrganizationMemberDetail — composability', () => {
  const mockMember = createMockMember();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    const apiService = mockCoreClient.getMyOrganizationApiClient();
    (apiService.organization.members.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockMember);
    (apiService.organization.configuration.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      allowed_strategies: ['samlp', 'oidc'],
      connection_deletion_behavior: 'allow',
      allowed_roles: createMockAvailableRoles(),
    });

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Tier 1 — default (backwards compatible)', () => {
    it('renders the member detail (name/header appears after load) when called directly', async () => {
      renderWithProviders(
        <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps()} />,
      );

      await waitForComponentToLoad();

      expect(screen.getByRole('heading', { name: mockMember.name! })).toBeInTheDocument();
    });
  });

  describe('Tier 3 — structural composition', () => {
    it('renders host panel plus a single detail instance sharing one model', async () => {
      renderWithProviders(
        <OrganizationMemberDetail.Root {...createMockOrganizationMemberDetailProps()}>
          <OrganizationMemberDetail.Header />
          <div data-testid="host-panel">Host guidance</div>
          <OrganizationMemberDetail.Content />
        </OrganizationMemberDetail.Root>,
      );

      await waitForComponentToLoad();

      expect(screen.getByTestId('host-panel')).toBeInTheDocument();
      // A duplicated model (or a header leaking from Content) would render a
      // second header/back button. The single Header part reads the one model
      // provided by Root via context; Content suppresses the view's own header.
      expect(screen.getAllByText('member.detail.back_button')).toHaveLength(1);
      expect(screen.getByRole('heading', { name: mockMember.name! })).toBeInTheDocument();
    });

    it('suppresses the built-in header when Content is composed without Header', async () => {
      renderWithProviders(
        <OrganizationMemberDetail.Root {...createMockOrganizationMemberDetailProps()}>
          <OrganizationMemberDetail.Content />
        </OrganizationMemberDetail.Root>,
      );

      // Tabs render (Content is present); the avatar/back header does not.
      await screen.findByText('member.detail.tabs.details');
      expect(screen.queryByText('member.detail.back_button')).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: mockMember.name! })).not.toBeInTheDocument();
    });
  });

  describe('context safety', () => {
    it('throws when Content is rendered outside Root', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<OrganizationMemberDetail.Content />)).toThrow(
        /must be rendered inside <OrganizationMemberDetail.Root>/,
      );
      consoleError.mockRestore();
    });
  });
});
