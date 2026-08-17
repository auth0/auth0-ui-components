import { getMemberManagementPermissions } from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganizationMemberTableActionsColumn } from '@/components/auth0/my-organization/shared/member-management/members/members-table/organization-member-table-actions-column';
import {
  createMockMember,
  createMockMemberActionsColumnProps,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import {
  ADMIN_MEMBER_PERMISSIONS,
  EDITOR_MEMBER_PERMISSIONS,
  VIEWER_MEMBER_PERMISSIONS,
} from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

describe('OrganizationMemberTableActionsColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering and Basic Structure', () => {
    it('should render dropdown trigger button', () => {
      const props = createMockMemberActionsColumnProps();
      renderWithProviders(<OrganizationMemberTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button', { name: 'member.actions.menu_label' });
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveClass('h-8', 'w-8');
    });

    it('should have proper accessibility attributes', () => {
      const props = createMockMemberActionsColumnProps();
      renderWithProviders(<OrganizationMemberTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button', { name: 'member.actions.menu_label' });
      expect(trigger).toHaveAttribute('type', 'button');
    });
  });

  describe('Dropdown Menu Interactions', () => {
    it('should open dropdown menu when trigger button is clicked', async () => {
      const user = userEvent.setup();
      const props = createMockMemberActionsColumnProps();
      renderWithProviders(<OrganizationMemberTableActionsColumn {...props} />);

      await user.click(screen.getByRole('button', { name: 'member.actions.menu_label' }));

      expect(
        screen.getByRole('menuitem', { name: 'member.actions.view_details' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: 'member.actions.assign_role' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: 'member.actions.remove_from_organization' }),
      ).toBeInTheDocument();
    });

    it('should close dropdown menu when user presses Escape key', async () => {
      const user = userEvent.setup();
      const props = createMockMemberActionsColumnProps();
      renderWithProviders(<OrganizationMemberTableActionsColumn {...props} />);

      await user.click(screen.getByRole('button', { name: 'member.actions.menu_label' }));
      expect(
        screen.getByRole('menuitem', { name: 'member.actions.assign_role' }),
      ).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(
          screen.queryByRole('menuitem', { name: 'member.actions.assign_role' }),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Actions', () => {
    it('should call onViewDetails when View Details is clicked', async () => {
      const user = userEvent.setup();
      const onViewDetails = vi.fn();
      const member = createMockMember({ user_id: 'usr_abc' });
      const props = createMockMemberActionsColumnProps({ member, onViewDetails });
      renderWithProviders(<OrganizationMemberTableActionsColumn {...props} />);

      await user.click(screen.getByRole('button', { name: 'member.actions.menu_label' }));
      await user.click(screen.getByRole('menuitem', { name: 'member.actions.view_details' }));

      expect(onViewDetails).toHaveBeenCalledTimes(1);
      expect(onViewDetails).toHaveBeenCalledWith('usr_abc');
    });

    it('should call onAssignRole when Assign Role is clicked', async () => {
      const user = userEvent.setup();
      const onAssignRole = vi.fn();
      const member = createMockMember();
      const props = createMockMemberActionsColumnProps({ member, onAssignRole });
      renderWithProviders(<OrganizationMemberTableActionsColumn {...props} />);

      await user.click(screen.getByRole('button', { name: 'member.actions.menu_label' }));
      await user.click(screen.getByRole('menuitem', { name: 'member.actions.assign_role' }));

      expect(onAssignRole).toHaveBeenCalledTimes(1);
      expect(onAssignRole).toHaveBeenCalledWith(member);
    });

    it('should call onRemoveFromOrganization when Remove from Organization is clicked', async () => {
      const user = userEvent.setup();
      const onRemoveFromOrganization = vi.fn();
      const member = createMockMember();
      const props = createMockMemberActionsColumnProps({ member, onRemoveFromOrganization });
      renderWithProviders(<OrganizationMemberTableActionsColumn {...props} />);

      await user.click(screen.getByRole('button', { name: 'member.actions.menu_label' }));
      await user.click(
        screen.getByRole('menuitem', { name: 'member.actions.remove_from_organization' }),
      );

      expect(onRemoveFromOrganization).toHaveBeenCalledTimes(1);
      expect(onRemoveFromOrganization).toHaveBeenCalledWith(member);
    });
  });

  describe('Permission tiers', () => {
    describe('when the user is an admin', () => {
      it('should show the full menu', async () => {
        const user = userEvent.setup();
        const props = createMockMemberActionsColumnProps({
          permissions: ADMIN_MEMBER_PERMISSIONS,
        });
        renderWithProviders(<OrganizationMemberTableActionsColumn {...props} />);

        await user.click(screen.getByRole('button', { name: 'member.actions.menu_label' }));

        expect(
          screen.getByRole('menuitem', { name: 'member.actions.view_details' }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('menuitem', { name: 'member.actions.assign_role' }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('menuitem', { name: 'member.actions.remove_from_organization' }),
        ).toBeInTheDocument();
      });
    });

    describe('when the user is an editor', () => {
      it('should show assign role but hide the destructive action', async () => {
        const user = userEvent.setup();
        const props = createMockMemberActionsColumnProps({
          permissions: EDITOR_MEMBER_PERMISSIONS,
        });
        renderWithProviders(<OrganizationMemberTableActionsColumn {...props} />);

        await user.click(screen.getByRole('button', { name: 'member.actions.menu_label' }));

        expect(
          screen.getByRole('menuitem', { name: 'member.actions.assign_role' }),
        ).toBeInTheDocument();
        expect(
          screen.queryByRole('menuitem', { name: 'member.actions.remove_from_organization' }),
        ).not.toBeInTheDocument();
      });

      it('should keep view details reachable from the menu', async () => {
        const user = userEvent.setup();
        const props = createMockMemberActionsColumnProps({
          permissions: EDITOR_MEMBER_PERMISSIONS,
        });
        renderWithProviders(<OrganizationMemberTableActionsColumn {...props} />);

        await user.click(screen.getByRole('button', { name: 'member.actions.menu_label' }));

        expect(
          screen.getByRole('menuitem', { name: 'member.actions.view_details' }),
        ).toBeInTheDocument();
      });
    });

    describe('when the user is a viewer', () => {
      it('should render no menu at all, leaving row-click as the only path', () => {
        const props = createMockMemberActionsColumnProps({
          permissions: VIEWER_MEMBER_PERMISSIONS,
        });
        const { container } = renderWithProviders(
          <OrganizationMemberTableActionsColumn {...props} />,
        );

        expect(container).toBeEmptyDOMElement();
        expect(
          screen.queryByRole('button', { name: 'member.actions.menu_label' }),
        ).not.toBeInTheDocument();
      });
    });

    describe('when the user can only remove from the organization', () => {
      it('should show the destructive action without assign role', async () => {
        const user = userEvent.setup();
        const props = createMockMemberActionsColumnProps({
          permissions: getMemberManagementPermissions(['delete:my_org:memberships']),
        });
        renderWithProviders(<OrganizationMemberTableActionsColumn {...props} />);

        await user.click(screen.getByRole('button', { name: 'member.actions.menu_label' }));

        expect(
          screen.getByRole('menuitem', { name: 'member.actions.remove_from_organization' }),
        ).toBeInTheDocument();
        expect(
          screen.queryByRole('menuitem', { name: 'member.actions.assign_role' }),
        ).not.toBeInTheDocument();
      });
    });
  });
});
