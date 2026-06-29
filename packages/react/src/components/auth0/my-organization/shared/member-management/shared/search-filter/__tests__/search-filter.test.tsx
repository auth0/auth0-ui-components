import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';

import { SearchFilter } from '@/components/auth0/my-organization/shared/member-management/shared/search-filter/search-filter';
import { createMockSearchFilterProps } from '@/tests/utils/__mocks__/my-organization/member-management/invitation.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

describe('SearchFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

    it('should not render member search input on the invitations tab', () => {
      renderWithProviders(
        <SearchFilter {...createMockSearchFilterProps({ activeTab: 'invitations' })} />,
      );

      expect(
        screen.queryByPlaceholderText('Search for a member by name or email'),
      ).not.toBeInTheDocument();
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
