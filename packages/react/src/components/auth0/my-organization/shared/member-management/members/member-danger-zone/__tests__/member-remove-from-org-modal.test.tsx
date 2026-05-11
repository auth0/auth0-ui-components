import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';

import { MemberRemoveFromOrgModal } from '@/components/auth0/my-organization/shared/member-management/members/member-danger-zone/member-remove-from-org-modal';
import { renderWithProviders } from '@/tests/utils';
import { createMockRemoveFromOrgModalProps } from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';

describe('MemberRemoveFromOrgModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isOpen', () => {
    it('should render the modal when isOpen is true', () => {
      renderWithProviders(
        <MemberRemoveFromOrgModal {...createMockRemoveFromOrgModalProps({ isOpen: true })} />,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render the modal when isOpen is false', () => {
      renderWithProviders(
        <MemberRemoveFromOrgModal {...createMockRemoveFromOrgModalProps({ isOpen: false })} />,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('content', () => {
    it('should display the confirm title', () => {
      renderWithProviders(<MemberRemoveFromOrgModal {...createMockRemoveFromOrgModalProps()} />);

      expect(
        screen.getByText('member.detail.danger_zone.remove_from_org.confirm_title'),
      ).toBeInTheDocument();
    });

    it('should display the confirm description', () => {
      renderWithProviders(<MemberRemoveFromOrgModal {...createMockRemoveFromOrgModalProps()} />);

      expect(
        screen.getByText('member.detail.danger_zone.remove_from_org.confirm_description'),
      ).toBeInTheDocument();
    });

    it('should render confirm and cancel buttons', () => {
      renderWithProviders(<MemberRemoveFromOrgModal {...createMockRemoveFromOrgModalProps()} />);

      expect(
        screen.getByRole('button', {
          name: 'member.detail.danger_zone.remove_from_org.confirm_button',
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {
          name: 'member.detail.danger_zone.remove_from_org.cancel_button',
        }),
      ).toBeInTheDocument();
    });
  });

  describe('isLoading', () => {
    it('should disable both buttons when isLoading is true', () => {
      renderWithProviders(
        <MemberRemoveFromOrgModal {...createMockRemoveFromOrgModalProps({ isLoading: true })} />,
      );

      expect(
        screen.getByRole('button', {
          name: 'member.detail.danger_zone.remove_from_org.cancel_button',
        }),
      ).toBeDisabled();
    });

    it('should enable buttons when isLoading is false', () => {
      renderWithProviders(
        <MemberRemoveFromOrgModal {...createMockRemoveFromOrgModalProps({ isLoading: false })} />,
      );

      expect(
        screen.getByRole('button', {
          name: 'member.detail.danger_zone.remove_from_org.cancel_button',
        }),
      ).toBeEnabled();
    });
  });

  describe('onConfirm', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      renderWithProviders(
        <MemberRemoveFromOrgModal {...createMockRemoveFromOrgModalProps({ onConfirm })} />,
      );

      await user.click(
        screen.getByRole('button', {
          name: 'member.detail.danger_zone.remove_from_org.confirm_button',
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
        <MemberRemoveFromOrgModal {...createMockRemoveFromOrgModalProps({ onClose })} />,
      );

      await user.click(
        screen.getByRole('button', {
          name: 'member.detail.danger_zone.remove_from_org.cancel_button',
        }),
      );

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
