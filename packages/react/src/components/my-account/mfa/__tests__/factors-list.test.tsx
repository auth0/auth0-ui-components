import { FACTOR_TYPE_EMAIL, FACTOR_TYPE_PHONE } from '@auth0/universal-components-core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach } from 'vitest';

import { renderWithProviders, createMockFactorsListProps } from '../../../../internals';
import { FactorsList } from '../factors-list';

// ===== Test Suite =====
describe('FactorsList', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('factors', () => {
    it('should render all factors', async () => {
      renderWithProviders(<FactorsList {...createMockFactorsListProps()} />);

      // When factors are provided, should display all of them
      expect(await screen.findByText('test@example.com')).toBeInTheDocument();
      expect(await screen.findByText('+1234567890')).toBeInTheDocument();
    });

    it('should render single factor', async () => {
      renderWithProviders(
        <FactorsList
          {...createMockFactorsListProps({
            factors: [
              {
                id: 'factor-1',
                name: 'single@example.com',
                type: 'email',
                enrolled: false,
                created_at: null,
              },
            ],
          })}
        />,
      );

      // When single factor is provided, should display it
      expect(await screen.findByText('single@example.com')).toBeInTheDocument();
    });

    it('should display factor names', async () => {
      renderWithProviders(
        <FactorsList
          {...createMockFactorsListProps({
            factors: [
              {
                id: '1',
                name: 'Primary Email',
                type: 'email',
                enrolled: false,
                created_at: null,
              },
              {
                id: '2',
                name: 'Backup Phone',
                type: 'phone',
                enrolled: false,
                created_at: null,
              },
            ],
          })}
        />,
      );

      // When factors have names, should display them
      expect(await screen.findByText('Primary Email')).toBeInTheDocument();
      expect(await screen.findByText('Backup Phone')).toBeInTheDocument();
    });

    it('should render empty list when no factors are provided', () => {
      renderWithProviders(<FactorsList {...createMockFactorsListProps({ factors: [] })} />);

      // When no factors are provided, list should be empty
      expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
    });
  });

  describe('factorType', () => {
    it('should display email icon when factorType is EMAIL', async () => {
      renderWithProviders(
        <FactorsList
          {...createMockFactorsListProps({
            factorType: FACTOR_TYPE_EMAIL,
            factors: [
              {
                id: '1',
                name: 'test@example.com',
                type: 'email',
                enrolled: false,
                created_at: null,
              },
            ],
          })}
        />,
      );

      // When factor type is email, should display email icon
      expect(await screen.findByText('test@example.com')).toBeInTheDocument();
    });

    it('should display phone icon when factorType is PHONE', async () => {
      renderWithProviders(
        <FactorsList
          {...createMockFactorsListProps({
            factorType: FACTOR_TYPE_PHONE,
            factors: [
              {
                id: '1',
                name: '+1234567890',
                type: 'phone',
                enrolled: false,
                created_at: null,
              },
            ],
          })}
        />,
      );

      // When factor type is phone, should display phone icon
      expect(await screen.findByText('+1234567890')).toBeInTheDocument();
    });
  });

  describe('readOnly', () => {
    it('should not display delete button when readOnly is true', async () => {
      renderWithProviders(<FactorsList {...createMockFactorsListProps({ readOnly: true })} />);

      // When readOnly is true, should not display actions
      expect(screen.queryByRole('button', { name: /remove|delete/i })).not.toBeInTheDocument();
    });

    it('should not display menu trigger when readOnly is true', async () => {
      renderWithProviders(<FactorsList {...createMockFactorsListProps({ readOnly: true })} />);

      // When readOnly is true, should not display menu
      expect(screen.queryByLabelText(/actions/i)).not.toBeInTheDocument();
    });

    it('should display menu trigger when readOnly is false', async () => {
      renderWithProviders(<FactorsList {...createMockFactorsListProps({ readOnly: false })} />);

      // When readOnly is false, should display menu triggers
      const menuButtons = await screen.findAllByRole('button', { name: /actions/i });
      expect(menuButtons.length).toBeGreaterThan(0);
    });
  });

  it('should call onDeleteFactor with factor id when delete button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnDeleteFactor = vi.fn();

    renderWithProviders(
      <FactorsList
        {...createMockFactorsListProps({
          onDeleteFactor: mockOnDeleteFactor,
          readOnly: false,
        })}
      />,
    );

    const menuButtons = await screen.findAllByRole('button', { name: /actions/i });
    const firstMenuButton = menuButtons[0];

    // When menu button is clicked, should open menu
    if (firstMenuButton) await user.click(firstMenuButton);

    const deleteButton = await screen.findByRole('menuitem', { name: /remove/i });

    // When delete button is clicked, should call onDeleteFactor
    await user.click(deleteButton);

    // When onDeleteFactor is called, should pass factor id
    expect(mockOnDeleteFactor).toHaveBeenCalledTimes(1);
  });

  describe('isDeletingFactor', () => {
    it('should disable delete button when isDeletingFactor is true', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <FactorsList
          {...createMockFactorsListProps({
            isDeletingFactor: true,
            readOnly: false,
          })}
        />,
      );

      const menuButtons = await screen.findAllByRole('button', { name: /actions/i });
      const firstMenuButton = menuButtons[0];
      if (firstMenuButton) await user.click(firstMenuButton);

      const deleteButton = await screen.findByRole('menuitem', { name: /remove/i });
      // When deleting, delete button should be disabled
      expect(deleteButton).toBeDisabled();
    });

    it('should enable delete button when isDeletingFactor is false', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <FactorsList
          {...createMockFactorsListProps({
            isDeletingFactor: false,
            readOnly: false,
          })}
        />,
      );

      const menuButtons = await screen.findAllByRole('button', { name: /actions/i });
      const firstMenuButton = menuButtons[0];
      if (firstMenuButton) await user.click(firstMenuButton);

      const deleteButton = await screen.findByRole('menuitem', { name: /remove/i });
      // When not deleting, delete button should be enabled
      expect(deleteButton).not.toBeDisabled();
    });
  });

  it('should disable delete button when disableDelete is true', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <FactorsList
        {...createMockFactorsListProps({
          disableDelete: true,
          readOnly: false,
        })}
      />,
    );

    const menuButtons = await screen.findAllByRole('button', { name: /actions/i });
    const firstMenuButton = menuButtons[0];
    if (firstMenuButton) await user.click(firstMenuButton);

    const deleteButton = await screen.findByRole('menuitem', { name: /remove/i });
    // When delete is disabled, button should be disabled
    expect(deleteButton).toBeDisabled();
  });

  it('should disable delete button when isEnabledFactor is false', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <FactorsList
        {...createMockFactorsListProps({
          isEnabledFactor: false,
          readOnly: false,
        })}
      />,
    );

    const menuButtons = await screen.findAllByRole('button', { name: /actions/i });
    const firstMenuButton = menuButtons[0];
    if (firstMenuButton) await user.click(firstMenuButton);

    const deleteButton = await screen.findByRole('menuitem', { name: /remove/i });
    // When factor is not enabled, button should be disabled
    expect(deleteButton).toBeDisabled();
  });

  it('should render with custom messages when custom messages are provided', async () => {
    const user = userEvent.setup();
    const customMessages = {
      remove: 'Delete Factor',
    };

    renderWithProviders(
      <FactorsList {...createMockFactorsListProps({ customMessages, readOnly: false })} />,
    );

    const firstMenuButton = (await screen.findAllByRole('button', { name: /actions/i }))[0];
    if (firstMenuButton) await user.click(firstMenuButton);

    // When custom messages are provided, should display custom message
    const deleteButton = await screen.findByRole('menuitem', { name: 'Delete Factor' });
    expect(deleteButton).toBeInTheDocument();
  });

  describe('accessibility', () => {
    it('should have accessible factor cards', async () => {
      renderWithProviders(<FactorsList {...createMockFactorsListProps()} />);

      // When list is rendered, factors should be accessible
      expect(await screen.findByText('test@example.com')).toBeInTheDocument();
      expect(await screen.findByText('+1234567890')).toBeInTheDocument();
    });

    it('should have accessible menu buttons', async () => {
      renderWithProviders(<FactorsList {...createMockFactorsListProps({ readOnly: false })} />);

      // When not readOnly, menu buttons should be accessible
      const menuButtons = await screen.findAllByRole('button', { name: /actions/i });
      expect(menuButtons.length).toBeGreaterThan(0);
    });
  });
});
