import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganizationMemberTableActionsColumn } from '@/components/auth0/my-organization/shared/member-management/members/members-table/organization-member-table-actions-column';
import {
  createMockMember,
  createMockMemberActionsColumnProps,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
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
