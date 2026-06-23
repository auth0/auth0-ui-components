import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';

import { MemberRemoveFromOrganizationModal } from '@/components/auth0/my-organization/shared/member-management/members/member-danger-zone/member-remove-from-organization-modal';
import { renderWithProviders } from '@/tests/utils';
import { createMockRemoveFromOrgModalProps } from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';

describe('MemberRemoveFromOrganizationModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isOpen', () => {
    it('should render the modal when isOpen is true', () => {
      renderWithProviders(
        <MemberRemoveFromOrganizationModal
          {...createMockRemoveFromOrgModalProps({ isOpen: true })}
        />,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render the modal when isOpen is false', () => {
      renderWithProviders(
        <MemberRemoveFromOrganizationModal
          {...createMockRemoveFromOrgModalProps({ isOpen: false })}
        />,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('content', () => {
    it('should display the confirm title', () => {
      renderWithProviders(
        <MemberRemoveFromOrganizationModal {...createMockRemoveFromOrgModalProps()} />,
      );

      expect(
        screen.getByText('member.detail.actions.remove_from_organization.modal.title'),
      ).toBeInTheDocument();
    });

    it('should display the confirm description', () => {
      renderWithProviders(
        <MemberRemoveFromOrganizationModal {...createMockRemoveFromOrgModalProps()} />,
      );

      expect(
        screen.getByText('member.detail.actions.remove_from_organization.modal.description'),
      ).toBeInTheDocument();
    });

    it('should render confirm and cancel buttons', () => {
      renderWithProviders(
        <MemberRemoveFromOrganizationModal {...createMockRemoveFromOrgModalProps()} />,
      );

      expect(
        screen.getByRole('button', {
          name: 'member.detail.actions.remove_from_organization.modal.confirm_button',
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {
          name: 'member.detail.actions.remove_from_organization.modal.cancel_button',
        }),
      ).toBeInTheDocument();
    });
  });

  describe('isLoading', () => {
    it('should disable both buttons when isLoading is true', () => {
      renderWithProviders(
        <MemberRemoveFromOrganizationModal
          {...createMockRemoveFromOrgModalProps({ isLoading: true })}
        />,
      );

      expect(
        screen.getByRole('button', {
          name: 'member.detail.actions.remove_from_organization.modal.cancel_button',
        }),
      ).toBeDisabled();
    });

    it('should enable buttons when isLoading is false', () => {
      renderWithProviders(
        <MemberRemoveFromOrganizationModal
          {...createMockRemoveFromOrgModalProps({ isLoading: false })}
        />,
      );

      expect(
        screen.getByRole('button', {
          name: 'member.detail.actions.remove_from_organization.modal.cancel_button',
        }),
      ).toBeEnabled();
    });
  });

  describe('onConfirm', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      renderWithProviders(
        <MemberRemoveFromOrganizationModal {...createMockRemoveFromOrgModalProps({ onConfirm })} />,
      );

      await user.click(
        screen.getByRole('button', {
          name: 'member.detail.actions.remove_from_organization.modal.confirm_button',
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
        <MemberRemoveFromOrganizationModal {...createMockRemoveFromOrgModalProps({ onClose })} />,
      );

      await user.click(
        screen.getByRole('button', {
          name: 'member.detail.actions.remove_from_organization.modal.cancel_button',
        }),
      );

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
