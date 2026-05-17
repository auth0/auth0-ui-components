import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach } from 'vitest';

import { SearchFilter } from '@/components/auth0/my-organization/shared/member-management/shared/search-filter/search-filter';
import { renderWithProviders } from '@/tests/utils';
import { createMockSearchFilterProps } from '@/tests/utils/__mocks__/my-organization/member-management/invitation.mocks';

describe('SearchFilter', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the filter when roles are provided', () => {
      renderWithProviders(<SearchFilter {...createMockSearchFilterProps()} />);

      expect(screen.getByText(/invitation\.table\.filter_by_role/)).toBeInTheDocument();
    });

    it('should return null when no roles are provided', () => {
      const { container } = renderWithProviders(
        <SearchFilter {...createMockSearchFilterProps({ availableRoles: [] })} />,
      );

      expect(container.innerHTML).toBe('');
    });

    it('should render reset button', () => {
      renderWithProviders(<SearchFilter {...createMockSearchFilterProps()} />);

      expect(
        screen.getByRole('button', { name: 'invitation.table.reset_filter' }),
      ).toBeInTheDocument();
    });

    it('should render member search input on the members tab', () => {
      renderWithProviders(
        <SearchFilter {...createMockSearchFilterProps({ activeTab: 'members' })} />,
      );

      expect(
        screen.getByPlaceholderText('Search for a member by name or email'),
      ).toBeInTheDocument();
    });

    it('should not render member search input on the invitations tab', () => {
      renderWithProviders(
        <SearchFilter {...createMockSearchFilterProps({ activeTab: 'invitations' })} />,
      );

      expect(
        screen.queryByPlaceholderText('Search for a member by name or email'),
      ).not.toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('should update the search input value as the user types', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <SearchFilter {...createMockSearchFilterProps({ activeTab: 'members' })} />,
      );

      const searchInput = screen.getByPlaceholderText('Search for a member by name or email');
      await user.type(searchInput, 'ada@example.com');

      expect(searchInput).toHaveValue('ada@example.com');
    });

    it('should call onSearchTermChange with the current search term on keydown', async () => {
      const user = userEvent.setup();
      const onSearchTermChange = vi.fn();

      renderWithProviders(
        <SearchFilter
          {...createMockSearchFilterProps({ activeTab: 'members', onSearchTermChange })}
        />,
      );

      const searchInput = screen.getByPlaceholderText('Search for a member by name or email');
      await user.type(searchInput, 'ada');
      await user.keyboard('{Enter}');

      expect(onSearchTermChange).toHaveBeenLastCalledWith('ada');
    });

    it('should clear the search input when Escape is pressed', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <SearchFilter {...createMockSearchFilterProps({ activeTab: 'members' })} />,
      );

      const searchInput = screen.getByPlaceholderText('Search for a member by name or email');
      await user.type(searchInput, 'ada');
      await user.keyboard('{Escape}');

      expect(searchInput).toHaveValue('');
    });
  });

  describe('reset button', () => {
    it('should be disabled when no active filter', () => {
      renderWithProviders(<SearchFilter {...createMockSearchFilterProps({ filters: {} })} />);

      const resetButton = screen.getByRole('button', {
        name: 'invitation.table.reset_filter',
      });
      expect(resetButton).toBeDisabled();
    });

    it('should be enabled when there is an active filter', () => {
      renderWithProviders(
        <SearchFilter {...createMockSearchFilterProps({ filters: { roleId: 'role_admin' } })} />,
      );

      const resetButton = screen.getByRole('button', {
        name: 'invitation.table.reset_filter',
      });
      expect(resetButton).toBeEnabled();
    });

    it('should call onRoleFilterChange with undefined when reset is clicked', async () => {
      const user = userEvent.setup();
      const onRoleFilterChange = vi.fn();

      renderWithProviders(
        <SearchFilter
          {...createMockSearchFilterProps({
            filters: { roleId: 'role_admin' },
            onRoleFilterChange,
          })}
        />,
      );

      const resetButton = screen.getByRole('button', {
        name: 'invitation.table.reset_filter',
      });
      await user.click(resetButton);

      expect(onRoleFilterChange).toHaveBeenCalledTimes(1);
      expect(onRoleFilterChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('className', () => {
    it('should apply custom class when provided', () => {
      const customClass = 'custom-filter-class';

      const { container } = renderWithProviders(
        <SearchFilter {...createMockSearchFilterProps({ className: customClass })} />,
      );

      const filterDiv = container.firstChild as HTMLElement;
      expect(filterDiv).toHaveClass(customClass);
    });

    it('should apply default class when no custom class provided', () => {
      const { container } = renderWithProviders(
        <SearchFilter {...createMockSearchFilterProps()} />,
      );

      const filterDiv = container.firstChild as HTMLElement;
      expect(filterDiv).toHaveClass('mt-8', 'mb-6');
    });
  });
});
