import { userOrganizationQueryKeys } from '@auth0/universal-components-core';
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganizationTable } from '@/components/auth0/my-account/organization-table';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockUserOrganization,
  createMockUserOrganizations,
  createMockUserOrganizationsPage,
} from '@/tests/utils/__mocks__/my-account/organization-management/organization-table.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';

const { initMockCoreClient } = mockCore();
const { mockedShowToast } = mockToast();

describe('OrganizationTable', () => {
  const organizations = createMockUserOrganizations();
  let listOrganizations: ReturnType<typeof vi.fn>;
  let deleteOrganization: ReturnType<typeof vi.fn>;
  let getOrganizationDetails: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const mockCoreClient = initMockCoreClient();
    deleteOrganization = mockCoreClient.getMyOrganizationApiClient().organization
      .delete as ReturnType<typeof vi.fn>;
    getOrganizationDetails = mockCoreClient.getMyOrganizationApiClient().organizationDetails
      .get as ReturnType<typeof vi.fn>;
    listOrganizations = mockCoreClient.getMyAccountApiClient().organizations.list as ReturnType<
      typeof vi.fn
    >;
    listOrganizations.mockResolvedValue(createMockUserOrganizationsPage(organizations));
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  describe('when the user has organizations', () => {
    it('renders a row per organization with name and identifier', async () => {
      renderWithProviders(<OrganizationTable />);

      expect(await screen.findByText('Acme Corp.')).toBeInTheDocument();
      expect(screen.getByText('Fabrikam Inc.')).toBeInTheDocument();
      expect(screen.getByText('org_abc123')).toBeInTheDocument();
      expect(screen.getByText('fabrikam')).toBeInTheDocument();
    });

    it('falls back to the name when there is no display name', async () => {
      renderWithProviders(<OrganizationTable />);

      await screen.findByText('Acme Corp.');
      expect(screen.getAllByText('contoso').length).toBeGreaterThan(1);
    });
  });

  describe('when the user has no organizations', () => {
    it('shows the empty message', async () => {
      listOrganizations.mockResolvedValue(createMockUserOrganizationsPage([]));

      renderWithProviders(<OrganizationTable />);

      expect(await screen.findByText('table.empty_message')).toBeInTheDocument();
    });
  });

  describe('when loading the organizations fails', () => {
    it('shows the error message instead of the empty message', async () => {
      listOrganizations.mockRejectedValue(new Error('Network error'));

      renderWithProviders(<OrganizationTable />);

      expect(await screen.findByText('table.error_message')).toBeInTheDocument();
      expect(screen.getByText('table.error_description')).toBeInTheDocument();
      expect(screen.queryByText('table.empty_message')).not.toBeInTheDocument();
    });

    it('replaces the whole table, without column headers or pagination', async () => {
      listOrganizations.mockRejectedValue(new Error('Network error'));

      renderWithProviders(<OrganizationTable />);

      await screen.findByText('table.error_message');
      expect(screen.queryByText('table.columns.name')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Go to next page')).not.toBeInTheDocument();
    });

    it('styles the error card with its own class, not the table class', async () => {
      listOrganizations.mockRejectedValue(new Error('Network error'));

      const { container } = renderWithProviders(
        <OrganizationTable
          styling={{
            classes: {
              'OrganizationTable-errorState': 'custom-error-state',
              'OrganizationTable-table': 'custom-table',
            },
          }}
        />,
      );

      const message = await screen.findByText('table.error_message');
      expect(container.querySelector('.custom-error-state')).toContainElement(message);
      expect(container.querySelector('.custom-table')).toBeNull();
    });

    it('keeps showing the loaded organizations when a refresh fails', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationTable />);
      await screen.findByText('Acme Corp.');

      listOrganizations.mockRejectedValueOnce(new Error('Network error'));
      await user.click(screen.getByRole('button', { name: /refresh/i }));

      await waitFor(() => expect(listOrganizations).toHaveBeenCalledTimes(2));
      expect(screen.getByText('Acme Corp.')).toBeInTheDocument();
      expect(screen.queryByText('table.error_message')).not.toBeInTheDocument();
    });

    it('retries loading from the error state', async () => {
      const user = userEvent.setup();
      listOrganizations.mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<OrganizationTable />);

      await user.click(await screen.findByRole('button', { name: 'table.retry_button_text' }));

      expect(await screen.findByText('Acme Corp.')).toBeInTheDocument();
      expect(listOrganizations).toHaveBeenCalledTimes(2);
    });
  });

  describe('when onEditOrganization is provided', () => {
    it('edits from the row actions menu', async () => {
      const user = userEvent.setup();
      const onEditOrganization = vi.fn();
      const acme = createMockUserOrganization();
      listOrganizations.mockResolvedValue(createMockUserOrganizationsPage([acme]));

      renderWithProviders(<OrganizationTable onEditOrganization={onEditOrganization} />);

      await user.click(await screen.findByRole('button', { name: 'table.actions.menu_label' }));
      await user.click(await screen.findByRole('menuitem', { name: /edit_button_text/ }));

      expect(onEditOrganization).toHaveBeenCalledWith(acme);
      expect(
        screen.queryByRole('menuitem', { name: /delete_button_text/ }),
      ).not.toBeInTheDocument();
    });

    it('edits when a row is clicked', async () => {
      const user = userEvent.setup();
      const onEditOrganization = vi.fn();

      renderWithProviders(<OrganizationTable onEditOrganization={onEditOrganization} />);

      await user.click(await screen.findByText('Fabrikam Inc.'));

      expect(onEditOrganization).toHaveBeenCalledWith(organizations[1]);
    });
  });

  describe('when deleteAction is provided', () => {
    const CURRENT_ORGANIZATION_ID = 'org_abc123';

    const openRowMenu = async (user: ReturnType<typeof userEvent.setup>, row: number) => {
      const menus = await screen.findAllByRole('button', { name: 'table.actions.menu_label' });
      await user.click(menus[row]!);
      return screen.findByRole('menuitem', { name: /delete_button_text/ });
    };

    const confirmInDialog = async (user: ReturnType<typeof userEvent.setup>, name: string) => {
      const dialog = await screen.findByRole('dialog');
      await user.type(within(dialog).getByLabelText('organization_name_field_label'), name);
      await user.click(within(dialog).getByRole('button', { name: 'delete_button_label' }));
    };

    it('deletes the signed-in organization after its name is typed, and removes its row', async () => {
      const user = userEvent.setup();
      const onAfter = vi.fn();

      renderWithProviders(
        <OrganizationTable
          currentOrganizationId={CURRENT_ORGANIZATION_ID}
          deleteAction={{ onAfter }}
        />,
      );

      await user.click(await openRowMenu(user, 0));
      await confirmInDialog(user, 'acme');

      await waitFor(() => expect(onAfter).toHaveBeenCalledWith(organizations[0]));
      expect(deleteOrganization).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Acme Corp.')).not.toBeInTheDocument();
      expect(screen.getByText('Fabrikam Inc.')).toBeInTheDocument();
    });

    it('disables delete for another organization and says why', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationTable currentOrganizationId={CURRENT_ORGANIZATION_ID} deleteAction={{}} />,
      );

      const deleteItem = await openRowMenu(user, 1);

      expect(deleteItem).toHaveAttribute('data-disabled');
      expect(deleteItem).toHaveTextContent('table.actions.delete_other_organization_hint');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('disables delete for every row when the signed-in organization is unknown', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrganizationTable deleteAction={{}} />);

      const deleteItem = await openRowMenu(user, 0);

      expect(deleteItem).toHaveAttribute('data-disabled');
      expect(deleteItem).toHaveTextContent('table.actions.delete_other_organization_hint');
    });

    it('disables delete for the signed-in organization without the delete permission', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationTable currentOrganizationId={CURRENT_ORGANIZATION_ID} deleteAction={{}} />,
        { permissions: ['read:my_org:details'] },
      );

      const deleteItem = await openRowMenu(user, 0);

      expect(deleteItem).toHaveAttribute('data-disabled');
      expect(deleteItem).toHaveTextContent('error.forbidden');
    });

    it('disables delete when deleteAction.disabled is set, without a hint', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrganizationTable
          currentOrganizationId={CURRENT_ORGANIZATION_ID}
          deleteAction={{ disabled: true }}
        />,
      );

      const deleteItem = await openRowMenu(user, 0);

      expect(deleteItem).toHaveAttribute('data-disabled');
      expect(deleteItem).toHaveTextContent(/^table.actions.delete_button_text$/);
    });

    it('keeps the row and reports it when other members block the delete', async () => {
      const user = userEvent.setup();
      const onAfter = vi.fn();
      deleteOrganization.mockRejectedValueOnce(
        Object.assign(new Error('Forbidden'), { statusCode: 403 }),
      );

      renderWithProviders(
        <OrganizationTable
          currentOrganizationId={CURRENT_ORGANIZATION_ID}
          deleteAction={{ onAfter }}
        />,
      );

      await user.click(await openRowMenu(user, 0));
      await confirmInDialog(user, 'acme');

      await waitFor(() =>
        expect(mockedShowToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'error', message: 'notifications.not_empty_error' }),
        ),
      );
      expect(onAfter).not.toHaveBeenCalled();
      expect(screen.getByText('Acme Corp.')).toBeInTheDocument();
    });

    it('does not delete when deleteAction.onBefore returns false', async () => {
      const user = userEvent.setup();
      const onBefore = vi.fn().mockReturnValue(false);

      renderWithProviders(
        <OrganizationTable
          currentOrganizationId={CURRENT_ORGANIZATION_ID}
          deleteAction={{ onBefore }}
        />,
      );

      await user.click(await openRowMenu(user, 0));
      await confirmInDialog(user, 'acme');

      await waitFor(() => expect(onBefore).toHaveBeenCalledWith(organizations[0]));
      expect(deleteOrganization).not.toHaveBeenCalled();
    });
  });

  describe('when deleteAction.onSwitchOrganization is provided', () => {
    const openRowMenu = async (user: ReturnType<typeof userEvent.setup>, row: number) => {
      const menus = await screen.findAllByRole('button', { name: 'table.actions.menu_label' });
      await user.click(menus[row]!);
      return screen.findByRole('menuitem', { name: /delete_button_text/ });
    };

    const confirmInDialog = async (user: ReturnType<typeof userEvent.setup>, name: string) => {
      const dialog = await screen.findByRole('dialog');
      await user.type(within(dialog).getByLabelText('organization_name_field_label'), name);
      await user.click(within(dialog).getByRole('button', { name: 'delete_button_label' }));
    };

    it('enables delete for another organization and asks the host to switch to it', async () => {
      const user = userEvent.setup();
      const onSwitchOrganization = vi.fn();

      renderWithProviders(
        <OrganizationTable
          currentOrganizationId="org_abc123"
          deleteAction={{ onSwitchOrganization }}
        />,
      );

      const deleteItem = await openRowMenu(user, 1);
      expect(deleteItem).not.toHaveAttribute('data-disabled');
      expect(deleteItem).not.toHaveTextContent('delete_other_organization_hint');
      await user.click(deleteItem);

      expect(onSwitchOrganization).toHaveBeenCalledWith(organizations[1]);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(deleteOrganization).not.toHaveBeenCalled();
    });

    it('opens the confirmation for that organization once the user is signed in to it', async () => {
      const user = userEvent.setup();
      const onAfter = vi.fn();

      renderWithProviders(
        <OrganizationTable
          currentOrganizationId="org_def456"
          deleteConfirmationOrganizationId="org_def456"
          deleteAction={{ onSwitchOrganization: vi.fn(), onAfter }}
        />,
      );

      await confirmInDialog(user, 'fabrikam');

      await waitFor(() => expect(onAfter).toHaveBeenCalledWith(organizations[1]));
      expect(deleteOrganization).toHaveBeenCalledTimes(1);
    });

    it('opens it only once, even when the list refreshes after it was cancelled', async () => {
      const user = userEvent.setup();
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

      renderWithProviders(
        <OrganizationTable
          currentOrganizationId="org_def456"
          deleteConfirmationOrganizationId="org_def456"
          deleteAction={{ onSwitchOrganization: vi.fn() }}
        />,
        { queryClient },
      );
      const dialog = await screen.findByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: 'cancel_button_label' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

      // A refresh that brings changed data gives the row a new object.
      listOrganizations.mockResolvedValue(
        createMockUserOrganizationsPage([
          organizations[0]!,
          { ...organizations[1]!, display_name: 'Fabrikam (renamed)' },
        ]),
      );
      const callsBefore = listOrganizations.mock.calls.length;
      await act(async () => {
        await queryClient.refetchQueries({ queryKey: userOrganizationQueryKeys.all });
      });
      await waitFor(() => expect(listOrganizations.mock.calls.length).toBeGreaterThan(callsBefore));
      expect(await screen.findByText('Fabrikam (renamed)')).toBeInTheDocument();
      await act(() => new Promise((resolve) => setTimeout(resolve, 50)));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('does not open it for an organization the user is not signed in to', async () => {
      renderWithProviders(
        <OrganizationTable
          currentOrganizationId="org_abc123"
          deleteConfirmationOrganizationId="org_def456"
          deleteAction={{ onSwitchOrganization: vi.fn() }}
        />,
      );

      await screen.findByText('Fabrikam Inc.');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('uses the organization details when it is not on the loaded page', async () => {
      const user = userEvent.setup();
      getOrganizationDetails.mockResolvedValue({
        id: 'org_zzz',
        name: 'zeta',
        display_name: 'Zeta',
      });

      renderWithProviders(
        <OrganizationTable
          currentOrganizationId="org_zzz"
          deleteConfirmationOrganizationId="org_zzz"
          deleteAction={{ onSwitchOrganization: vi.fn() }}
        />,
      );

      await confirmInDialog(user, 'zeta');

      await waitFor(() => expect(deleteOrganization).toHaveBeenCalledTimes(1));
    });

    it('explains why it does not open when the user cannot delete that organization', async () => {
      renderWithProviders(
        <OrganizationTable
          currentOrganizationId="org_def456"
          deleteConfirmationOrganizationId="org_def456"
          deleteAction={{ onSwitchOrganization: vi.fn() }}
        />,
        { permissions: ['read:my_org:details'] },
      );

      await waitFor(() =>
        expect(mockedShowToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'error', message: 'error.forbidden' }),
        ),
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('when onCreateOrganization is provided', () => {
    it('shows the create button in the header', async () => {
      const user = userEvent.setup();
      const onCreateOrganization = vi.fn();

      renderWithProviders(<OrganizationTable onCreateOrganization={onCreateOrganization} />);

      await user.click(await screen.findByRole('button', { name: /header.create_button_text/ }));

      expect(onCreateOrganization).toHaveBeenCalledTimes(1);
    });

    it('shows the create button in the empty state too', async () => {
      listOrganizations.mockResolvedValue(createMockUserOrganizationsPage([]));

      renderWithProviders(<OrganizationTable onCreateOrganization={vi.fn()} />);

      expect(await screen.findByText('table.empty_message')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /header.create_button_text/ })).toBeInTheDocument();
    });
  });

  describe('when onCreateOrganization is not provided', () => {
    it('hides the create button', async () => {
      renderWithProviders(<OrganizationTable />);

      await screen.findByText('Acme Corp.');
      expect(
        screen.queryByRole('button', { name: /header.create_button_text/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe('when no row callbacks are provided', () => {
    it('does not render row actions', async () => {
      renderWithProviders(<OrganizationTable />);

      await screen.findByText('Acme Corp.');
      expect(
        screen.queryByRole('button', { name: 'table.actions.menu_label' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('when there is another page', () => {
    it('requests the next page with the checkpoint token', async () => {
      const user = userEvent.setup();
      listOrganizations.mockResolvedValueOnce(
        createMockUserOrganizationsPage(organizations, 'next_token'),
      );

      renderWithProviders(<OrganizationTable />);

      await screen.findByText('Acme Corp.');
      await user.click(screen.getByLabelText('Go to next page'));

      await waitFor(() =>
        expect(listOrganizations).toHaveBeenLastCalledWith(
          expect.objectContaining({ from: 'next_token' }),
        ),
      );
    });
  });

  describe('while another page loads', () => {
    it('hides the previous rows so they cannot be clicked', async () => {
      const user = userEvent.setup();
      const onEditOrganization = vi.fn();
      listOrganizations
        .mockResolvedValueOnce(createMockUserOrganizationsPage(organizations, 'next_token'))
        .mockReturnValueOnce(new Promise(() => {}));

      renderWithProviders(<OrganizationTable onEditOrganization={onEditOrganization} />);
      await screen.findByText('Acme Corp.');

      await user.click(screen.getByLabelText('Go to next page'));

      await waitFor(() => expect(screen.queryByText('Acme Corp.')).not.toBeInTheDocument());
      expect(onEditOrganization).not.toHaveBeenCalled();
    });
  });

  describe('when a later page is empty', () => {
    it('keeps Previous available so the user can go back', async () => {
      const user = userEvent.setup();
      listOrganizations
        .mockResolvedValueOnce(createMockUserOrganizationsPage(organizations, 'next_token'))
        .mockResolvedValueOnce(createMockUserOrganizationsPage([]));

      renderWithProviders(<OrganizationTable />);
      await screen.findByText('Acme Corp.');

      await user.click(screen.getByLabelText('Go to next page'));

      expect(await screen.findByText('table.empty_message')).toBeInTheDocument();
      await user.click(screen.getByLabelText('Go to previous page'));

      expect(await screen.findByText('Acme Corp.')).toBeInTheDocument();
    });
  });

  describe('when a later page fails to load', () => {
    it('keeps Previous available so the user can go back', async () => {
      const user = userEvent.setup();
      listOrganizations
        .mockResolvedValueOnce(createMockUserOrganizationsPage(organizations, 'next_token'))
        .mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<OrganizationTable />);
      await screen.findByText('Acme Corp.');

      await user.click(screen.getByLabelText('Go to next page'));

      expect(await screen.findByText('table.error_message')).toBeInTheDocument();
      await user.click(screen.getByLabelText('Go to previous page'));

      expect(await screen.findByText('Acme Corp.')).toBeInTheDocument();
    });
  });

  describe('when refreshing an empty later page fails', () => {
    it('keeps Previous available so the user can go back', async () => {
      const user = userEvent.setup();
      listOrganizations
        .mockResolvedValueOnce(createMockUserOrganizationsPage(organizations, 'next_token'))
        .mockResolvedValueOnce(createMockUserOrganizationsPage([]))
        .mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<OrganizationTable />);
      await screen.findByText('Acme Corp.');
      await user.click(screen.getByLabelText('Go to next page'));
      await screen.findByText('table.empty_message');

      await user.click(screen.getByRole('button', { name: /refresh/i }));

      expect(await screen.findByText('table.error_message')).toBeInTheDocument();
      await user.click(screen.getByLabelText('Go to previous page'));

      expect(await screen.findByText('Acme Corp.')).toBeInTheDocument();
    });
  });

  describe('when readOnly is true', () => {
    it('hides the create button and row actions, and ignores row clicks', async () => {
      const user = userEvent.setup();
      const onEditOrganization = vi.fn();

      renderWithProviders(
        <OrganizationTable
          readOnly
          onEditOrganization={onEditOrganization}
          currentOrganizationId="org_abc123"
          deleteAction={{}}
          onCreateOrganization={vi.fn()}
        />,
      );

      await user.click(await screen.findByText('Fabrikam Inc.'));

      expect(onEditOrganization).not.toHaveBeenCalled();
      expect(
        screen.queryByRole('button', { name: /header.create_button_text/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'table.actions.menu_label' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('when hideHeader is true', () => {
    it('does not render the title', async () => {
      renderWithProviders(<OrganizationTable hideHeader />);

      await screen.findByText('Acme Corp.');
      expect(screen.queryByText('header.title')).not.toBeInTheDocument();
    });
  });
});
