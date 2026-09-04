import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { OrganizationMemberManagement } from '@/components/auth0/my-organization/organization-member-management.composable';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createMockPendingInvitation } from '@/tests/utils/__mocks__/my-organization/member-management/invitation.mocks';
import {
  createMockMember,
  createMockRoleOptions,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { OrganizationMemberManagementProps } from '@/types/my-organization/member-management/organization-member-management-types';

mockToast();
const { initMockCoreClient } = mockCore();

const createProps = (
  overrides?: Partial<OrganizationMemberManagementProps>,
): OrganizationMemberManagementProps => ({
  styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  customMessages: {},
  hideHeader: false,
  readOnly: false,
  ...overrides,
});

const waitForComponentToLoad = async () => screen.findByRole('tab', { name: /tabs\.members/i });

describe('OrganizationMemberManagement — composability', () => {
  const mockMember = createMockMember();
  const mockInvitation = createMockPendingInvitation();
  const mockRoles = createMockRoleOptions();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    const apiService = mockCoreClient.getMyOrganizationApiClient();
    (apiService.organization.members.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockMember],
      response: { next: null, total: 1 },
    });
    (apiService.organization.invitations.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockInvitation],
      response: { next: null },
    });
    (apiService.organization.roles.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockRoles,
      response: { next: null },
    });
    (apiService.organization.configuration.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      allowed_strategies: ['samlp', 'oidc'],
      connection_deletion_behavior: 'allow',
      allowed_roles: mockRoles,
    });

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Tier 1 — default (backwards compatible)', () => {
    it('renders the tabs and invite button when called directly', async () => {
      renderWithProviders(<OrganizationMemberManagement {...createProps()} />);
      await waitForComponentToLoad();

      expect(screen.getByRole('tab', { name: /tabs\.members/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /invite_button/i })).toBeInTheDocument();
    });

    it('omits the invite button when read-only', async () => {
      renderWithProviders(<OrganizationMemberManagement {...createProps({ readOnly: true })} />);
      await waitForComponentToLoad();

      expect(screen.queryByRole('button', { name: /invite_button/i })).not.toBeInTheDocument();
    });
  });

  describe('Tier 2 — narrow replacement via render prop', () => {
    it('renders the host element and chains its onClick into the create command', async () => {
      const user = userEvent.setup();
      const hostOnClick = vi.fn();

      renderWithProviders(
        <OrganizationMemberManagement.Root {...createProps()}>
          <OrganizationMemberManagement.DefaultLayout>
            <OrganizationMemberManagement.InviteAction
              render={
                <button type="button" onClick={hostOnClick}>
                  Invite people
                </button>
              }
            />
          </OrganizationMemberManagement.DefaultLayout>
        </OrganizationMemberManagement.Root>,
      );
      await waitForComponentToLoad();

      const hostButton = screen.getByRole('button', { name: /invite people/i });
      expect(hostButton).toBeInTheDocument();

      await user.click(hostButton);
      expect(hostOnClick).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(screen.getByText(/invitation\.create\.title/i)).toBeInTheDocument();
      });
    });

    it('skips the create command when the host cancels the event', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationMemberManagement.Root {...createProps()}>
          <OrganizationMemberManagement.DefaultLayout>
            <OrganizationMemberManagement.InviteAction
              render={
                <button type="button" onClick={(e) => e.preventDefault()}>
                  Invite people
                </button>
              }
            />
          </OrganizationMemberManagement.DefaultLayout>
        </OrganizationMemberManagement.Root>,
      );
      await waitForComponentToLoad();

      await user.click(screen.getByRole('button', { name: /invite people/i }));

      expect(screen.queryByText(/invitation\.create\.title/i)).not.toBeInTheDocument();
    });
  });

  describe('Tier 3 — structural composition', () => {
    it('omits the refresh region and renders host UI interleaved', async () => {
      renderWithProviders(
        <OrganizationMemberManagement.Root {...createProps()}>
          <OrganizationMemberManagement.Header />
          <div data-testid="host-panel">Host guidance</div>
          <OrganizationMemberManagement.Content />
        </OrganizationMemberManagement.Root>,
      );
      await waitForComponentToLoad();

      expect(screen.getByTestId('host-panel')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
      // No Refresh part rendered => no refresh control present.
      expect(screen.queryByRole('button', { name: 'refresh' })).not.toBeInTheDocument();
    });

    it('renders a single table (parts share one model, no duplication)', async () => {
      renderWithProviders(
        <OrganizationMemberManagement.Root {...createProps()}>
          <OrganizationMemberManagement.Header />
          <OrganizationMemberManagement.Refresh />
          <OrganizationMemberManagement.Content />
        </OrganizationMemberManagement.Root>,
      );
      await waitForComponentToLoad();

      // A duplicated model would render a second table. Parts read the single
      // model provided by Root via context.
      expect(screen.getAllByRole('table')).toHaveLength(1);
      // The standalone Refresh part is present.
      expect(screen.getByRole('button', { name: 'refresh' })).toBeInTheDocument();
    });
  });

  describe('Tier 4 — headless alias', () => {
    it('re-exports the model hook under the stable name', async () => {
      const mod = await import('@/index');
      expect(mod.useOrganizationMemberManagementModel).toBe(mod.useOrganizationMemberManagement);
    });
  });

  describe('context safety', () => {
    it('throws when a compound part is rendered outside Root', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<OrganizationMemberManagement.Content />)).toThrow(
        /must be rendered inside <OrganizationMemberManagement.Root>/,
      );
      consoleError.mockRestore();
    });
  });
});
