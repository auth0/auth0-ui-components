import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CopyableTextField } from '@/components/auth0/shared/copyable-text-field';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({ t: (key: string) => key }),
}));

describe('CopyableTextField', () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const clickCopy = async () => {
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'copy' }));
    });
  };

  it('renders the value read-only by default', () => {
    render(<CopyableTextField value="https://acme.test/callback" />);

    const input = screen.getByDisplayValue('https://acme.test/callback');
    expect(input).toHaveAttribute('readonly');
  });

  it('copies the value and calls onCopy', async () => {
    const onCopy = vi.fn();
    render(<CopyableTextField value="secret" onCopy={onCopy} />);

    await clickCopy();

    expect(writeText).toHaveBeenCalledWith('secret');
    expect(onCopy).toHaveBeenCalledOnce();
    expect(screen.getAllByText('copied').length).toBeGreaterThan(0);
  });

  it('does not copy when the value is empty', async () => {
    const onCopy = vi.fn();
    render(<CopyableTextField value="" onCopy={onCopy} />);

    await clickCopy();

    expect(writeText).not.toHaveBeenCalled();
    expect(onCopy).not.toHaveBeenCalled();
  });

  it('shows the failure message instead of throwing when copying fails', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));
    const onCopy = vi.fn();
    render(<CopyableTextField value="secret" onCopy={onCopy} />);

    await clickCopy();

    expect(screen.getAllByText('copy_failed').length).toBeGreaterThan(0);
    expect(onCopy).not.toHaveBeenCalled();
  });

  it('applies copyButtonClassName to the copy button', () => {
    render(<CopyableTextField value="x" copyButtonClassName="custom-copy" />);

    expect(screen.getByRole('button', { name: 'copy' })).toHaveClass('h-8', 'w-8', 'custom-copy');
  });

  it('hides the copy button when showCopyButton is false', () => {
    render(<CopyableTextField value="x" showCopyButton={false} />);

    expect(screen.queryByRole('button', { name: 'copy' })).not.toBeInTheDocument();
  });

  it('renders an endAdornment alongside the copy button', () => {
    render(<CopyableTextField value="x" endAdornment={<span>extra</span>} />);

    expect(screen.getByText('extra')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'copy' })).toBeInTheDocument();
  });

  it('renders only the endAdornment when the copy button is hidden', () => {
    render(
      <CopyableTextField value="x" showCopyButton={false} endAdornment={<span>extra</span>} />,
    );

    expect(screen.getByText('extra')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
