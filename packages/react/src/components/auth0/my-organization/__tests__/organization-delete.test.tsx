import { configQueryKeys } from '@auth0/universal-components-core';
import { QueryClient } from '@tanstack/react-query';
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
    (apiService.organization.delete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
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
      expect(mockCoreClient.getMyOrganizationApiClient().organization.delete).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe('deletion behavior hint', () => {
    const renderWithConfig = (config: object | Error) => {
      const get = mockCoreClient.getMyOrganizationApiClient().organization.configuration
        .get as ReturnType<typeof vi.fn>;
      if (config instanceof Error) {
        get.mockRejectedValue(config);
      } else {
        get.mockResolvedValue(config);
      }
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      renderWithProviders(<OrganizationDelete />, { queryClient });
      const configStatus = () => queryClient.getQueryState(configQueryKeys.details())?.status;
      return { configStatus };
    };

    it.each([
      [
        'configured',
        { allowed_strategies: ['okta'], organization_deletion_behavior: 'allow_if_empty' },
      ],
      ['not set', { allowed_strategies: ['okta'] }],
    ])('tells the user they must be the only member when it is %s', async (_label, config) => {
      renderWithConfig(config);

      expect(await screen.findByText('allow_if_empty_hint')).toBeInTheDocument();
    });

    it('shows no hint when any organization may be deleted', async () => {
      const { configStatus } = renderWithConfig({
        allowed_strategies: ['okta'],
        organization_deletion_behavior: 'allow',
      });

      await findSectionDeleteButton();
      await waitFor(() => expect(configStatus()).toBe('success'));
      expect(screen.queryByText('allow_if_empty_hint')).not.toBeInTheDocument();
    });

    it('shows no hint, and still allows deleting, when the configuration cannot be loaded', async () => {
      const { configStatus } = renderWithConfig(
        Object.assign(new Error('Not found'), { body: { status: 404 } }),
      );

      expect(await findSectionDeleteButton()).toBeEnabled();
      await waitFor(() => expect(configStatus()).toBe('error'));
      expect(screen.queryByText('allow_if_empty_hint')).not.toBeInTheDocument();
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
