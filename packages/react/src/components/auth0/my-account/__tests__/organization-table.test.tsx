import { screen, waitFor } from '@testing-library/react';
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
import { mockCore } from '@/tests/utils/test-setup';

const { initMockCoreClient } = mockCore();

describe('OrganizationTable', () => {
  const organizations = createMockUserOrganizations();
  let listOrganizations: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const mockCoreClient = initMockCoreClient();
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

  describe('when onDeleteOrganization is provided', () => {
    it('deletes from the row actions menu', async () => {
      const user = userEvent.setup();
      const onDeleteOrganization = vi.fn();
      const acme = createMockUserOrganization();
      listOrganizations.mockResolvedValue(createMockUserOrganizationsPage([acme]));

      renderWithProviders(<OrganizationTable onDeleteOrganization={onDeleteOrganization} />);

      await user.click(await screen.findByRole('button', { name: 'table.actions.menu_label' }));
      await user.click(await screen.findByRole('menuitem', { name: /delete_button_text/ }));

      expect(onDeleteOrganization).toHaveBeenCalledWith(acme);
    });

    it('does not handle row clicks', async () => {
      const user = userEvent.setup();
      const onDeleteOrganization = vi.fn();

      renderWithProviders(<OrganizationTable onDeleteOrganization={onDeleteOrganization} />);

      await user.click(await screen.findByText('Fabrikam Inc.'));

      expect(onDeleteOrganization).not.toHaveBeenCalled();
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

  describe('when readOnly is true', () => {
    it('hides the create button and row actions, and ignores row clicks', async () => {
      const user = userEvent.setup();
      const onEditOrganization = vi.fn();

      renderWithProviders(
        <OrganizationTable
          readOnly
          onEditOrganization={onEditOrganization}
          onDeleteOrganization={vi.fn()}
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
