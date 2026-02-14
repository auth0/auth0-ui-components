import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { SsoProviderAttributeSyncAlert } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provider-attribute-sync-alert';
import { renderWithProviders } from '@/tests/utils';
import type { SsoProviderAttributeSyncAlertProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-edit-types';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: (key: string) => key,
  }),
}));

describe('SsoProviderAttributeSyncAlert', () => {
  const defaultProps: SsoProviderAttributeSyncAlertProps = {
    onSync: vi.fn(),
    isSyncing: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the alert with title and description keys', () => {
      renderWithProviders(<SsoProviderAttributeSyncAlert {...defaultProps} />);

      // Replace hardcoded strings with the translation keys
      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('description')).toBeInTheDocument();
    });

    it('should render the sync button using the translation key', () => {
      renderWithProviders(<SsoProviderAttributeSyncAlert {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'sync_button_label' })).toBeInTheDocument();
    });
  });

  describe('sync button interactions', () => {
    it('should open confirmation modal with correct keys when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SsoProviderAttributeSyncAlert {...defaultProps} />);

      const syncButton = screen.getByRole('button', { name: 'sync_button_label' });
      await user.click(syncButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('sync_modal.title')).toBeInTheDocument();
      expect(screen.getByText('sync_modal.description')).toBeInTheDocument();
    });
  });

  describe('confirmation modal', () => {
    it('should close modal when cancel key button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SsoProviderAttributeSyncAlert {...defaultProps} />);

      // Open modal
      await user.click(screen.getByRole('button', { name: 'sync_button_label' }));

      // Click cancel using key
      const cancelButton = screen.getByRole('button', {
        name: 'sync_modal.actions.cancel_button_label',
      });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should call onSync and close modal when proceed key button is clicked', async () => {
      const onSync = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      renderWithProviders(<SsoProviderAttributeSyncAlert {...defaultProps} onSync={onSync} />);

      await user.click(screen.getByRole('button', { name: 'sync_button_label' }));

      // Click proceed using key
      const proceedButton = screen.getByRole('button', {
        name: 'sync_modal.actions.proceed_button_label',
      });
      await user.click(proceedButton);

      await waitFor(() => {
        expect(onSync).toHaveBeenCalled();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });
});
