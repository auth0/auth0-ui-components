import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganizationMemberTableActionsColumn } from '@/components/auth0/my-organization/shared/member-management/members/members-table/organization-member-table-actions-column';
import {
  createMockMember,
  createMockMemberActionsColumnProps,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import { createMemberPermissions } from '@/tests/utils/__mocks__/permissions/permission.mocks';
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
      expect(onViewDetails).toHaveBeenCalledWith({ userId: 'usr_abc' });
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

  describe('Granted permissions', () => {
    describe('when every member permission is granted', () => {
      it('should show the full menu', async () => {
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
    });

    describe('when create:my_org:member_roles is granted without delete:my_org:memberships', () => {
      it('should show assign role and hide remove from organization', async () => {
        const user = userEvent.setup();
        const props = createMockMemberActionsColumnProps({
          permissions: createMemberPermissions([
            'read:my_org:members',
            'create:my_org:member_roles',
          ]),
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
          permissions: createMemberPermissions([
            'read:my_org:members',
            'create:my_org:member_roles',
          ]),
        });
        renderWithProviders(<OrganizationMemberTableActionsColumn {...props} />);

        await user.click(screen.getByRole('button', { name: 'member.actions.menu_label' }));

        expect(
          screen.getByRole('menuitem', { name: 'member.actions.view_details' }),
        ).toBeInTheDocument();
      });
    });

    describe('when delete:my_org:memberships is granted without create:my_org:member_roles', () => {
      it('should show remove from organization and hide assign role', async () => {
        const user = userEvent.setup();
        const props = createMockMemberActionsColumnProps({
          permissions: createMemberPermissions([
            'read:my_org:members',
            'delete:my_org:memberships',
          ]),
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

    describe('when only read permissions are granted', () => {
      it('should render no menu at all, leaving row-click as the only path', () => {
        const props = createMockMemberActionsColumnProps({
          permissions: createMemberPermissions(['read:my_org:members']),
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

    describe('when no permissions are granted', () => {
      it('should render no menu', () => {
        const props = createMockMemberActionsColumnProps({
          permissions: createMemberPermissions([]),
        });
        const { container } = renderWithProviders(
          <OrganizationMemberTableActionsColumn {...props} />,
        );

        expect(container).toBeEmptyDOMElement();
      });
    });
  });

  describe('Access Level Gating', () => {
    it('should hide Assign Role and Remove from Organization when access_level is readonly', async () => {
      const user = userEvent.setup();
      const member = createMockMember({ access_level: 'readonly' });
      const props = createMockMemberActionsColumnProps({ member });
      renderWithProviders(<OrganizationMemberTableActionsColumn {...props} />);

      await user.click(screen.getByRole('button', { name: 'member.actions.menu_label' }));

      expect(
        screen.getByRole('menuitem', { name: 'member.actions.view_details' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'member.actions.assign_role' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'member.actions.remove_from_organization' }),
      ).not.toBeInTheDocument();
    });

    it('should hide Assign Role and Remove from Organization when access_level is none', async () => {
      const user = userEvent.setup();
      const member = createMockMember({ access_level: 'none' });
      const props = createMockMemberActionsColumnProps({ member });
      renderWithProviders(<OrganizationMemberTableActionsColumn {...props} />);

      await user.click(screen.getByRole('button', { name: 'member.actions.menu_label' }));

      expect(
        screen.getByRole('menuitem', { name: 'member.actions.view_details' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'member.actions.assign_role' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'member.actions.remove_from_organization' }),
      ).not.toBeInTheDocument();
    });

    it('should show all actions when access_level is limited', async () => {
      const user = userEvent.setup();
      const member = createMockMember({ access_level: 'limited' });
      const props = createMockMemberActionsColumnProps({ member });
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

    it('should show all actions when access_level is full', async () => {
      const user = userEvent.setup();
      const member = createMockMember({ access_level: 'full' });
      const props = createMockMemberActionsColumnProps({ member });
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

    it('should hide Assign Role and Remove from Organization when access_level is undefined', async () => {
      const user = userEvent.setup();
      const member = createMockMember({ access_level: undefined });
      const props = createMockMemberActionsColumnProps({ member });
      renderWithProviders(<OrganizationMemberTableActionsColumn {...props} />);

      await user.click(screen.getByRole('button', { name: 'member.actions.menu_label' }));

      expect(
        screen.getByRole('menuitem', { name: 'member.actions.view_details' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'member.actions.assign_role' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'member.actions.remove_from_organization' }),
      ).not.toBeInTheDocument();
    });
  });
});
