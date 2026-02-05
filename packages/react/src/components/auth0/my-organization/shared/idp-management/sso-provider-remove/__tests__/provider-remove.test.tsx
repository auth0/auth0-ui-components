import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { SsoProviderRemoveFromOrganization } from '../provider-remove';

import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createMockSsoProvider, mockCore, renderWithProviders } from '@/tests/utils';
import type { SsoProviderRemoveFromOrganizationProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-delete-types';

// ===== Mock packages =====

const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====
const createMockRemove = (
  overrides?: Partial<SsoProviderRemoveFromOrganizationProps>,
): SsoProviderRemoveFromOrganizationProps => ({
  provider: createMockSsoProvider(),
  organizationName: 'Test Organization',
  isLoading: false,
  customMessages: {},
  onRemove: vi.fn(),
  ...overrides,
});

// ===== Tests =====

describe('SsoProviderRemoveFromOrg', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Initialize fresh mock client for each test
    mockCoreClient = initMockCoreClient();

    // Mock hooks
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('rendering', () => {
    describe('when provider is provided', () => {
      it('should render remove button', () => {
        const provider = createMockSsoProvider({ name: 'test-provider' });
        renderWithProviders(
          <SsoProviderRemoveFromOrganization {...createMockRemove({ provider })} />,
        );

        expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
      });
    });
  });

  describe('isLoading', () => {
    describe('when is false', () => {
      it('should enable remove button', () => {
        renderWithProviders(
          <SsoProviderRemoveFromOrganization {...createMockRemove({ isLoading: false })} />,
        );

        const removeButton = screen.getByRole('button', { name: /remove/i });
        expect(removeButton).not.toBeDisabled();
      });
    });
  });

  describe('handleRemove', () => {
    describe('when user clicks remove button', () => {
      it('should open confirmation modal', async () => {
        const user = userEvent.setup();
        const provider = createMockSsoProvider({ name: 'test-provider' });

        renderWithProviders(
          <SsoProviderRemoveFromOrganization {...createMockRemove({ provider })} />,
        );

        const removeButton = screen.getByRole('button', { name: /remove/i });
        await user.click(removeButton);

        expect(screen.getByText(/modal.title/i)).toBeInTheDocument();
      });
    });

    describe('when confirmation is completed', () => {
      it('should call onRemove with provider', async () => {
        const user = userEvent.setup();
        const provider = createMockSsoProvider({ name: 'test-provider' });
        const mockOnRemove = vi.fn();

        renderWithProviders(
          <SsoProviderRemoveFromOrganization
            {...createMockRemove({ provider, onRemove: mockOnRemove })}
          />,
        );

        // Click remove button to open modal
        const removeButton = screen.getByRole('button', { name: /remove/i });
        await user.click(removeButton);

        // Type confirmation text
        const textField = screen.getByPlaceholderText('field.placeholder');
        await user.type(textField, 'test-provider');

        // Click confirm remove
        const confirmButton = screen.getByRole('button', {
          name: /modal.actions.remove_button_text/i,
        });
        await user.click(confirmButton);

        expect(mockOnRemove).toHaveBeenCalledWith(provider);
      });

      it('should close modal after removal', async () => {
        const user = userEvent.setup();
        const provider = createMockSsoProvider({ name: 'test-provider' });

        renderWithProviders(
          <SsoProviderRemoveFromOrganization {...createMockRemove({ provider })} />,
        );

        // Click remove button to open modal
        const removeButton = screen.getByRole('button', { name: /remove/i });
        await user.click(removeButton);

        // Type confirmation text
        const textField = screen.getByPlaceholderText('field.placeholder');
        await user.type(textField, 'test-provider');

        // Click confirm remove
        const confirmButton = screen.getByRole('button', {
          name: /modal.actions.remove_button_text/i,
        });
        await user.click(confirmButton);

        expect(screen.queryByText(/modal.title/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('modal cancel', () => {
    describe('when user cancels removal', () => {
      it('should close modal without calling onRemove', async () => {
        const user = userEvent.setup();
        const provider = createMockSsoProvider({ name: 'test-provider' });
        const mockOnRemove = vi.fn();

        renderWithProviders(
          <SsoProviderRemoveFromOrganization
            {...createMockRemove({ provider, onRemove: mockOnRemove })}
          />,
        );

        // Click remove button to open modal
        const removeButton = screen.getByRole('button', { name: /remove/i });
        await user.click(removeButton);

        // Click cancel
        const cancelButton = screen.getByRole('button', {
          name: /modal.actions.cancel_button_text/i,
        });
        await user.click(cancelButton);

        expect(mockOnRemove).not.toHaveBeenCalled();
        expect(screen.queryByText(/modal.title/i)).not.toBeInTheDocument();
      });
    });
  });
});
