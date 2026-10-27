import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { OrganizationDeleteModal } from '@/components/auth0/my-organization/shared/organization-management/organization-delete/organization-delete-modal';
import { createMockOrganization } from '@/tests/utils/__mocks__/my-organization/organization-management/organization-details.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { OrganizationDeleteModalProps } from '@/types/my-organization/organization-management/organization-delete-types';

const { mockTranslate } = vi.hoisted(() => ({ mockTranslate: vi.fn((key: string) => key) }));

// Keep translations as plain keys, and record what values are passed in.
vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: Object.assign(mockTranslate, { trans: vi.fn((key: string) => key) }),
  }),
}));

const mockOrganization = createMockOrganization();

const renderModal = (overrides: Partial<OrganizationDeleteModalProps> = {}) => {
  const props: OrganizationDeleteModalProps = {
    isOpen: true,
    onClose: vi.fn(),
    organization: mockOrganization,
    isLoading: false,
    onDelete: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
  renderWithProviders(<OrganizationDeleteModal {...props} />);
  const dialog = screen.getByRole('dialog');
  return {
    props,
    dialog,
    input: within(dialog).getByLabelText('organization_name_field_label'),
    getDeleteButton: () => within(dialog).getByRole('button', { name: 'delete_button_label' }),
  };
};

describe('OrganizationDeleteModal', () => {
  describe('when the confirmation field is empty', () => {
    it('disables the delete button and shows no error', () => {
      const { getDeleteButton, input } = renderModal();

      expect(getDeleteButton()).toBeDisabled();
      expect(input).not.toHaveAttribute('aria-invalid', 'true');
      expect(screen.queryByText('organization_name_field_error')).not.toBeInTheDocument();
    });
  });

  describe('when the typed name does not match', () => {
    it('keeps delete disabled and links the error to the field', async () => {
      const user = userEvent.setup();
      const { getDeleteButton, input } = renderModal();

      await user.type(input, 'wrong-name');

      const error = screen.getByText('organization_name_field_error');
      expect(getDeleteButton()).toBeDisabled();
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', error.id);
    });

    it('does not accept the display name in place of the name', async () => {
      const user = userEvent.setup();
      const { getDeleteButton, input } = renderModal();

      await user.type(input, 'Auth0 Corporation');

      expect(getDeleteButton()).toBeDisabled();
    });
  });

  describe('when the typed name matches', () => {
    it('deletes and closes the modal on success', async () => {
      const user = userEvent.setup();
      const { getDeleteButton, input, props } = renderModal();

      await user.type(input, mockOrganization.name);
      await user.click(getDeleteButton());

      expect(props.onDelete).toHaveBeenCalledTimes(1);
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });

    it('stays open when deletion fails', async () => {
      const user = userEvent.setup();
      const { getDeleteButton, input, props } = renderModal({
        onDelete: vi.fn().mockResolvedValue(false),
      });

      await user.type(input, mockOrganization.name);
      await user.click(getDeleteButton());

      expect(props.onDelete).toHaveBeenCalledTimes(1);
      expect(props.onClose).not.toHaveBeenCalled();
    });
  });

  describe('when the organization has a display name', () => {
    it('uses the name, not the display name, in the title and description', () => {
      mockTranslate.mockClear();
      renderModal();

      const { name, display_name: displayName } = mockOrganization;
      expect(mockTranslate).toHaveBeenCalledWith('modal_title', { organizationName: name });
      expect(mockTranslate).toHaveBeenCalledWith('modal_description', { organizationName: name });
      expect(mockTranslate).not.toHaveBeenCalledWith('modal_title', {
        organizationName: displayName,
      });
    });
  });

  describe('when the user presses Escape', () => {
    it('closes the dialog', async () => {
      const user = userEvent.setup();
      const { props } = renderModal();

      await user.keyboard('{Escape}');

      expect(props.onClose).toHaveBeenCalledTimes(1);
    });

    it('keeps the dialog open while a delete request is in flight', async () => {
      const user = userEvent.setup();
      const { props } = renderModal({ isLoading: true });

      await user.keyboard('{Escape}');

      expect(props.onClose).not.toHaveBeenCalled();
    });
  });

  describe('when a delete request is in flight', () => {
    it('disables the cancel button', () => {
      const { dialog } = renderModal({ isLoading: true });

      expect(within(dialog).getByRole('button', { name: 'cancel_button_label' })).toBeDisabled();
    });
  });
});
