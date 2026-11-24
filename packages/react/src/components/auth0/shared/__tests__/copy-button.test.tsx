import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CopyButton } from '@/components/auth0/shared/copy-button';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({ t: (key: string) => key }),
}));

describe('CopyButton', () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const click = async () => {
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'copy' }));
    });
  };

  it('copies a string value and calls onCopy', async () => {
    const onCopy = vi.fn();
    render(<CopyButton value="abc" onCopy={onCopy} />);

    await click();

    expect(writeText).toHaveBeenCalledWith('abc');
    expect(onCopy).toHaveBeenCalledOnce();
    expect(screen.getAllByText('copied').length).toBeGreaterThan(0);
  });

  it('evaluates a getter at click time', async () => {
    let current = 'first';
    render(<CopyButton value={() => current} />);

    current = 'second';
    await click();

    expect(writeText).toHaveBeenCalledWith('second');
  });

  it('does nothing for an empty value', async () => {
    const onCopy = vi.fn();
    render(<CopyButton value="" onCopy={onCopy} />);

    await click();

    expect(writeText).not.toHaveBeenCalled();
    expect(onCopy).not.toHaveBeenCalled();
  });

  it('shows the failure message and skips onCopy when copying fails', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));
    const onCopy = vi.fn();
    render(<CopyButton value="abc" onCopy={onCopy} />);

    await click();

    expect(screen.getAllByText('copy_failed').length).toBeGreaterThan(0);
    expect(onCopy).not.toHaveBeenCalled();
  });
});
