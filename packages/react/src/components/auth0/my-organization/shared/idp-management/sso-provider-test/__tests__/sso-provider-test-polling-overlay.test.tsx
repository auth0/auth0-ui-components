import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SsoProviderTestPollingOverlay } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-test/sso-provider-test-polling-overlay';
import { renderWithProviders } from '@/tests/utils/test-provider';

describe('SsoProviderTestPollingOverlay', () => {
  describe('open', () => {
    describe('when false', () => {
      it('should not render', () => {
        renderWithProviders(<SsoProviderTestPollingOverlay open={false} onRetry={vi.fn()} />);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    describe('when true', () => {
      it('should render the trouble text and retry button', () => {
        renderWithProviders(<SsoProviderTestPollingOverlay open onRetry={vi.fn()} />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('trouble_text')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'retry_button_label' })).toBeInTheDocument();
      });

      it('should cover the full page with a theme-aware backdrop', () => {
        renderWithProviders(<SsoProviderTestPollingOverlay open onRetry={vi.fn()} />);

        const backdrop = document.querySelector('[data-slot="dialog-overlay"]');
        expect(backdrop).toHaveClass('fixed', 'inset-0', 'bg-background/50');
        expect(backdrop).not.toHaveClass('bg-black/50');
        expect(screen.getByRole('dialog')).toHaveClass('fixed', 'inset-0');
      });

      it('should use the theme foreground color so text stays readable in dark mode', () => {
        renderWithProviders(<SsoProviderTestPollingOverlay open onRetry={vi.fn()} />);

        expect(screen.getByRole('dialog')).toHaveClass('text-foreground');
      });

      it('should not render the content as a card', () => {
        renderWithProviders(<SsoProviderTestPollingOverlay open onRetry={vi.fn()} />);

        const dialog = screen.getByRole('dialog');
        expect(dialog).not.toHaveClass('bg-background');
        expect(dialog).not.toHaveClass('shadow-bevel-2xl');
      });

      it('should not render a close button', () => {
        renderWithProviders(<SsoProviderTestPollingOverlay open onRetry={vi.fn()} />);

        expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
      });
    });
  });

  describe('dismissal', () => {
    describe('when Escape is pressed', () => {
      it('should stay open', async () => {
        const user = userEvent.setup();
        renderWithProviders(<SsoProviderTestPollingOverlay open onRetry={vi.fn()} />);

        await user.keyboard('{Escape}');

        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('retryDisabled', () => {
    describe('when true', () => {
      it('should disable the retry button', () => {
        renderWithProviders(<SsoProviderTestPollingOverlay open onRetry={vi.fn()} retryDisabled />);

        expect(screen.getByRole('button', { name: 'retry_button_label' })).toBeDisabled();
      });
    });
  });

  describe('onRetry', () => {
    describe('when the retry button is clicked', () => {
      it('should call onRetry', async () => {
        const user = userEvent.setup();
        const onRetry = vi.fn();
        renderWithProviders(<SsoProviderTestPollingOverlay open onRetry={onRetry} />);

        await user.click(screen.getByRole('button', { name: 'retry_button_label' }));

        expect(onRetry).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('blockedTestUrl', () => {
    describe('when set', () => {
      it('should render a safe link to the test window', () => {
        renderWithProviders(
          <SsoProviderTestPollingOverlay
            open
            onRetry={vi.fn()}
            blockedTestUrl="https://example.auth0.com/try-connection?token=abc"
          />,
        );

        expect(screen.getByText('popup_blocked_text')).toBeInTheDocument();
        const link = screen.getByRole('link', { name: 'open_window_link_label' });
        expect(link).toHaveAttribute('href', 'https://example.auth0.com/try-connection?token=abc');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    describe('when not set', () => {
      it('should not render the link', () => {
        renderWithProviders(<SsoProviderTestPollingOverlay open onRetry={vi.fn()} />);

        expect(screen.queryByRole('link')).not.toBeInTheDocument();
      });
    });
  });

  describe('customMessages', () => {
    it('should override the default text', () => {
      renderWithProviders(
        <SsoProviderTestPollingOverlay
          open
          onRetry={vi.fn()}
          customMessages={{ retry_button_label: 'Start over' }}
        />,
      );

      expect(screen.getByRole('button', { name: 'Start over' })).toBeInTheDocument();
    });
  });
});
