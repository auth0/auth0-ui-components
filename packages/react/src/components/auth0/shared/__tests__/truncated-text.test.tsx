import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TruncatedText } from '@/components/auth0/shared/truncated-text';
import { renderWithProviders } from '@/tests/utils/test-provider';

const mockWidths = (scrollWidth: number, clientWidth: number) => {
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(scrollWidth);
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(clientWidth);
};

describe('TruncatedText', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the text', () => {
    renderWithProviders(<TruncatedText text="Acme Corp." />);

    expect(screen.getByText('Acme Corp.')).toBeInTheDocument();
  });

  it('merges a custom class with the truncate class', () => {
    renderWithProviders(<TruncatedText text="Acme Corp." className="font-medium" />);

    expect(screen.getByText('Acme Corp.')).toHaveClass('truncate', 'font-medium');
  });

  describe('when the text is truncated', () => {
    it('shows the full text in a tooltip on hover', async () => {
      const user = userEvent.setup();
      mockWidths(300, 100);
      renderWithProviders(<TruncatedText text="Acme Corp." />);

      await user.hover(screen.getByText('Acme Corp.'));

      expect(await screen.findByRole('tooltip')).toHaveTextContent('Acme Corp.');
    });
  });

  describe('when the text fits', () => {
    it('shows no tooltip', async () => {
      const user = userEvent.setup();
      mockWidths(100, 100);
      renderWithProviders(<TruncatedText text="Acme Corp." />);

      await user.hover(screen.getByText('Acme Corp.'));

      // Wait past the tooltip's hover delay (700ms by default).
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });
});
