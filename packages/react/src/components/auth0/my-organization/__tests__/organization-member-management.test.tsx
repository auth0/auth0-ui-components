import type { ComponentAction, MemberInvitation } from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { OrganizationMemberManagement } from '@/components/auth0/my-organization/organization-member-management';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockInvitation,
  createMockPendingInvitation,
} from '@/tests/utils/__mocks__/my-organization/member-management/invitation.mocks';
import {
  createMockMember,
  createMockRoleOptions,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { CreateInvitationInput } from '@/types/my-organization/member-management/organization-invitation-table-types';
import type {
  OrganizationMemberManagementProps,
  ViewMemberDetailsParams,
} from '@/types/my-organization/member-management/organization-member-management-types';

mockToast();
const { initMockCoreClient } = mockCore();

const createMockComponentProps = (
  overrides?: Partial<OrganizationMemberManagementProps>,
): OrganizationMemberManagementProps => ({
  styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  customMessages: {},
  hideHeader: false,
  readOnly: false,
  ...overrides,
});

const waitForComponentToLoad = async () => {
  return await screen.findByText(/header\.title/i);
};

describe('OrganizationMemberManagement', () => {
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

  describe('rendering', () => {
    it('should render the header with title and description', async () => {
      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      expect(screen.getByText(/header\.title/i)).toBeInTheDocument();
      expect(screen.getByText(/header\.description/i)).toBeInTheDocument();
    });

    it('should render the invite button when not read-only', async () => {
      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      expect(screen.getByRole('button', { name: /invite_button/i })).toBeInTheDocument();
    });

    it('should render members and invitations tabs', async () => {
      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      expect(screen.getByRole('tab', { name: /tabs\.members/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /tabs\.invitations/i })).toBeInTheDocument();
    });

    it('should render member table in members tab by default', async () => {
      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      expect(screen.getByRole('tab', { name: /tabs\.members/i })).toHaveAttribute(
        'data-state',
        'active',
      );
    });
  });

  describe('hideHeader', () => {
    describe('when is false', () => {
      it('should render the header', async () => {
        renderWithProviders(
          <OrganizationMemberManagement {...createMockComponentProps({ hideHeader: false })} />,
        );

        await waitForComponentToLoad();

        expect(screen.getByText(/header\.title/i)).toBeInTheDocument();
      });
    });

    describe('when is true', () => {
      it('should not render the header', async () => {
        renderWithProviders(
          <OrganizationMemberManagement {...createMockComponentProps({ hideHeader: true })} />,
        );

        await waitFor(() => {
          expect(screen.getByRole('tab', { name: /tabs\.members/i })).toBeInTheDocument();
        });

        expect(screen.queryByText(/header\.title/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('readOnly', () => {
    describe('when is true', () => {
      it('should not render the invite button', async () => {
        renderWithProviders(
          <OrganizationMemberManagement {...createMockComponentProps({ readOnly: true })} />,
        );

        await waitFor(() => {
          expect(screen.getByRole('tab', { name: /tabs\.members/i })).toBeInTheDocument();
        });

        expect(screen.queryByRole('button', { name: /invite_button/i })).not.toBeInTheDocument();
      });
    });

    describe('when is false', () => {
      it('should render the invite button', async () => {
        renderWithProviders(
          <OrganizationMemberManagement {...createMockComponentProps({ readOnly: false })} />,
        );

        await waitForComponentToLoad();

        expect(screen.getByRole('button', { name: /invite_button/i })).toBeInTheDocument();
      });
    });
  });

  describe('customMessages', () => {
    describe('when using a custom message on header title', () => {
      it('should override header title', async () => {
        const customMessages = {
          header: {
            title: 'Custom Member Management',
          },
        };

        renderWithProviders(
          <OrganizationMemberManagement {...createMockComponentProps({ customMessages })} />,
        );

        await screen.findByText('Custom Member Management');

        expect(screen.getByText('Custom Member Management')).toBeInTheDocument();
      });
    });
  });

  describe('styling', () => {
    describe('styling.classes', () => {
      describe('when classes are provided for OrganizationMemberManagement-root', () => {
        it('should apply the class to the root element', async () => {
          const styling = {
            variables: { common: {}, light: {}, dark: {} },
            classes: {
              'OrganizationMemberManagement-root': 'custom-root-class',
            },
          };

          renderWithProviders(
            <OrganizationMemberManagement {...createMockComponentProps({ styling })} />,
          );

          await waitForComponentToLoad();

          const rootElement = document.querySelector('.custom-root-class');
          expect(rootElement).toBeInTheDocument();
        });
      });
    });
  });

  describe('tab navigation', () => {
    it('should switch to invitations tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      const invitationsTab = screen.getByRole('tab', { name: /tabs\.invitations/i });
      await user.click(invitationsTab);

      expect(invitationsTab).toHaveAttribute('data-state', 'active');
    });

    it('should switch back to members tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      const invitationsTab = screen.getByRole('tab', { name: /tabs\.invitations/i });
      await user.click(invitationsTab);

      const membersTab = screen.getByRole('tab', { name: /tabs\.members/i });
      await user.click(membersTab);

      expect(membersTab).toHaveAttribute('data-state', 'active');
    });
  });

  describe('createInvitationAction', () => {
    it('should open create invitation modal when invite button is clicked', async () => {
      const user = userEvent.setup();
      const createInvitationAction: ComponentAction<CreateInvitationInput, MemberInvitation> = {
        onBefore: vi.fn().mockReturnValue(true),
        onAfter: vi.fn(),
      };

      renderWithProviders(
        <OrganizationMemberManagement {...createMockComponentProps({ createInvitationAction })} />,
      );

      await waitForComponentToLoad();

      const inviteButton = screen.getByRole('button', { name: /invite_button/i });
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText(/invitation\.create\.title/i)).toBeInTheDocument();
      });
    });

    it('should call API when creating invitation', async () => {
      const user = userEvent.setup();
      const createdInvitation = createMockInvitation();

      (
        mockCoreClient.getMyOrganizationApiClient().organization.invitations.create as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue([createdInvitation]);

      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      const inviteButton = screen.getByRole('button', { name: /invite_button/i });
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText(/invitation\.create\.title/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText(/invitation\.create\.email_placeholder/i);
      await user.type(emailInput, 'test@example.com,');

      await user.click(screen.getByRole('combobox', { name: /connection/i }));
      await user.click(await screen.findByText('Acme Directory'));

      const submitButton = screen.getByRole('button', {
        name: /invitation\.create\.submit_button/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          mockCoreClient.getMyOrganizationApiClient().organization.invitations.create,
        ).toHaveBeenCalled();
      });
    });
  });

  describe('invitations tab', () => {
    it('should display invitations when switching to invitations tab', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      const invitationsTab = screen.getByRole('tab', { name: /tabs\.invitations/i });
      await user.click(invitationsTab);

      await waitFor(() => {
        expect(screen.getByText(mockInvitation.invitee?.email ?? '')).toBeInTheDocument();
      });
    });
  });

  describe('members tab', () => {
    it('should display member table in the members tab', async () => {
      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      expect(screen.getByRole('tab', { name: /tabs\.members/i })).toHaveAttribute(
        'data-state',
        'active',
      );
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.members.list,
      ).toHaveBeenCalled();
    });
  });

  describe('invitation actions', () => {
    it('should display invitations when switching to invitations tab', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      const invitationsTab = screen.getByRole('tab', { name: /tabs\.invitations/i });
      await user.click(invitationsTab);

      await waitFor(() => {
        expect(screen.getByText(mockInvitation.invitee?.email ?? '')).toBeInTheDocument();
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.invitations.list,
      ).toHaveBeenCalled();
    });

    it('should pass revokeInvitationAction callbacks to component', async () => {
      const user = userEvent.setup();
      const revokeInvitationAction: ComponentAction<MemberInvitation[]> = {
        onBefore: vi.fn().mockReturnValue(true),
        onAfter: vi.fn(),
      };

      renderWithProviders(
        <OrganizationMemberManagement {...createMockComponentProps({ revokeInvitationAction })} />,
      );

      await waitForComponentToLoad();

      const invitationsTab = screen.getByRole('tab', { name: /tabs\.invitations/i });
      await user.click(invitationsTab);

      await waitFor(() => {
        expect(screen.getByText(mockInvitation.invitee?.email ?? '')).toBeInTheDocument();
      });
    });

    it('should pass resendInvitationAction callbacks to component', async () => {
      const user = userEvent.setup();
      const resendInvitationAction: ComponentAction<MemberInvitation, MemberInvitation> = {
        onBefore: vi.fn().mockReturnValue(true),
        onAfter: vi.fn(),
      };

      renderWithProviders(
        <OrganizationMemberManagement {...createMockComponentProps({ resendInvitationAction })} />,
      );

      await waitForComponentToLoad();

      const invitationsTab = screen.getByRole('tab', { name: /tabs\.invitations/i });
      await user.click(invitationsTab);

      await waitFor(() => {
        expect(screen.getByText(mockInvitation.invitee?.email ?? '')).toBeInTheDocument();
      });
    });
  });

  describe('member actions', () => {
    it('should render members tab as active by default', async () => {
      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      expect(screen.getByRole('tab', { name: /tabs\.members/i })).toHaveAttribute(
        'data-state',
        'active',
      );
    });

    it('should fetch member data when members tab is active', async () => {
      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.members.list,
      ).toHaveBeenCalled();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should render with assignRolesAction prop', async () => {
      const assignRolesAction: ComponentAction<{ userId: string; roleIds: string[] }> = {
        onBefore: vi.fn().mockReturnValue(true),
        onAfter: vi.fn(),
      };

      renderWithProviders(
        <OrganizationMemberManagement {...createMockComponentProps({ assignRolesAction })} />,
      );

      await waitForComponentToLoad();

      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should render with removeFromOrganizationAction prop', async () => {
      const removeFromOrganizationAction: ComponentAction<string> = {
        onBefore: vi.fn().mockReturnValue(true),
        onAfter: vi.fn(),
      };

      renderWithProviders(
        <OrganizationMemberManagement
          {...createMockComponentProps({ removeFromOrganizationAction })}
        />,
      );

      await waitForComponentToLoad();

      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should call viewMemberDetailsAction.onAfter with ViewMemberDetailsParams when view details is clicked', async () => {
      const user = userEvent.setup();
      const onAfter = vi.fn();
      const viewMemberDetailsAction: ComponentAction<ViewMemberDetailsParams> = {
        onAfter,
      };

      renderWithProviders(
        <OrganizationMemberManagement {...createMockComponentProps({ viewMemberDetailsAction })} />,
      );

      await waitForComponentToLoad();

      const actionMenuButton = screen.getByRole('button', {
        name: /member\.actions\.menu_label/i,
      });
      await user.click(actionMenuButton);

      await waitFor(() => {
        expect(screen.getByText(/member\.actions\.view_details/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/member\.actions\.view_details/i));

      await waitFor(() => {
        expect(onAfter).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: mockMember.user_id,
          }),
        );
      });
    });

    it('should call viewMemberDetailsAction.onAfter with tab "roles" when +More roles button is clicked', async () => {
      const user = userEvent.setup();
      const onAfter = vi.fn();
      const viewMemberDetailsAction: ComponentAction<ViewMemberDetailsParams> = {
        onAfter,
      };

      const memberWithManyRoles = createMockMember({
        user_id: 'auth0|user_many_roles',
        roles: [
          { id: 'r1', name: 'Admin' },
          { id: 'r2', name: 'Member' },
          { id: 'r3', name: 'Viewer' },
        ],
      });

      (
        mockCoreClient.getMyOrganizationApiClient().organization.members.list as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue({
        data: [memberWithManyRoles],
        response: { next: null, total: 1 },
      });

      renderWithProviders(
        <OrganizationMemberManagement {...createMockComponentProps({ viewMemberDetailsAction })} />,
      );

      await waitForComponentToLoad();

      const moreButton = screen.getByRole('button', { name: /member\.table\.view_all_roles/i });
      await user.click(moreButton);

      await waitFor(() => {
        expect(onAfter).toHaveBeenCalledWith({
          userId: 'auth0|user_many_roles',
          tab: 'roles',
        });
      });
    });
  });

  describe('readOnly mode in invitations', () => {
    it('should not show action buttons in invitations tab when readOnly', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationMemberManagement {...createMockComponentProps({ readOnly: true })} />,
      );

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /tabs\.members/i })).toBeInTheDocument();
      });

      const invitationsTab = screen.getByRole('tab', { name: /tabs\.invitations/i });
      await user.click(invitationsTab);

      await waitFor(() => {
        expect(screen.getByText(mockInvitation.invitee?.email ?? '')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /invite_button/i })).not.toBeInTheDocument();
    });
  });

  describe('empty states', () => {
    it('should show empty state message when no members exist', async () => {
      (
        mockCoreClient.getMyOrganizationApiClient().organization.members.list as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue({
        data: [],
        response: { next: null, total: 0 },
      });

      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      expect(screen.getByText(/member\.table\.empty_message/i)).toBeInTheDocument();
    });

    it('should show empty state message when no invitations exist', async () => {
      const user = userEvent.setup();
      (
        mockCoreClient.getMyOrganizationApiClient().organization.invitations.list as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue({
        data: [],
        response: { next: null },
      });

      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      const invitationsTab = screen.getByRole('tab', { name: /tabs\.invitations/i });
      await user.click(invitationsTab);

      await waitFor(() => {
        expect(screen.getByText(/invitation\.table\.empty_message/i)).toBeInTheDocument();
      });
    });
  });

  describe('pagination', () => {
    it('should fetch members when there are multiple pages', async () => {
      (
        mockCoreClient.getMyOrganizationApiClient().organization.members.list as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue({
        data: [mockMember],
        response: { next: 'next-token', total: 25 },
      });

      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.members.list,
      ).toHaveBeenCalled();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should display invitations data when there are multiple pages', async () => {
      const user = userEvent.setup();
      (
        mockCoreClient.getMyOrganizationApiClient().organization.invitations.list as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue({
        data: [mockInvitation],
        response: { next: 'next-token' },
      });

      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      const invitationsTab = screen.getByRole('tab', { name: /tabs\.invitations/i });
      await user.click(invitationsTab);

      await waitFor(() => {
        expect(screen.getByText(mockInvitation.invitee?.email ?? '')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('should still render component when fetching members fails', async () => {
      (
        mockCoreClient.getMyOrganizationApiClient().organization.members.list as ReturnType<
          typeof vi.fn
        >
      ).mockRejectedValue(new Error('API Error'));

      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /tabs\.members/i })).toBeInTheDocument();
      });
    });

    it('should still render invitations tab when fetching invitations fails', async () => {
      const user = userEvent.setup();
      (
        mockCoreClient.getMyOrganizationApiClient().organization.invitations.list as ReturnType<
          typeof vi.fn
        >
      ).mockRejectedValue(new Error('API Error'));

      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      const invitationsTab = screen.getByRole('tab', { name: /tabs\.invitations/i });
      await user.click(invitationsTab);

      await waitFor(() => {
        expect(invitationsTab).toHaveAttribute('data-state', 'active');
      });
    });
  });

  describe('close modal after creation', () => {
    it('should close create modal after successful invitation creation', async () => {
      const user = userEvent.setup();
      const createdInvitation = createMockInvitation();

      (
        mockCoreClient.getMyOrganizationApiClient().organization.invitations.create as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue([createdInvitation]);

      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      const inviteButton = screen.getByRole('button', { name: /invite_button/i });
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText(/invitation\.create\.title/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText(/invitation\.create\.email_placeholder/i);
      await user.type(emailInput, 'newuser@example.com,');

      await user.click(screen.getByRole('combobox', { name: /connection/i }));
      await user.click(await screen.findByText('Acme Directory'));

      const submitButton = screen.getByRole('button', {
        name: /invitation\.create\.submit_button/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          mockCoreClient.getMyOrganizationApiClient().organization.invitations.create,
        ).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.queryByText(/invitation\.create\.title/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('modal interactions from table actions', () => {
    it('should open assign roles modal when clicking assign role action', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      const actionMenuButton = screen.getByRole('button', {
        name: /member\.actions\.menu_label/i,
      });
      await user.click(actionMenuButton);

      await waitFor(() => {
        expect(screen.getByText(/member\.actions\.assign_role/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/member\.actions\.assign_role/i));

      await waitFor(() => {
        expect(screen.getByText(/member\.detail\.roles\.assign_modal\.title/i)).toBeInTheDocument();
      });
    });

    it('should open remove from organization modal when clicking remove action', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      const actionMenuButton = screen.getByRole('button', {
        name: /member\.actions\.menu_label/i,
      });
      await user.click(actionMenuButton);

      await waitFor(() => {
        expect(screen.getByText(/member\.actions\.remove_from_organization/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/member\.actions\.remove_from_organization/i));

      await waitFor(() => {
        expect(
          screen.getByText(/member\.detail\.actions\.remove_from_organization\.modal\.title/i),
        ).toBeInTheDocument();
      });
    });

    it('should close assign roles modal when cancel button is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      const actionMenuButton = screen.getByRole('button', {
        name: /member\.actions\.menu_label/i,
      });
      await user.click(actionMenuButton);

      await waitFor(() => {
        expect(screen.getByText(/member\.actions\.assign_role/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/member\.actions\.assign_role/i));

      await waitFor(() => {
        expect(screen.getByText(/member\.detail\.roles\.assign_modal\.title/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', {
        name: /member\.detail\.roles\.assign_modal\.cancel_button/i,
      });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/member\.detail\.roles\.assign_modal\.title/i),
        ).not.toBeInTheDocument();
      });
    });

    it('should close remove from organization modal when cancel button is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      const actionMenuButton = screen.getByRole('button', {
        name: /member\.actions\.menu_label/i,
      });
      await user.click(actionMenuButton);

      await waitFor(() => {
        expect(screen.getByText(/member\.actions\.remove_from_organization/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/member\.actions\.remove_from_organization/i));

      await waitFor(() => {
        expect(
          screen.getByText(/member\.detail\.actions\.remove_from_organization\.modal\.title/i),
        ).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', {
        name: /member\.detail\.actions\.remove_from_organization\.modal\.cancel_button/i,
      });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/member\.detail\.actions\.remove_from_organization\.modal\.title/i),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('styling', () => {
    it('should apply custom class when styling.classes are provided', async () => {
      const styling = {
        variables: {
          common: {},
          light: {},
          dark: {},
        },
        classes: {
          'OrganizationMemberManagement-root': 'custom-root-class',
        },
      };

      renderWithProviders(
        <OrganizationMemberManagement {...createMockComponentProps({ styling })} />,
      );

      await waitForComponentToLoad();

      expect(document.querySelector('.custom-root-class')).toBeInTheDocument();
    });
  });

  describe('refresh indicator', () => {
    it('renders the members refresh control and refetches members on click', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      const refreshButton = screen.getByRole('button', { name: 'refresh' });
      expect(refreshButton).toBeInTheDocument();

      await user.click(refreshButton);

      await waitFor(() => {
        expect(
          mockCoreClient.getMyOrganizationApiClient().organization.members.list,
        ).toHaveBeenCalledTimes(2);
      });
    });

    it('renders the invitations refresh control and refetches invitations on click', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      await waitForComponentToLoad();

      const invitationsTab = screen.getByRole('tab', { name: /tabs\.invitations/i });
      await user.click(invitationsTab);

      await waitFor(() => {
        expect(screen.getByText(mockInvitation.invitee?.email ?? '')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: 'refresh' });
      expect(refreshButton).toBeInTheDocument();

      await user.click(refreshButton);

      await waitFor(() => {
        expect(
          mockCoreClient.getMyOrganizationApiClient().organization.invitations.list,
        ).toHaveBeenCalledTimes(2);
      });
    });

    it('renders refresh control in disabled state during initial loading', async () => {
      renderWithProviders(<OrganizationMemberManagement {...createMockComponentProps()} />);

      const refreshButton = await screen.findByRole('button', { name: 'refresh' });
      expect(refreshButton).toBeInTheDocument();
    });
  });
});
