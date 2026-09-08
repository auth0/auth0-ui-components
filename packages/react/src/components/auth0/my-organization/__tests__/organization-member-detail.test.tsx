import { type ComponentAction, memberManagementQueryKeys } from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { OrganizationMemberDetail } from '@/components/auth0/my-organization/organization-member-detail';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockMember,
  createMockMemberRoles,
  createMockAvailableRoles,
  createMockOrganizationMemberDetailProps,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import { createTestQueryClient, renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';

mockToast();
const { initMockCoreClient } = mockCore();

const waitForComponentToLoad = async () => {
  return await screen.findByText('member.detail.back_button');
};

describe('OrganizationMemberDetail', () => {
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

  describe('rendering', () => {
    it('should render the back button', async () => {
      renderWithProviders(
        <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps()} />,
      );

      await waitForComponentToLoad();

      expect(screen.getByText('member.detail.back_button')).toBeInTheDocument();
    });

    it('should render the member display name in the header', async () => {
      renderWithProviders(
        <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps()} />,
      );

      await waitForComponentToLoad();

      expect(screen.getByRole('heading', { name: mockMember.name! })).toBeInTheDocument();
    });

    it('should render member user_id as a badge', async () => {
      renderWithProviders(
        <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps()} />,
      );

      await waitForComponentToLoad();

      expect(screen.getByText('auth0|testuser123')).toBeInTheDocument();
    });

    it('should render Details and Roles tabs', async () => {
      renderWithProviders(
        <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps()} />,
      );

      await waitForComponentToLoad();

      expect(screen.getByText('member.detail.tabs.details')).toBeInTheDocument();
      expect(screen.getByText('member.detail.tabs.roles')).toBeInTheDocument();
    });

    it('should default to the details tab being active', async () => {
      renderWithProviders(
        <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps()} />,
      );

      await waitForComponentToLoad();

      const detailsTab = screen.getByRole('tab', { name: 'member.detail.tabs.details' });
      expect(detailsTab).toHaveAttribute('data-state', 'active');
    });

    it('should show roles tab as active when initialTab is roles', async () => {
      renderWithProviders(
        <OrganizationMemberDetail
          {...createMockOrganizationMemberDetailProps()}
          initialTab="roles"
        />,
      );

      await waitForComponentToLoad();

      const rolesTab = screen.getByRole('tab', { name: 'member.detail.tabs.roles' });
      expect(rolesTab).toHaveAttribute('data-state', 'active');
    });
  });

  describe('member data', () => {
    it('should show initials from member name with multiple words', async () => {
      const member = createMockMember({ name: 'Test User' });
      (
        mockCoreClient.getMyOrganizationApiClient().organization.members.get as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue(member);

      renderWithProviders(
        <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps()} />,
      );

      await waitForComponentToLoad();

      expect(screen.getByText('TU')).toBeInTheDocument();
    });

    it('should show single initial when name has one word', async () => {
      const member = createMockMember({ name: 'Alice' });
      (
        mockCoreClient.getMyOrganizationApiClient().organization.members.get as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue(member);

      renderWithProviders(
        <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps()} />,
      );

      await waitForComponentToLoad();

      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('should show "U" initials when member has no name and no user_id', async () => {
      const member = createMockMember({ name: undefined, user_id: '' });
      (
        mockCoreClient.getMyOrganizationApiClient().organization.members.get as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue(member);

      renderWithProviders(
        <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps({ userId: '' })} />,
      );

      await waitForComponentToLoad();

      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('should use user_id as display name when name is missing', async () => {
      const member = createMockMember({ name: undefined, user_id: 'auth0|nameless' });
      (
        mockCoreClient.getMyOrganizationApiClient().organization.members.get as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue(member);

      renderWithProviders(
        <OrganizationMemberDetail
          {...createMockOrganizationMemberDetailProps({ userId: 'auth0|nameless' })}
        />,
      );

      await waitForComponentToLoad();

      expect(screen.getByRole('heading', { name: 'auth0|nameless' })).toBeInTheDocument();
    });
  });

  describe('onBack', () => {
    it('when onBack is provided and back button is clicked, should call onBack', async () => {
      const user = userEvent.setup();
      const onBack = vi.fn();

      renderWithProviders(
        <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps({ onBack })} />,
      );

      await waitForComponentToLoad();

      const backButton = screen.getByRole('button', { name: /member.detail.back_button/i });
      await user.click(backButton);

      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('when onBack is not provided, clicking back button should not throw', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationMemberDetail
          {...createMockOrganizationMemberDetailProps({ onBack: undefined })}
        />,
      );

      await waitForComponentToLoad();

      const backButton = screen.getByRole('button', { name: /member.detail.back_button/i });
      await expect(user.click(backButton)).resolves.not.toThrow();
    });
  });

  describe('tab navigation', () => {
    it('when user clicks the Roles tab, should show roles tab content', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps()} />,
      );

      await waitForComponentToLoad();

      const rolesTab = screen.getByRole('tab', { name: 'member.detail.tabs.roles' });
      await user.click(rolesTab);

      await waitFor(() => {
        expect(rolesTab).toHaveAttribute('data-state', 'active');
      });
    });

    it('when user clicks back to Details tab, should show details tab content', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps()} />,
      );

      await waitForComponentToLoad();

      const rolesTab = screen.getByRole('tab', { name: 'member.detail.tabs.roles' });
      await user.click(rolesTab);

      const detailsTab = screen.getByRole('tab', { name: 'member.detail.tabs.details' });
      await user.click(detailsTab);

      await waitFor(() => {
        expect(detailsTab).toHaveAttribute('data-state', 'active');
      });
    });
  });

  describe('removeFromOrganizationAction', () => {
    describe('removeFromOrganizationAction.onBefore', () => {
      describe('when returns true', () => {
        it('should call memberships.deleteMemberships and call onBack', async () => {
          const user = userEvent.setup();
          const onBack = vi.fn();
          const removeFromOrganizationAction: ComponentAction<string> = {
            disabled: false,
            onBefore: vi.fn(() => true),
            onAfter: vi.fn(),
          };

          const apiService = mockCoreClient.getMyOrganizationApiClient();
          (
            apiService.organization.memberships.deleteMemberships as ReturnType<typeof vi.fn>
          ).mockResolvedValue(undefined);

          renderWithProviders(
            <OrganizationMemberDetail
              {...createMockOrganizationMemberDetailProps({ onBack, removeFromOrganizationAction })}
            />,
          );

          await waitForComponentToLoad();

          const removeButton = screen.getByRole('button', {
            name: /member.detail.actions.remove_from_organization.button/i,
          });
          await user.click(removeButton);

          const confirmButton = await screen.findByRole('button', {
            name: /member.detail.actions.remove_from_organization.modal.confirm_button/i,
          });
          await user.click(confirmButton);

          await waitFor(() => {
            expect(apiService.organization.memberships.deleteMemberships).toHaveBeenCalledWith({
              members: ['auth0|testuser123'],
            });
            expect(onBack).toHaveBeenCalled();
          });
        });
      });

      describe('when returns false', () => {
        it('should not call memberships.deleteMemberships', async () => {
          const user = userEvent.setup();
          const removeFromOrganizationAction: ComponentAction<string> = {
            disabled: false,
            onBefore: vi.fn(() => false),
            onAfter: vi.fn(),
          };

          const apiService = mockCoreClient.getMyOrganizationApiClient();
          (
            apiService.organization.memberships.deleteMemberships as ReturnType<typeof vi.fn>
          ).mockResolvedValue(undefined);

          renderWithProviders(
            <OrganizationMemberDetail
              {...createMockOrganizationMemberDetailProps({ removeFromOrganizationAction })}
            />,
          );

          await waitForComponentToLoad();

          const removeButton = screen.getByRole('button', {
            name: /member.detail.actions.remove_from_organization.button/i,
          });
          await user.click(removeButton);

          const confirmButton = await screen.findByRole('button', {
            name: /member.detail.actions.remove_from_organization.modal.confirm_button/i,
          });
          await user.click(confirmButton);

          await waitFor(() => {
            expect(removeFromOrganizationAction.onBefore).toHaveBeenCalled();
          });

          expect(apiService.organization.memberships.deleteMemberships).not.toHaveBeenCalled();
        });
      });
    });

    describe('removeFromOrganizationAction.onAfter', () => {
      it('when remove from org succeeds, should call onAfter with userId', async () => {
        const user = userEvent.setup();
        const removeFromOrganizationAction: ComponentAction<string> = {
          disabled: false,
          onBefore: vi.fn(() => true),
          onAfter: vi.fn(),
        };

        const apiService = mockCoreClient.getMyOrganizationApiClient();
        (
          apiService.organization.memberships.deleteMemberships as ReturnType<typeof vi.fn>
        ).mockResolvedValue(undefined);

        renderWithProviders(
          <OrganizationMemberDetail
            {...createMockOrganizationMemberDetailProps({ removeFromOrganizationAction })}
          />,
        );

        await waitForComponentToLoad();

        const removeButton = screen.getByRole('button', {
          name: /member.detail.actions.remove_from_organization.button/i,
        });
        await user.click(removeButton);

        const confirmButton = await screen.findByRole('button', {
          name: /member.detail.actions.remove_from_organization.modal.confirm_button/i,
        });
        await user.click(confirmButton);

        await waitFor(() => {
          expect(removeFromOrganizationAction.onAfter).toHaveBeenCalledWith('auth0|testuser123');
        });
      });
    });
  });

  describe('assignRolesAction', () => {
    describe('when assign roles button is clicked', () => {
      it('should open the assign roles modal', async () => {
        const user = userEvent.setup();

        renderWithProviders(
          <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps()} />,
        );

        await waitForComponentToLoad();

        const rolesTab = screen.getByRole('tab', { name: 'member.detail.tabs.roles' });
        await user.click(rolesTab);

        const assignButton = await screen.findByRole('button', {
          name: /member.detail.roles.assign_button/i,
        });
        await user.click(assignButton);

        await screen.findByText('member.detail.roles.assign_modal.title');
      });
    });

    describe('assignRolesAction.onBefore', () => {
      describe('when returns true', () => {
        it('should call members.roles.assign', async () => {
          const user = userEvent.setup();
          const assignRolesAction: ComponentAction<{ userId: string; roleIds: string[] }> = {
            disabled: false,
            onBefore: vi.fn(() => true),
            onAfter: vi.fn(),
          };

          const apiService = mockCoreClient.getMyOrganizationApiClient();
          (
            apiService.organization.members.roles.assign as ReturnType<typeof vi.fn>
          ).mockResolvedValue({});

          renderWithProviders(
            <OrganizationMemberDetail
              {...createMockOrganizationMemberDetailProps({ assignRolesAction })}
            />,
          );

          await waitForComponentToLoad();

          const rolesTab = screen.getByRole('tab', { name: 'member.detail.tabs.roles' });
          await user.click(rolesTab);

          const assignButton = await screen.findByRole('button', {
            name: /member.detail.roles.assign_button/i,
          });
          await user.click(assignButton);

          await screen.findByText('member.detail.roles.assign_modal.title');

          const comboboxInput = screen.getByPlaceholderText(
            'member.detail.roles.assign_modal.roles_placeholder',
          );
          await user.click(comboboxInput);

          await user.click(await screen.findByRole('button', { name: /admin/i }));

          await user.click(
            screen.getByRole('button', {
              name: /member.detail.roles.assign_modal.submit_button/i,
            }),
          );

          await waitFor(() => {
            expect(assignRolesAction.onBefore).toHaveBeenCalled();
            expect(apiService.organization.members.roles.assign).toHaveBeenCalled();
          });
        });
      });

      describe('when returns false', () => {
        it('should not call members.roles.assign', async () => {
          const user = userEvent.setup();
          const assignRolesAction: ComponentAction<{ userId: string; roleIds: string[] }> = {
            disabled: false,
            onBefore: vi.fn(() => false),
            onAfter: vi.fn(),
          };

          const apiService = mockCoreClient.getMyOrganizationApiClient();
          (
            apiService.organization.members.roles.assign as ReturnType<typeof vi.fn>
          ).mockResolvedValue({});

          renderWithProviders(
            <OrganizationMemberDetail
              {...createMockOrganizationMemberDetailProps({ assignRolesAction })}
            />,
          );

          await waitForComponentToLoad();

          const rolesTab = screen.getByRole('tab', { name: 'member.detail.tabs.roles' });
          await user.click(rolesTab);

          const assignButton = await screen.findByRole('button', {
            name: /member.detail.roles.assign_button/i,
          });
          await user.click(assignButton);

          await screen.findByText('member.detail.roles.assign_modal.title');

          const comboboxInput = screen.getByPlaceholderText(
            'member.detail.roles.assign_modal.roles_placeholder',
          );
          await user.click(comboboxInput);

          await user.click(await screen.findByRole('button', { name: /admin/i }));

          await user.click(
            screen.getByRole('button', {
              name: /member.detail.roles.assign_modal.submit_button/i,
            }),
          );

          await waitFor(() => {
            expect(assignRolesAction.onBefore).toHaveBeenCalled();
          });

          expect(apiService.organization.members.roles.assign).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('removeRolesAction', () => {
    const memberWithRoles = createMockMember({ roles: createMockMemberRoles() });

    beforeEach(() => {
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      (apiService.organization.members.roles.list as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: createMockMemberRoles(),
      });
    });

    describe('removeRolesAction.onBefore', () => {
      describe('when returns true', () => {
        it('should call members.roles.unassignLegacy', async () => {
          const user = userEvent.setup();
          const removeRolesAction: ComponentAction<{ userId: string; roleIds: string[] }> = {
            disabled: false,
            onBefore: vi.fn(() => true),
            onAfter: vi.fn(),
          };

          const apiService = mockCoreClient.getMyOrganizationApiClient();
          (apiService.organization.members.get as ReturnType<typeof vi.fn>).mockResolvedValue(
            memberWithRoles,
          );
          (
            apiService.organization.members.roles.unassignLegacy as ReturnType<typeof vi.fn>
          ).mockResolvedValue({});

          renderWithProviders(
            <OrganizationMemberDetail
              {...createMockOrganizationMemberDetailProps({ removeRolesAction })}
            />,
          );

          await waitForComponentToLoad();

          const rolesTab = screen.getByRole('tab', { name: 'member.detail.tabs.roles' });
          await user.click(rolesTab);

          const removeRoleButtons = await screen.findAllByRole('button', {
            name: /member.detail.roles.remove_confirm.confirm_button|remove/i,
          });

          await user.click(removeRoleButtons[0]!);

          const confirmButton = await screen.findByRole('button', {
            name: /member.detail.roles.remove_confirm.confirm_button/i,
          });
          await user.click(confirmButton);

          await waitFor(() => {
            expect(apiService.organization.members.roles.unassignLegacy).toHaveBeenCalled();
          });
        });
      });

      describe('when returns false', () => {
        it('should not call members.roles.unassignLegacy', async () => {
          const user = userEvent.setup();
          const removeRolesAction: ComponentAction<{ userId: string; roleIds: string[] }> = {
            disabled: false,
            onBefore: vi.fn(() => false),
            onAfter: vi.fn(),
          };

          const apiService = mockCoreClient.getMyOrganizationApiClient();
          (apiService.organization.members.get as ReturnType<typeof vi.fn>).mockResolvedValue(
            memberWithRoles,
          );
          (
            apiService.organization.members.roles.unassignLegacy as ReturnType<typeof vi.fn>
          ).mockResolvedValue({});

          renderWithProviders(
            <OrganizationMemberDetail
              {...createMockOrganizationMemberDetailProps({ removeRolesAction })}
            />,
          );

          await waitForComponentToLoad();

          const rolesTab = screen.getByRole('tab', { name: 'member.detail.tabs.roles' });
          await user.click(rolesTab);

          const removeRoleButtons = await screen.findAllByRole('button', {
            name: /member.detail.roles.remove_confirm.confirm_button|remove/i,
          });

          await user.click(removeRoleButtons[0]!);

          const confirmButton = await screen.findByRole('button', {
            name: /member.detail.roles.remove_confirm.confirm_button/i,
          });
          await user.click(confirmButton);

          await waitFor(() => {
            expect(removeRolesAction.onBefore).toHaveBeenCalled();
          });

          expect(apiService.organization.members.roles.unassignLegacy).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('cache invalidation on role mutation', () => {
    it('should invalidate member list cache after assigning roles', async () => {
      const user = userEvent.setup();
      const queryClient = createTestQueryClient();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const apiService = mockCoreClient.getMyOrganizationApiClient();
      (apiService.organization.members.roles.assign as ReturnType<typeof vi.fn>).mockResolvedValue(
        {},
      );

      renderWithProviders(
        <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps()} />,
        { queryClient },
      );

      await waitForComponentToLoad();

      const rolesTab = screen.getByRole('tab', { name: 'member.detail.tabs.roles' });
      await user.click(rolesTab);

      const assignButton = await screen.findByRole('button', {
        name: /member.detail.roles.assign_button/i,
      });
      await user.click(assignButton);

      await screen.findByText('member.detail.roles.assign_modal.title');

      const comboboxInput = screen.getByPlaceholderText(
        'member.detail.roles.assign_modal.roles_placeholder',
      );
      await user.click(comboboxInput);
      await user.click(await screen.findByRole('button', { name: /admin/i }));

      await user.click(
        screen.getByRole('button', {
          name: /member.detail.roles.assign_modal.submit_button/i,
        }),
      );

      await waitFor(() => {
        expect(apiService.organization.members.roles.assign).toHaveBeenCalled();
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: memberManagementQueryKeys.all,
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: memberManagementQueryKeys.memberRoles(mockMember.user_id ?? ''),
      });
    });

    it('should invalidate member list cache after removing roles', async () => {
      const user = userEvent.setup();
      const queryClient = createTestQueryClient();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const apiService = mockCoreClient.getMyOrganizationApiClient();
      (apiService.organization.members.get as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockMember({ roles: createMockMemberRoles() }),
      );
      (apiService.organization.members.roles.list as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: createMockMemberRoles(),
      });
      (
        apiService.organization.members.roles.unassignLegacy as ReturnType<typeof vi.fn>
      ).mockResolvedValue({});

      renderWithProviders(
        <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps()} />,
        { queryClient },
      );

      await waitForComponentToLoad();

      const rolesTab = screen.getByRole('tab', { name: 'member.detail.tabs.roles' });
      await user.click(rolesTab);

      const removeRoleButtons = await screen.findAllByRole('button', {
        name: /member.detail.roles.remove_confirm.confirm_button|remove/i,
      });
      await user.click(removeRoleButtons[0]!);

      const confirmButton = await screen.findByRole('button', {
        name: /member.detail.roles.remove_confirm.confirm_button/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(apiService.organization.members.roles.unassignLegacy).toHaveBeenCalled();
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: memberManagementQueryKeys.members(),
      });
    });
  });

  describe('member fetch error state', () => {
    it('when members.get fails with a backend message, should show backend message in place of tabs', async () => {
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      (apiService.organization.members.get as ReturnType<typeof vi.fn>).mockRejectedValue(
        Object.assign(new Error(), { body: { detail: 'Organization or member not found.' } }),
      );

      renderWithProviders(
        <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps()} />,
      );

      await waitFor(() => {
        expect(screen.getByText('Organization or member not found.')).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('tab', { name: 'member.detail.tabs.details' }),
      ).not.toBeInTheDocument();
    });

    it('when members.get fails without a backend message, should show fallback message', async () => {
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      (apiService.organization.members.get as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('member.detail.error.fetch_failed'),
      );

      renderWithProviders(
        <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps()} />,
      );

      await waitFor(() => {
        expect(screen.getByText('member.detail.error.fetch_failed')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('when members.get fails, should not call members.roles.list', async () => {
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      (apiService.organization.members.get as ReturnType<typeof vi.fn>).mockRejectedValue(
        Object.assign(new Error(), {
          body: { detail: 'User is not a member of this organization.' },
        }),
      );

      renderWithProviders(
        <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps()} />,
      );

      await waitFor(() => {
        expect(screen.getByText('User is not a member of this organization.')).toBeInTheDocument();
      });

      expect(apiService.organization.members.roles.list).not.toHaveBeenCalled();
    });

    it('when members.roles.list fails, should show a fetch_roles_failed toast', async () => {
      const { mockedShowToast } = mockToast();
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      (apiService.organization.members.roles.list as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error'),
      );

      renderWithProviders(
        <OrganizationMemberDetail {...createMockOrganizationMemberDetailProps()} />,
      );

      await waitFor(() => {
        expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
      });
    });
  });

  describe('customMessages', () => {
    it('should override the back button text', async () => {
      renderWithProviders(
        <OrganizationMemberDetail
          {...createMockOrganizationMemberDetailProps({
            customMessages: {
              member: {
                detail: {
                  back_button: 'Go Back',
                },
              },
            },
          })}
        />,
      );

      await screen.findByText('Go Back');

      expect(screen.getByText('Go Back')).toBeInTheDocument();
      expect(screen.queryByText('member.detail.back_button')).not.toBeInTheDocument();
    });
  });

  describe('styling', () => {
    describe('when styling.classes are provided', () => {
      it('should apply custom class to root div', async () => {
        renderWithProviders(
          <OrganizationMemberDetail
            {...createMockOrganizationMemberDetailProps({
              styling: {
                variables: { common: {}, light: {}, dark: {} },
                classes: {
                  'OrganizationMemberDetail-root': 'custom-root-class',
                },
              },
            })}
          />,
        );

        await waitForComponentToLoad();

        expect(document.querySelector('.custom-root-class')).toBeInTheDocument();
      });
    });
  });
});
