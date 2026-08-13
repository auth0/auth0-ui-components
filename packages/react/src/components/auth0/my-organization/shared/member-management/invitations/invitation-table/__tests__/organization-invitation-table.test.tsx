import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OrganizationInvitationTable } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-table/organization-invitation-table';
import { MAX_INVITATIONS_PER_REQUEST } from '@/lib/constants/my-organization/member-management/member-management-constants';
import {
  createMockInvitation,
  createMockInvitations,
  createMockTableProps,
} from '@/tests/utils/__mocks__/my-organization/member-management/invitation.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockToast } from '@/tests/utils/test-setup';

mockToast();

const invitations = createMockInvitations();

afterEach(() => vi.clearAllMocks());

describe('OrganizationInvitationTable', () => {
  describe('selection UI', () => {
    it('does not render selection checkboxes when onSelectedInvitationsChange is not provided', () => {
      renderWithProviders(
        <OrganizationInvitationTable {...createMockTableProps({ invitations })} />,
      );
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('does not render selection checkboxes in read-only mode', () => {
      renderWithProviders(
        <OrganizationInvitationTable
          {...createMockTableProps({
            invitations,
            readOnly: true,
            onSelectedInvitationsChange: vi.fn(),
          })}
        />,
      );
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('renders selection checkboxes when selection is enabled', () => {
      renderWithProviders(
        <OrganizationInvitationTable
          {...createMockTableProps({ invitations, onSelectedInvitationsChange: vi.fn() })}
        />,
      );
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
    });

    it('calls onSelectedInvitationsChange when a row checkbox is clicked', async () => {
      const user = userEvent.setup();
      const onSelectedInvitationsChange = vi.fn();
      renderWithProviders(
        <OrganizationInvitationTable
          {...createMockTableProps({ invitations, onSelectedInvitationsChange })}
        />,
      );
      await user.click(screen.getAllByRole('checkbox', { name: 'data_table.select_row' })[0]!);
      expect(onSelectedInvitationsChange).toHaveBeenCalled();
    });
  });

  describe('bulk revoke button', () => {
    it('is hidden when no invitations are selected', () => {
      renderWithProviders(
        <OrganizationInvitationTable
          {...createMockTableProps({
            invitations,
            onSelectedInvitationsChange: vi.fn(),
            selectedInvitations: [],
          })}
        />,
      );
      expect(
        screen.queryByRole('button', { name: 'invitation.bulk_revoke.button' }),
      ).not.toBeInTheDocument();
    });

    it('shows the singular count label when 1 invitation is selected', () => {
      renderWithProviders(
        <OrganizationInvitationTable
          {...createMockTableProps({
            invitations,
            onSelectedInvitationsChange: vi.fn(),
            selectedInvitations: [invitations[0]!],
          })}
        />,
      );
      expect(screen.getByText('invitation.bulk_revoke.count')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'invitation.bulk_revoke.button' }),
      ).toBeInTheDocument();
    });

    it('shows the plural count label when multiple invitations are selected', () => {
      renderWithProviders(
        <OrganizationInvitationTable
          {...createMockTableProps({
            invitations,
            onSelectedInvitationsChange: vi.fn(),
            selectedInvitations: invitations,
          })}
        />,
      );
      expect(screen.getByText('invitation.bulk_revoke.count_plural')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'invitation.bulk_revoke.button_plural' }),
      ).toBeInTheDocument();
    });

    it('calls onBulkRevoke with the selected invitations when clicked', async () => {
      const user = userEvent.setup();
      const onBulkRevoke = vi.fn();
      renderWithProviders(
        <OrganizationInvitationTable
          {...createMockTableProps({
            invitations,
            onSelectedInvitationsChange: vi.fn(),
            selectedInvitations: invitations,
            onBulkRevoke,
          })}
        />,
      );
      await user.click(
        screen.getByRole('button', { name: 'invitation.bulk_revoke.button_plural' }),
      );
      expect(onBulkRevoke).toHaveBeenCalledWith(invitations);
    });
  });

  describe('selection limit', () => {
    const manyInvitations = Array.from({ length: 14 }, (_, i) =>
      createMockInvitation({ id: `inv_${i}`, invitee: { email: `user${i}@example.com` } }),
    );
    const atCap = manyInvitations.slice(0, MAX_INVITATIONS_PER_REQUEST);

    const rowCheckboxes = () => screen.getAllByRole('checkbox', { name: 'data_table.select_row' });
    const selectAllCheckbox = () => screen.getByRole('checkbox', { name: 'data_table.select_all' });

    it('disables unselected checkboxes once the cap is reached', () => {
      renderWithProviders(
        <OrganizationInvitationTable
          {...createMockTableProps({
            invitations: manyInvitations,
            onSelectedInvitationsChange: vi.fn(),
            selectedInvitations: atCap,
          })}
        />,
      );

      const checkboxes = rowCheckboxes();
      checkboxes
        .slice(0, MAX_INVITATIONS_PER_REQUEST)
        .forEach((cb) => expect(cb).not.toBeDisabled());
      checkboxes.slice(MAX_INVITATIONS_PER_REQUEST).forEach((cb) => expect(cb).toBeDisabled());
    });

    it('does not disable any checkbox below the cap', () => {
      renderWithProviders(
        <OrganizationInvitationTable
          {...createMockTableProps({
            invitations: manyInvitations,
            onSelectedInvitationsChange: vi.fn(),
            selectedInvitations: atCap.slice(0, MAX_INVITATIONS_PER_REQUEST - 1),
          })}
        />,
      );

      rowCheckboxes().forEach((cb) => expect(cb).not.toBeDisabled());
    });

    it('shows the limit message on hover over a disabled checkbox', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <OrganizationInvitationTable
          {...createMockTableProps({
            invitations: manyInvitations,
            onSelectedInvitationsChange: vi.fn(),
            selectedInvitations: atCap,
          })}
        />,
      );

      await user.hover(rowCheckboxes()[MAX_INVITATIONS_PER_REQUEST]!.parentElement!);

      await waitFor(() => {
        expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent(
          'invitation.bulk_revoke.max_selection_message',
        );
      });
    });

    it('reaches the limit message by keyboard, since the disabled checkbox leaves the tab order', async () => {
      renderWithProviders(
        <OrganizationInvitationTable
          {...createMockTableProps({
            invitations: manyInvitations,
            onSelectedInvitationsChange: vi.fn(),
            selectedInvitations: atCap,
          })}
        />,
      );

      const disabled = rowCheckboxes()[MAX_INVITATIONS_PER_REQUEST]!;
      expect(disabled).toBeDisabled();

      // The disabled checkbox is unfocusable, so the tooltip wrapper has to hold the tab stop.
      const wrapper = disabled.parentElement!;
      expect(wrapper).toHaveAttribute('tabindex', '0');

      fireEvent.focus(wrapper);

      await waitFor(() => {
        expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent(
          'invitation.bulk_revoke.max_selection_message',
        );
      });
    });

    it('clamps select-all to the cap instead of selecting the whole page', async () => {
      const user = userEvent.setup();
      const onSelectedInvitationsChange = vi.fn();
      renderWithProviders(
        <OrganizationInvitationTable
          {...createMockTableProps({
            invitations: manyInvitations,
            onSelectedInvitationsChange,
            selectedInvitations: [],
          })}
        />,
      );

      await user.click(selectAllCheckbox());

      expect(onSelectedInvitationsChange.mock.calls[0]![0]).toHaveLength(
        MAX_INVITATIONS_PER_REQUEST,
      );
    });

    it('keeps an already-selected invitation past the cap boundary when select-all clamps', async () => {
      const user = userEvent.setup();
      const onSelectedInvitationsChange = vi.fn();
      const preSelected = manyInvitations[13]!;
      renderWithProviders(
        <OrganizationInvitationTable
          {...createMockTableProps({
            invitations: manyInvitations,
            onSelectedInvitationsChange,
            selectedInvitations: [preSelected],
          })}
        />,
      );

      await user.click(selectAllCheckbox());

      const emitted = onSelectedInvitationsChange.mock.calls[0]![0] as { id?: string }[];
      expect(emitted).toHaveLength(MAX_INVITATIONS_PER_REQUEST);
      expect(emitted.map((invitation) => invitation.id)).toContain(preSelected.id);
    });
  });

  describe('cross-page selection', () => {
    const page1 = Array.from({ length: 3 }, (_, i) =>
      createMockInvitation({ id: `p1_${i}`, invitee: { email: `page1-${i}@example.com` } }),
    );
    const page2 = Array.from({ length: 3 }, (_, i) =>
      createMockInvitation({ id: `p2_${i}`, invitee: { email: `page2-${i}@example.com` } }),
    );

    it('keeps prior-page selections when a row on the current page is checked', async () => {
      const user = userEvent.setup();
      const onSelectedInvitationsChange = vi.fn();
      renderWithProviders(
        <OrganizationInvitationTable
          {...createMockTableProps({
            invitations: page2,
            onSelectedInvitationsChange,
            selectedInvitations: [page1[0]!],
          })}
        />,
      );

      await user.click(screen.getAllByRole('checkbox', { name: 'data_table.select_row' })[0]!);

      const emitted = onSelectedInvitationsChange.mock.calls[0]![0] as { id?: string }[];
      expect(emitted.map((invitation) => invitation.id)).toEqual(['p1_0', 'p2_0']);
    });

    it('keeps prior-page selections when a current-page row is unchecked', async () => {
      const user = userEvent.setup();
      const onSelectedInvitationsChange = vi.fn();
      renderWithProviders(
        <OrganizationInvitationTable
          {...createMockTableProps({
            invitations: page2,
            onSelectedInvitationsChange,
            selectedInvitations: [page1[0]!, page2[0]!],
          })}
        />,
      );

      await user.click(screen.getAllByRole('checkbox', { name: 'data_table.select_row' })[0]!);

      const emitted = onSelectedInvitationsChange.mock.calls[0]![0] as { id?: string }[];
      expect(emitted.map((invitation) => invitation.id)).toEqual(['p1_0']);
    });

    it('keeps prior-page selections when select-all is used on the current page', async () => {
      const user = userEvent.setup();
      const onSelectedInvitationsChange = vi.fn();
      renderWithProviders(
        <OrganizationInvitationTable
          {...createMockTableProps({
            invitations: page2,
            onSelectedInvitationsChange,
            selectedInvitations: [page1[0]!],
          })}
        />,
      );

      await user.click(screen.getByRole('checkbox', { name: 'data_table.select_all' }));

      const emitted = onSelectedInvitationsChange.mock.calls[0]![0] as { id?: string }[];
      expect(emitted.map((invitation) => invitation.id)).toEqual(['p1_0', 'p2_0', 'p2_1', 'p2_2']);
    });

    it('counts off-page selections toward the cap and blocks the visible page', () => {
      const offPage = Array.from({ length: MAX_INVITATIONS_PER_REQUEST }, (_, i) =>
        createMockInvitation({ id: `off_${i}`, invitee: { email: `off${i}@example.com` } }),
      );
      renderWithProviders(
        <OrganizationInvitationTable
          {...createMockTableProps({
            invitations: page2,
            onSelectedInvitationsChange: vi.fn(),
            selectedInvitations: offPage,
          })}
        />,
      );

      screen
        .getAllByRole('checkbox', { name: 'data_table.select_row' })
        .forEach((cb) => expect(cb).toBeDisabled());
      expect(screen.getByRole('checkbox', { name: 'data_table.select_all' })).toBeDisabled();
    });
  });
});
