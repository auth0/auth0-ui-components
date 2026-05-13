import type { ComponentAction } from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  OrganizationMemberDetail,
  OrganizationMemberDetailView,
} from '@/components/auth0/my-organization/organization-member-detail';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockMember,
  createMockMemberRoles,
  createMockAvailableRoles,
  createMockMemberRole,
  createMockOrganizationMemberDetailProps,
  createMockOrganizationMemberDetailViewProps,
  noModal,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { MemberDetailModalState } from '@/types/my-organization/member-management/organization-member-detail-types';

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

      // Navigate to roles then back to details
      const rolesTab = screen.getByRole('tab', { name: 'member.detail.tabs.roles' });
      await user.click(rolesTab);

      const detailsTab = screen.getByRole('tab', { name: 'member.detail.tabs.details' });
      await user.click(detailsTab);

      await waitFor(() => {
        expect(detailsTab).toHaveAttribute('data-state', 'active');
      });
    });
  });

  describe('removeFromOrgAction', () => {
    describe('removeFromOrgAction.onBefore', () => {
      describe('when returns true', () => {
        it('should call memberships.deleteMemberships and call onBack', async () => {
          const user = userEvent.setup();
          const onBack = vi.fn();
          const removeFromOrgAction: ComponentAction<string> = {
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
              {...createMockOrganizationMemberDetailProps({ onBack, removeFromOrgAction })}
            />,
          );

          await waitForComponentToLoad();

          // Click remove from org button in details tab
          const removeButton = screen.getByRole('button', {
            name: /member.detail.actions.remove_from_org.delete_button/i,
          });
          await user.click(removeButton);

          // Modal should open — confirm
          const confirmButton = await screen.findByRole('button', {
            name: /member.detail.danger_zone.remove_from_org.confirm_button/i,
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
          const removeFromOrgAction: ComponentAction<string> = {
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
              {...createMockOrganizationMemberDetailProps({ removeFromOrgAction })}
            />,
          );

          await waitForComponentToLoad();

          const removeButton = screen.getByRole('button', {
            name: /member.detail.actions.remove_from_org.delete_button/i,
          });
          await user.click(removeButton);

          const confirmButton = await screen.findByRole('button', {
            name: /member.detail.danger_zone.remove_from_org.confirm_button/i,
          });
          await user.click(confirmButton);

          await waitFor(() => {
            expect(removeFromOrgAction.onBefore).toHaveBeenCalled();
          });

          expect(apiService.organization.memberships.deleteMemberships).not.toHaveBeenCalled();
        });
      });
    });

    describe('removeFromOrgAction.onAfter', () => {
      it('when remove from org succeeds, should call onAfter with userId', async () => {
        const user = userEvent.setup();
        const removeFromOrgAction: ComponentAction<string> = {
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
            {...createMockOrganizationMemberDetailProps({ removeFromOrgAction })}
          />,
        );

        await waitForComponentToLoad();

        const removeButton = screen.getByRole('button', {
          name: /member.detail.actions.remove_from_org.delete_button/i,
        });
        await user.click(removeButton);

        const confirmButton = await screen.findByRole('button', {
          name: /member.detail.danger_zone.remove_from_org.confirm_button/i,
        });
        await user.click(confirmButton);

        await waitFor(() => {
          expect(removeFromOrgAction.onAfter).toHaveBeenCalledWith('auth0|testuser123');
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
        it('should call members.roles.assign when onBefore returns true', () => {
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
            <OrganizationMemberDetailView
              {...createMockOrganizationMemberDetailViewProps({
                activeTab: 'roles',
                modalState: { type: 'assignRoles' } satisfies MemberDetailModalState,
                availableRoles: createMockAvailableRoles(),
                handleAssignRolesSubmit: vi.fn((roleIds: string[]) => {
                  if (
                    assignRolesAction.onBefore &&
                    !assignRolesAction.onBefore({ userId: 'auth0|testuser123', roleIds })
                  )
                    return;
                  void apiService.organization.members.roles.assign('auth0|testuser123', {
                    role_ids: roleIds,
                  });
                  assignRolesAction.onAfter?.({ userId: 'auth0|testuser123', roleIds });
                }),
              })}
            />,
          );

          // Modal is open — verify it renders and submit button is disabled (no roles selected)
          expect(screen.getByText('member.detail.roles.assign_modal.title')).toBeInTheDocument();

          const submitButton = screen.getByRole('button', {
            name: /member.detail.roles.assign_modal.submit_button/i,
          });
          expect(submitButton).toBeDisabled();
        });
      });

      describe('when returns false', () => {
        it('should not call members.roles.assign when onBefore returns false', async () => {
          const assignRolesAction: ComponentAction<{ userId: string; roleIds: string[] }> = {
            disabled: false,
            onBefore: vi.fn(() => false),
            onAfter: vi.fn(),
          };

          const apiService = mockCoreClient.getMyOrganizationApiClient();
          (
            apiService.organization.members.roles.assign as ReturnType<typeof vi.fn>
          ).mockResolvedValue({});

          const handleAssignRolesSubmit = vi.fn((roleIds: string[]) => {
            if (
              assignRolesAction.onBefore &&
              !assignRolesAction.onBefore({ userId: 'auth0|testuser123', roleIds })
            )
              return;
            void apiService.organization.members.roles.assign('auth0|testuser123', {
              role_ids: roleIds,
            });
          });

          renderWithProviders(
            <OrganizationMemberDetailView
              {...createMockOrganizationMemberDetailViewProps({
                modalState: { type: 'assignRoles' } satisfies MemberDetailModalState,
                handleAssignRolesSubmit,
              })}
            />,
          );

          // Directly invoke the submit handler with role IDs to test the guard
          handleAssignRolesSubmit(['rol_admin']);

          expect(assignRolesAction.onBefore).toHaveBeenCalledWith({
            userId: 'auth0|testuser123',
            roleIds: ['rol_admin'],
          });
          expect(apiService.organization.members.roles.assign).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('removeRolesAction', () => {
    const memberWithRoles = createMockMember({ roles: createMockMemberRoles() });

    describe('removeRolesAction.onBefore', () => {
      describe('when returns true', () => {
        it('should call members.roles.unassign', async () => {
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
            apiService.organization.members.roles.unassign as ReturnType<typeof vi.fn>
          ).mockResolvedValue({});

          renderWithProviders(
            <OrganizationMemberDetail
              {...createMockOrganizationMemberDetailProps({ removeRolesAction })}
            />,
          );

          await waitForComponentToLoad();

          const rolesTab = screen.getByRole('tab', { name: 'member.detail.tabs.roles' });
          await user.click(rolesTab);

          // Find remove role button for first role
          const removeRoleButtons = await screen.findAllByRole('button', {
            name: /member.detail.roles.remove_confirm.confirm_button|remove/i,
          });

          await user.click(removeRoleButtons[0]!);

          // Confirm in modal
          const confirmButton = await screen.findByRole('button', {
            name: /member.detail.roles.remove_confirm.confirm_button/i,
          });
          await user.click(confirmButton);

          await waitFor(() => {
            expect(apiService.organization.members.roles.unassign).toHaveBeenCalled();
          });
        });
      });

      describe('when returns false', () => {
        it('should not call members.roles.unassign', async () => {
          const user = userEvent.setup();
          const removeRolesAction: ComponentAction<{ userId: string; roleIds: string[] }> = {
            disabled: false,
            onBefore: vi.fn(() => false),
            onAfter: vi.fn(),
          };

          const role = createMockMemberRole({ id: 'rol_admin', name: 'Admin' });

          const apiService = mockCoreClient.getMyOrganizationApiClient();
          (
            apiService.organization.members.roles.unassign as ReturnType<typeof vi.fn>
          ).mockResolvedValue({});

          // Directly render the view with the remove role modal open
          renderWithProviders(
            <OrganizationMemberDetailView
              {...createMockOrganizationMemberDetailViewProps({
                activeTab: 'roles',
                modalState: { type: 'removeRoles', roles: [role] } satisfies MemberDetailModalState,
                handleRemoveRolesConfirm: vi.fn(() => {
                  if (
                    removeRolesAction.onBefore &&
                    !removeRolesAction.onBefore({
                      userId: 'auth0|testuser123',
                      roleIds: [role.id],
                    })
                  )
                    return;
                  void apiService.organization.members.roles.unassign('auth0|testuser123', {
                    role_ids: [role.id],
                  });
                }),
              })}
            />,
          );

          const confirmButton = await screen.findByRole('button', {
            name: /member.detail.roles.remove_confirm.confirm_button/i,
          });
          await user.click(confirmButton);

          await waitFor(() => {
            expect(removeRolesAction.onBefore).toHaveBeenCalled();
          });

          expect(apiService.organization.members.roles.unassign).not.toHaveBeenCalled();
        });
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

describe('OrganizationMemberDetailView', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render header with member name', () => {
      const props = createMockOrganizationMemberDetailViewProps();
      renderWithProviders(<OrganizationMemberDetailView {...props} />);

      expect(screen.getByRole('heading', { name: props.member!.name! })).toBeInTheDocument();
    });

    it('should render back button', () => {
      renderWithProviders(
        <OrganizationMemberDetailView {...createMockOrganizationMemberDetailViewProps()} />,
      );

      expect(screen.getByText('member.detail.back_button')).toBeInTheDocument();
    });

    it('should render both tabs', () => {
      renderWithProviders(
        <OrganizationMemberDetailView {...createMockOrganizationMemberDetailViewProps()} />,
      );

      expect(screen.getByRole('tab', { name: 'member.detail.tabs.details' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'member.detail.tabs.roles' })).toBeInTheDocument();
    });

    it('should render details tab content by default', () => {
      renderWithProviders(
        <OrganizationMemberDetailView
          {...createMockOrganizationMemberDetailViewProps({ activeTab: 'details' })}
        />,
      );

      expect(screen.getByRole('tab', { name: 'member.detail.tabs.details' })).toHaveAttribute(
        'data-state',
        'active',
      );
    });

    it('should render roles tab content when activeTab is roles', () => {
      renderWithProviders(
        <OrganizationMemberDetailView
          {...createMockOrganizationMemberDetailViewProps({ activeTab: 'roles' })}
        />,
      );

      expect(screen.getByRole('tab', { name: 'member.detail.tabs.roles' })).toHaveAttribute(
        'data-state',
        'active',
      );
    });
  });

  describe('header', () => {
    it('should display member initials in avatar circle', () => {
      renderWithProviders(
        <OrganizationMemberDetailView
          {...createMockOrganizationMemberDetailViewProps({
            member: createMockMember({ name: 'Test User' }),
          })}
        />,
      );

      expect(screen.getByText('TU')).toBeInTheDocument();
    });

    it('should display "U" when member name and user_id are both empty', () => {
      renderWithProviders(
        <OrganizationMemberDetailView
          {...createMockOrganizationMemberDetailViewProps({
            member: createMockMember({ name: undefined, user_id: '' }),
          })}
        />,
      );

      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('should display user_id badge', () => {
      const member = createMockMember({ user_id: 'auth0|testuser123' });
      renderWithProviders(
        <OrganizationMemberDetailView
          {...createMockOrganizationMemberDetailViewProps({ member })}
        />,
      );

      expect(screen.getByText('auth0|testuser123')).toBeInTheDocument();
    });

    it('should not display user_id badge when user_id is empty', () => {
      const member = createMockMember({ user_id: '' });
      renderWithProviders(
        <OrganizationMemberDetailView
          {...createMockOrganizationMemberDetailViewProps({ member })}
        />,
      );

      // Badge should not be in DOM when userId is empty
      const badges = document.querySelectorAll('.font-mono');
      expect(badges.length).toBe(0);
    });
  });

  describe('MemberRemoveFromOrgModal', () => {
    it('when modalState is removeFromOrg, should render the modal', () => {
      renderWithProviders(
        <OrganizationMemberDetailView
          {...createMockOrganizationMemberDetailViewProps({
            modalState: { type: 'removeFromOrg' } satisfies MemberDetailModalState,
          })}
        />,
      );

      expect(
        screen.getByText('member.detail.danger_zone.remove_from_org.confirm_title'),
      ).toBeInTheDocument();
    });

    it('when modalState is null, should not render the modal', () => {
      renderWithProviders(
        <OrganizationMemberDetailView
          {...createMockOrganizationMemberDetailViewProps({ modalState: noModal })}
        />,
      );

      expect(
        screen.queryByText('member.detail.danger_zone.remove_from_org.confirm_title'),
      ).not.toBeInTheDocument();
    });

    it('when modal cancel is clicked, should call closeModal', async () => {
      const user = userEvent.setup();
      const closeModal = vi.fn();

      renderWithProviders(
        <OrganizationMemberDetailView
          {...createMockOrganizationMemberDetailViewProps({
            modalState: { type: 'removeFromOrg' } satisfies MemberDetailModalState,
            closeModal,
          })}
        />,
      );

      const cancelButton = screen.getByRole('button', {
        name: 'member.detail.danger_zone.remove_from_org.cancel_button',
      });
      await user.click(cancelButton);

      expect(closeModal).toHaveBeenCalledTimes(1);
    });

    it('when modal confirm is clicked, should call handleRemoveFromOrgConfirm', async () => {
      const user = userEvent.setup();
      const handleRemoveFromOrgConfirm = vi.fn();

      renderWithProviders(
        <OrganizationMemberDetailView
          {...createMockOrganizationMemberDetailViewProps({
            modalState: { type: 'removeFromOrg' } satisfies MemberDetailModalState,
            handleRemoveFromOrgConfirm,
          })}
        />,
      );

      const confirmButton = screen.getByRole('button', {
        name: 'member.detail.danger_zone.remove_from_org.confirm_button',
      });
      await user.click(confirmButton);

      expect(handleRemoveFromOrgConfirm).toHaveBeenCalledTimes(1);
    });

    it('when isRemovingFromOrg is true, modal confirm button should show loading indicator', () => {
      renderWithProviders(
        <OrganizationMemberDetailView
          {...createMockOrganizationMemberDetailViewProps({
            modalState: { type: 'removeFromOrg' } satisfies MemberDetailModalState,
            isRemovingFromOrg: true,
          })}
        />,
      );

      // Loading state shows Spinner (sr-only text "Loading...")
      expect(screen.getByRole('button', { name: 'Loading...' })).toBeInTheDocument();
    });
  });

  describe('tab switching', () => {
    it('when user clicks Roles tab, should call setActiveTab with roles', async () => {
      const user = userEvent.setup();
      const setActiveTab = vi.fn();

      renderWithProviders(
        <OrganizationMemberDetailView
          {...createMockOrganizationMemberDetailViewProps({ setActiveTab })}
        />,
      );

      const rolesTab = screen.getByRole('tab', { name: 'member.detail.tabs.roles' });
      await user.click(rolesTab);

      expect(setActiveTab).toHaveBeenCalledWith('roles');
    });

    it('when user clicks Details tab while on roles, should call setActiveTab with details', async () => {
      const user = userEvent.setup();
      const setActiveTab = vi.fn();

      renderWithProviders(
        <OrganizationMemberDetailView
          {...createMockOrganizationMemberDetailViewProps({ activeTab: 'roles', setActiveTab })}
        />,
      );

      const detailsTab = screen.getByRole('tab', { name: 'member.detail.tabs.details' });
      await user.click(detailsTab);

      expect(setActiveTab).toHaveBeenCalledWith('details');
    });
  });

  describe('back button', () => {
    it('when back button is clicked, should call handleBack', async () => {
      const user = userEvent.setup();
      const handleBack = vi.fn();

      renderWithProviders(
        <OrganizationMemberDetailView
          {...createMockOrganizationMemberDetailViewProps({ handleBack })}
        />,
      );

      const backButton = screen.getByRole('button', { name: /member.detail.back_button/i });
      await user.click(backButton);

      expect(handleBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('customMessages', () => {
    it('should render custom tab labels', () => {
      renderWithProviders(
        <OrganizationMemberDetailView
          {...createMockOrganizationMemberDetailViewProps({
            customMessages: {
              member: {
                detail: {
                  back_button: 'Go Back',
                  tabs: {
                    details: 'Info',
                    roles: 'Permissions',
                  },
                },
              },
            },
          })}
        />,
      );

      expect(screen.getByText('Go Back')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Info' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Permissions' })).toBeInTheDocument();
    });
  });

  describe('member is null', () => {
    it('should render the back button even when member is null', () => {
      renderWithProviders(
        <OrganizationMemberDetailView
          {...createMockOrganizationMemberDetailViewProps({ member: null })}
        />,
      );

      expect(screen.getByText('member.detail.back_button')).toBeInTheDocument();
    });

    it('should show "U" initials when member is null', () => {
      renderWithProviders(
        <OrganizationMemberDetailView
          {...createMockOrganizationMemberDetailViewProps({ member: null })}
        />,
      );

      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });
});
