import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';

import { MemberDeleteModal } from '@/components/auth0/my-organization/shared/member-management/members/member-danger-zone/member-delete-modal';
import { renderWithProviders } from '@/tests/utils';
import { createMockDeleteModalProps } from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';

describe('MemberDeleteModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isOpen', () => {
    it('should render the modal when isOpen is true', () => {
      renderWithProviders(<MemberDeleteModal {...createMockDeleteModalProps({ isOpen: true })} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render the modal when isOpen is false', () => {
      renderWithProviders(<MemberDeleteModal {...createMockDeleteModalProps({ isOpen: false })} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('content', () => {
    it('should display the confirm title', () => {
      renderWithProviders(<MemberDeleteModal {...createMockDeleteModalProps()} />);

      expect(
        screen.getByText('member.detail.danger_zone.delete_member.confirm_title'),
      ).toBeInTheDocument();
    });

    it('should display the confirm description', () => {
      renderWithProviders(<MemberDeleteModal {...createMockDeleteModalProps()} />);

      expect(
        screen.getByText('member.detail.danger_zone.delete_member.confirm_description'),
      ).toBeInTheDocument();
    });

    it('should render confirm and cancel buttons', () => {
      renderWithProviders(<MemberDeleteModal {...createMockDeleteModalProps()} />);

      expect(
        screen.getByRole('button', {
          name: 'member.detail.danger_zone.delete_member.confirm_button',
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {
          name: 'member.detail.danger_zone.delete_member.cancel_button',
        }),
      ).toBeInTheDocument();
    });
  });

  describe('isLoading', () => {
    it('should disable cancel button when isLoading is true', () => {
      renderWithProviders(
        <MemberDeleteModal {...createMockDeleteModalProps({ isLoading: true })} />,
      );

      expect(
        screen.getByRole('button', {
          name: 'member.detail.danger_zone.delete_member.cancel_button',
        }),
      ).toBeDisabled();
    });

    it('should enable buttons when isLoading is false', () => {
      renderWithProviders(
        <MemberDeleteModal {...createMockDeleteModalProps({ isLoading: false })} />,
      );

      expect(
        screen.getByRole('button', {
          name: 'member.detail.danger_zone.delete_member.cancel_button',
        }),
      ).toBeEnabled();
    });
  });

  describe('onConfirm', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      renderWithProviders(<MemberDeleteModal {...createMockDeleteModalProps({ onConfirm })} />);

      await user.click(
        screen.getByRole('button', {
          name: 'member.detail.danger_zone.delete_member.confirm_button',
        }),
      );

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('onClose', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderWithProviders(<MemberDeleteModal {...createMockDeleteModalProps({ onClose })} />);

      await user.click(
        screen.getByRole('button', {
          name: 'member.detail.danger_zone.delete_member.cancel_button',
        }),
      );

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
