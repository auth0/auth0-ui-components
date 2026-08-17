import { getMemberManagementPermissions } from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganizationInvitationTableActionsColumn } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-table/organization-invitation-table-actions-column';
import {
  createMockActionsColumnProps,
  createMockPendingInvitation,
  createMockExpiredInvitation,
} from '@/tests/utils/__mocks__/my-organization/member-management/invitation.mocks';
import {
  EDITOR_MEMBER_PERMISSIONS,
  VIEWER_MEMBER_PERMISSIONS,
} from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

describe('OrganizationInvitationTableActionsColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Basic Structure', () => {
    it('should render dropdown trigger button', () => {
      const props = createMockActionsColumnProps();
      renderWithProviders(<OrganizationInvitationTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveClass('h-8', 'w-8');
    });

    it('should have proper accessibility attributes', () => {
      const props = createMockActionsColumnProps();
      renderWithProviders(<OrganizationInvitationTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('type', 'button');
    });
  });

  describe('Dropdown Menu Interactions', () => {
    it('should open dropdown menu when trigger button is clicked', async () => {
      const user = userEvent.setup();
      const props = createMockActionsColumnProps();
      renderWithProviders(<OrganizationInvitationTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(
        screen.getByRole('menuitem', { name: 'invitation.actions.view_details' }),
      ).toBeInTheDocument();
    });

    it('should close dropdown menu when user presses Escape key', async () => {
      const user = userEvent.setup();
      const props = createMockActionsColumnProps();
      renderWithProviders(<OrganizationInvitationTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(
        screen.getByRole('menuitem', { name: 'invitation.actions.view_details' }),
      ).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(
          screen.queryByRole('menuitem', { name: 'invitation.actions.view_details' }),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Invitation Status: Pending', () => {
    it('should show View Details action', async () => {
      const user = userEvent.setup();
      const props = createMockActionsColumnProps({
        invitation: createMockPendingInvitation(),
      });
      renderWithProviders(<OrganizationInvitationTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(
        screen.getByRole('menuitem', { name: 'invitation.actions.view_details' }),
      ).toBeInTheDocument();
    });

    it('should show Copy URL action when invitation has URL', async () => {
      const user = userEvent.setup();
      const props = createMockActionsColumnProps({
        invitation: createMockPendingInvitation({
          invitation_url: 'https://example.com/invite?ticket=abc',
        }),
      });
      renderWithProviders(<OrganizationInvitationTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(
        screen.getByRole('menuitem', { name: 'invitation.actions.copy_url' }),
      ).toBeInTheDocument();
    });

    it('should not show Copy URL action when invitation has no URL', async () => {
      const user = userEvent.setup();
      const props = createMockActionsColumnProps({
        invitation: createMockPendingInvitation({ invitation_url: undefined }),
      });
      renderWithProviders(<OrganizationInvitationTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(
        screen.queryByRole('menuitem', { name: 'invitation.actions.copy_url' }),
      ).not.toBeInTheDocument();
    });

    it('should show Revoke & Resend action when permitted', async () => {
      const user = userEvent.setup();
      const props = createMockActionsColumnProps();
      renderWithProviders(<OrganizationInvitationTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(
        screen.getByRole('menuitem', { name: 'invitation.actions.revoke_and_resend' }),
      ).toBeInTheDocument();
    });

    it('should show Revoke action when permitted', async () => {
      const user = userEvent.setup();
      const props = createMockActionsColumnProps();
      renderWithProviders(<OrganizationInvitationTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(
        screen.getByRole('menuitem', { name: 'invitation.actions.revoke' }),
      ).toBeInTheDocument();
    });
  });

  describe('Invitation Status: Expired', () => {
    it('should show View Details action', async () => {
      const user = userEvent.setup();
      const props = createMockActionsColumnProps({
        invitation: createMockExpiredInvitation(),
      });
      renderWithProviders(<OrganizationInvitationTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(
        screen.getByRole('menuitem', { name: 'invitation.actions.view_details' }),
      ).toBeInTheDocument();
    });

    it('should not show Copy URL action for expired invitations', async () => {
      const user = userEvent.setup();
      const props = createMockActionsColumnProps({
        invitation: createMockExpiredInvitation(),
      });
      renderWithProviders(<OrganizationInvitationTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(
        screen.queryByRole('menuitem', { name: 'invitation.actions.copy_url' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Permission tiers', () => {
    describe('when the user is a viewer', () => {
      it('should render no menu at all, leaving row-click as the only path', () => {
        const props = createMockActionsColumnProps({
          permissions: VIEWER_MEMBER_PERMISSIONS,
        });
        const { container } = renderWithProviders(
          <OrganizationInvitationTableActionsColumn {...props} />,
        );

        expect(container).toBeEmptyDOMElement();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });
    });

    describe('when the user is an editor', () => {
      it('should render no menu, since every invitation action needs the delete scope', () => {
        const props = createMockActionsColumnProps({
          permissions: EDITOR_MEMBER_PERMISSIONS,
        });
        const { container } = renderWithProviders(
          <OrganizationInvitationTableActionsColumn {...props} />,
        );

        expect(container).toBeEmptyDOMElement();
      });
    });

    describe('when the user can revoke but not create', () => {
      it('should show Revoke and hide Revoke & Resend, which also needs create', async () => {
        const user = userEvent.setup();
        const props = createMockActionsColumnProps({
          permissions: getMemberManagementPermissions(['delete:my_org:member_invitations']),
        });
        renderWithProviders(<OrganizationInvitationTableActionsColumn {...props} />);

        await user.click(screen.getByRole('button'));

        expect(
          screen.getByRole('menuitem', { name: 'invitation.actions.revoke' }),
        ).toBeInTheDocument();
        expect(
          screen.queryByRole('menuitem', { name: 'invitation.actions.revoke_and_resend' }),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Callback Invocations', () => {
    it('should call onViewDetails when View Details is clicked', async () => {
      const user = userEvent.setup();
      const onViewDetails = vi.fn();
      const invitation = createMockPendingInvitation();
      const props = createMockActionsColumnProps({ invitation, onViewDetails });
      renderWithProviders(<OrganizationInvitationTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const menuItem = screen.getByRole('menuitem', {
        name: 'invitation.actions.view_details',
      });
      await user.click(menuItem);

      expect(onViewDetails).toHaveBeenCalledTimes(1);
      expect(onViewDetails).toHaveBeenCalledWith(invitation);
    });

    it('should call onCopyUrl when Copy URL is clicked', async () => {
      const user = userEvent.setup();
      const onCopyUrl = vi.fn();
      const invitation = createMockPendingInvitation({
        invitation_url: 'https://example.com/invite',
      });
      const props = createMockActionsColumnProps({ invitation, onCopyUrl });
      renderWithProviders(<OrganizationInvitationTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const menuItem = screen.getByRole('menuitem', {
        name: 'invitation.actions.copy_url',
      });
      await user.click(menuItem);

      expect(onCopyUrl).toHaveBeenCalledTimes(1);
      expect(onCopyUrl).toHaveBeenCalledWith(invitation);
    });

    it('should call onRevokeAndResend when Revoke & Resend is clicked', async () => {
      const user = userEvent.setup();
      const onRevokeAndResend = vi.fn();
      const invitation = createMockPendingInvitation();
      const props = createMockActionsColumnProps({ invitation, onRevokeAndResend });
      renderWithProviders(<OrganizationInvitationTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const menuItem = screen.getByRole('menuitem', {
        name: 'invitation.actions.revoke_and_resend',
      });
      await user.click(menuItem);

      expect(onRevokeAndResend).toHaveBeenCalledTimes(1);
      expect(onRevokeAndResend).toHaveBeenCalledWith(invitation);
    });

    it('should call onRevoke when Revoke is clicked', async () => {
      const user = userEvent.setup();
      const onRevoke = vi.fn();
      const invitation = createMockPendingInvitation();
      const props = createMockActionsColumnProps({ invitation, onRevoke });
      renderWithProviders(<OrganizationInvitationTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const menuItem = screen.getByRole('menuitem', {
        name: 'invitation.actions.revoke',
      });
      await user.click(menuItem);

      expect(onRevoke).toHaveBeenCalledTimes(1);
      expect(onRevoke).toHaveBeenCalledWith(invitation);
    });
  });

  describe('Custom Messages', () => {
    it('should accept custom messages prop without error', async () => {
      const user = userEvent.setup();
      const customMessages = {
        actions: {
          view_details: 'Custom View Details',
        },
      };
      const props = createMockActionsColumnProps({ customMessages });
      renderWithProviders(<OrganizationInvitationTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      // The mock translator returns keys, so verify the menu item renders
      expect(
        screen.getByRole('menuitem', { name: 'invitation.actions.view_details' }),
      ).toBeInTheDocument();
    });
  });
});
