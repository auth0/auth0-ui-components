import { createMfaStepUpError } from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { GateKeeperContext } from '@/providers/gate-keeper-context';
import { renderWithProviders } from '@/tests/utils/test-provider';

describe('GateKeeper', () => {
  it('shows a spinner, not the content, while loading', () => {
    const { container } = renderWithProviders(
      <GateKeeper isLoading>
        <p>content</p>
      </GateKeeper>,
    );

    expect(container.querySelector('.auth0-universal .animate-spin')).not.toBeNull();
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('shows the content once it loaded', () => {
    const { container } = renderWithProviders(
      <GateKeeper isLoading={false}>
        <p>content</p>
      </GateKeeper>,
    );

    expect(screen.getByText('content')).toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeNull();
  });

  it('applies the variables of the styling to its scope', () => {
    const { container } = renderWithProviders(
      <GateKeeper
        isLoading
        // The suite's mock of getComponentStyles hands the styling back as it is.
        styling={{ variables: { '--radius-2xl': '0px' } } as never}
      >
        <p>content</p>
      </GateKeeper>,
    );

    const scope = container
      .querySelector('.animate-spin')
      ?.closest<HTMLElement>('.auth0-universal');
    expect(scope?.style.getPropertyValue('--radius-2xl')).toBe('0px');
  });

  describe('when the load failed', () => {
    const withStatus = (status: number) => Object.assign(new Error(`HTTP ${status}`), { status });
    const renderWithError = (
      error: Error | null,
      onRetry = vi.fn().mockResolvedValue(true),
      isLoading = true,
    ) => {
      const view = renderWithProviders(
        <GateKeeperContext.Provider value={{ error, onRetry }}>
          <GateKeeper isLoading={isLoading}>
            <p>content</p>
          </GateKeeper>
        </GateKeeperContext.Provider>,
      );
      return { ...view, onRetry };
    };

    it.each([
      ['a 500', withStatus(500)],
      ['a 429', withStatus(429)],
      ['a cancelled step-up', createMfaStepUpError('cancelled')],
      ['a step-up that could not finish', createMfaStepUpError('unavailable')],
    ])('shows the message in place of the spinner and the content for %s', (_name, error) => {
      const { container } = renderWithError(error, undefined, false);

      expect(screen.getByText('fallback.title')).toBeInTheDocument();
      expect(screen.queryByText('content')).not.toBeInTheDocument();
      expect(screen.getByText('fallback.description')).toBeInTheDocument();
      expect(container.querySelector('.animate-spin')).toBeNull();
    });

    it.each([
      ['a 404', withStatus(404)],
      ['a plain error', new Error('boom')],
      ['no error', null],
    ])('keeps the spinner for %s', (_name, error) => {
      const { container } = renderWithError(error);

      expect(container.querySelector('.animate-spin')).not.toBeNull();
      expect(screen.queryByText('fallback.title')).not.toBeInTheDocument();
    });

    it('fetches again when the user presses Retry', async () => {
      const user = userEvent.setup();
      const { onRetry } = renderWithError(withStatus(503));

      await user.click(screen.getByRole('button', { name: /fallback.retry/ }));

      await waitFor(() => expect(onRetry).toHaveBeenCalledTimes(1));
    });
  });
});
