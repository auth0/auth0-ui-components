import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganizationDelete } from '@/components/auth0/my-organization/organization-delete';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createMockOrganization } from '@/tests/utils/__mocks__/my-organization/organization-management/organization-details.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';

mockToast();
const { initMockCoreClient } = mockCore();

describe('OrganizationDelete', () => {
  const mockOrganization = createMockOrganization();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    mockCoreClient = initMockCoreClient();
    const apiService = mockCoreClient.getMyOrganizationApiClient();
    (apiService.organizationDetails.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockOrganization,
    );
    (apiService.organizationDetails.delete as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  // GateKeeper renders the section only after the organization has loaded.
  const findSectionDeleteButton = (name = 'delete_button_label') =>
    screen.findByRole('button', { name });

  describe('when the user confirms deletion', () => {
    it('deletes the organization and calls deleteAction.onAfter', async () => {
      const user = userEvent.setup();
      const onAfter = vi.fn();

      renderWithProviders(<OrganizationDelete deleteAction={{ onAfter }} />);

      await user.click(await findSectionDeleteButton());
      const dialog = screen.getByRole('dialog');
      await user.type(
        within(dialog).getByLabelText('organization_name_field_label'),
        mockOrganization.name,
      );
      await user.click(within(dialog).getByRole('button', { name: 'delete_button_label' }));

      await waitFor(() => {
        expect(onAfter).toHaveBeenCalledWith(
          expect.objectContaining({ name: mockOrganization.name }),
        );
      });
      expect(
        mockCoreClient.getMyOrganizationApiClient().organizationDetails.delete,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the delete scope is missing', () => {
    it('disables the delete button', async () => {
      renderWithProviders(<OrganizationDelete />, { permissions: ['update:my_org:details'] });

      expect(await findSectionDeleteButton()).toBeDisabled();
    });
  });

  describe('when readOnly is true', () => {
    it('disables the delete button', async () => {
      renderWithProviders(<OrganizationDelete readOnly />);

      expect(await findSectionDeleteButton()).toBeDisabled();
    });
  });

  describe('when custom messages are provided', () => {
    it('renders the overridden button label', async () => {
      renderWithProviders(
        <OrganizationDelete customMessages={{ delete_button_label: 'Remove organization' }} />,
      );

      expect(await findSectionDeleteButton('Remove organization')).toBeEnabled();
    });
  });

  describe('when custom classes are provided', () => {
    it('applies the root class to the section', async () => {
      const { container } = renderWithProviders(
        <OrganizationDelete
          styling={{
            variables: { common: {}, light: {}, dark: {} },
            classes: { 'OrganizationDelete-root': 'custom-delete-root' },
          }}
        />,
      );

      await findSectionDeleteButton();
      expect(container.querySelector('.custom-delete-root')).toBeInTheDocument();
    });
  });
});
