import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OrganizationMemberRemoveFromOrgModal } from '@/components/auth0/my-organization/shared/member-management/members/members-remove-from-organization/organization-member-remove-from-org-modal';
import { renderWithProviders } from '@/tests/utils';
import {
  createMockMember,
  createMockMemberRemoveFromOrgModalProps,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';

describe('OrganizationMemberRemoveFromOrgModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isOpen', () => {
    it('should render the modal when open', () => {
      renderWithProviders(
        <OrganizationMemberRemoveFromOrgModal {...createMockMemberRemoveFromOrgModalProps()} />,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render the modal content when closed', () => {
      renderWithProviders(
        <OrganizationMemberRemoveFromOrgModal
          {...createMockMemberRemoveFromOrgModalProps({ isOpen: false })}
        />,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('rendering', () => {
    it('should render title, description, and action buttons', () => {
      renderWithProviders(
        <OrganizationMemberRemoveFromOrgModal {...createMockMemberRemoveFromOrgModalProps()} />,
      );

      expect(screen.getByText('member.remove_from_org_modal.title')).toBeInTheDocument();
      expect(screen.getByText('member.remove_from_org_modal.description')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'member.remove_from_org_modal.cancel_button' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'member.remove_from_org_modal.remove_button' }),
      ).toBeInTheDocument();
    });

    it('should apply custom class name to the modal content', () => {
      renderWithProviders(
        <OrganizationMemberRemoveFromOrgModal
          {...createMockMemberRemoveFromOrgModalProps({ className: 'custom-remove-modal' })}
        />,
      );

      const modalContent = document.querySelector('[data-slot="dialog-content"]');
      expect(modalContent).toHaveClass('custom-remove-modal');
    });
  });

  describe('loading state', () => {
    it('should disable both buttons when loading', () => {
      renderWithProviders(
        <OrganizationMemberRemoveFromOrgModal
          {...createMockMemberRemoveFromOrgModalProps({ isLoading: true })}
        />,
      );

      expect(
        screen.getByRole('button', { name: 'member.remove_from_org_modal.cancel_button' }),
      ).toBeDisabled();
      expect(screen.getByRole('button', { name: '...' })).toBeDisabled();
    });

    it('should disable the remove button when member has no user id', () => {
      renderWithProviders(
        <OrganizationMemberRemoveFromOrgModal
          {...createMockMemberRemoveFromOrgModalProps({
            member: createMockMember({ user_id: undefined }),
          })}
        />,
      );

      expect(
        screen.getByRole('button', { name: 'member.remove_from_org_modal.remove_button' }),
      ).toBeDisabled();
    });
  });

  describe('callbacks', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderWithProviders(
        <OrganizationMemberRemoveFromOrgModal
          {...createMockMemberRemoveFromOrgModalProps({ onClose })}
        />,
      );

      await user.click(
        screen.getByRole('button', { name: 'member.remove_from_org_modal.cancel_button' }),
      );

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onConfirm with member user id when remove button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const member = createMockMember({ user_id: 'usr_remove_1' });

      renderWithProviders(
        <OrganizationMemberRemoveFromOrgModal
          {...createMockMemberRemoveFromOrgModalProps({ member, onConfirm })}
        />,
      );

      await user.click(
        screen.getByRole('button', { name: 'member.remove_from_org_modal.remove_button' }),
      );

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledWith('usr_remove_1');
    });

    it('should not call onConfirm when member has no user id', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      renderWithProviders(
        <OrganizationMemberRemoveFromOrgModal
          {...createMockMemberRemoveFromOrgModalProps({
            member: createMockMember({ user_id: undefined }),
            onConfirm,
          })}
        />,
      );

      await user.click(
        screen.getByRole('button', { name: 'member.remove_from_org_modal.remove_button' }),
      );

      expect(onConfirm).not.toHaveBeenCalled();
    });
  });
});
