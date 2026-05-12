import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';

import { OrganizationMemberRemoveRoleModal } from '@/components/auth0/my-organization/shared/member-management/members/organization-member-roles/organization-member-remove-role-modal';
import { renderWithProviders } from '@/tests/utils';
import {
  createMockRemoveRoleModalProps,
  createMockMemberRole,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';

describe('OrganizationMemberRemoveRoleModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isOpen', () => {
    it('should render the modal when isOpen is true', () => {
      renderWithProviders(
        <OrganizationMemberRemoveRoleModal {...createMockRemoveRoleModalProps({ isOpen: true })} />,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render the modal when isOpen is false', () => {
      renderWithProviders(
        <OrganizationMemberRemoveRoleModal
          {...createMockRemoveRoleModalProps({ isOpen: false })}
        />,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('content', () => {
    it('should display the confirm title', () => {
      renderWithProviders(
        <OrganizationMemberRemoveRoleModal {...createMockRemoveRoleModalProps()} />,
      );

      expect(screen.getByText('member.detail.roles.remove_confirm.title')).toBeInTheDocument();
    });

    it('should render confirm and cancel buttons', () => {
      renderWithProviders(
        <OrganizationMemberRemoveRoleModal {...createMockRemoveRoleModalProps()} />,
      );

      expect(
        screen.getByRole('button', {
          name: 'member.detail.roles.remove_confirm.confirm_button',
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {
          name: 'member.detail.roles.remove_confirm.cancel_button',
        }),
      ).toBeInTheDocument();
    });
  });

  describe('role', () => {
    it('should handle empty roles gracefully', () => {
      renderWithProviders(
        <OrganizationMemberRemoveRoleModal {...createMockRemoveRoleModalProps({ roles: [] })} />,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should render with a specific role', () => {
      const role = createMockMemberRole({ id: 'rol_1', name: 'Manager' });

      renderWithProviders(
        <OrganizationMemberRemoveRoleModal
          {...createMockRemoveRoleModalProps({ roles: [role] })}
        />,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('isLoading', () => {
    it('should disable cancel button when isLoading is true', () => {
      renderWithProviders(
        <OrganizationMemberRemoveRoleModal
          {...createMockRemoveRoleModalProps({ isLoading: true })}
        />,
      );

      expect(
        screen.getByRole('button', {
          name: 'member.detail.roles.remove_confirm.cancel_button',
        }),
      ).toBeDisabled();
    });

    it('should enable buttons when isLoading is false', () => {
      renderWithProviders(
        <OrganizationMemberRemoveRoleModal
          {...createMockRemoveRoleModalProps({ isLoading: false })}
        />,
      );

      expect(
        screen.getByRole('button', {
          name: 'member.detail.roles.remove_confirm.cancel_button',
        }),
      ).toBeEnabled();
    });
  });

  describe('onConfirm', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      renderWithProviders(
        <OrganizationMemberRemoveRoleModal {...createMockRemoveRoleModalProps({ onConfirm })} />,
      );

      await user.click(
        screen.getByRole('button', {
          name: 'member.detail.roles.remove_confirm.confirm_button',
        }),
      );

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('onClose', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderWithProviders(
        <OrganizationMemberRemoveRoleModal {...createMockRemoveRoleModalProps({ onClose })} />,
      );

      await user.click(
        screen.getByRole('button', {
          name: 'member.detail.roles.remove_confirm.cancel_button',
        }),
      );

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
