import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { CopyableText } from '@/components/auth0/shared/copyable-text';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: (key: string) => key,
  }),
}));

describe('CopyableText', () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the value', () => {
    render(<CopyableText value="test-value" />);
    expect(screen.getByText('test-value')).toBeInTheDocument();
  });

  it('renders a copy button with accessible label', () => {
    render(<CopyableText value="test-value" />);
    expect(screen.getByRole('button', { name: 'copy' })).toBeInTheDocument();
  });

  it('calls clipboard.writeText with the value on click', async () => {
    render(<CopyableText value="my-value" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'copy' }));
    });
    expect(writeText).toHaveBeenCalledWith('my-value');
  });

  it('calls onCopy callback after successful copy', async () => {
    const onCopy = vi.fn();
    render(<CopyableText value="x" onCopy={onCopy} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'copy' }));
    });
    expect(onCopy).toHaveBeenCalledOnce();
  });

  it('resets tooltip state after 1 second', async () => {
    render(<CopyableText value="x" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'copy' }));
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(writeText).toHaveBeenCalled();
  });

  it('does not throw when clipboard write fails', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));
    render(<CopyableText value="x" />);
    await expect(
      act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'copy' }));
      }),
    ).resolves.not.toThrow();
  });

  it('does not call onCopy when clipboard write fails', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));
    const onCopy = vi.fn();
    render(<CopyableText value="x" onCopy={onCopy} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'copy' }));
    });
    expect(onCopy).not.toHaveBeenCalled();
  });

  it('clears pending timeout on unmount without errors', async () => {
    const { unmount } = render(<CopyableText value="x" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'copy' }));
    });
    expect(() => unmount()).not.toThrow();
  });
});
