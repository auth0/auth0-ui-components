import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Header } from '@/components/auth0/shared/header';

vi.mock('@/providers/portal-context', () => ({
  usePortalContainer: () => undefined,
}));

const renderSwitch = (disabled: boolean, description?: string) =>
  render(
    <Header
      title="Provider"
      actions={[
        {
          type: 'switch',
          checked: false,
          onCheckedChange: vi.fn(),
          disabled,
          'aria-label': 'Enable provider',
          description,
          tooltip: { content: description ?? 'Enable provider' },
        },
      ]}
    />,
  );

describe('Header switch action', () => {
  it('names the switch and describes why it is disabled', () => {
    renderSwitch(true, 'Turn on a verified domain first.');

    const toggle = screen.getByRole('switch', { name: 'Enable provider' });
    expect(toggle).toBeDisabled();
    expect(toggle).toHaveAccessibleDescription('Turn on a verified domain first.');
  });

  it('lets keyboard users reach the tooltip of a disabled switch', async () => {
    const user = userEvent.setup();
    renderSwitch(true, 'Turn on a verified domain first.');

    await user.tab();

    expect(screen.getByRole('switch').parentElement?.parentElement).toHaveFocus();
    expect(screen.getByRole('switch').parentElement?.parentElement).toHaveClass(
      'focus-visible:ring-4',
    );
    expect(await screen.findAllByText('Turn on a verified domain first.')).not.toHaveLength(0);
  });

  it('has no description or extra tab stop when the switch is usable', async () => {
    const user = userEvent.setup();
    renderSwitch(false);

    const toggle = screen.getByRole('switch');
    expect(toggle).not.toHaveAttribute('aria-describedby');
    await user.tab();
    expect(toggle).toHaveFocus();
  });
});

const renderButton = (disabled: boolean, description?: string) =>
  render(
    <Header
      title="Provider"
      actions={[
        {
          type: 'button',
          label: 'Assign Domain',
          onClick: vi.fn(),
          disabled,
          description,
          ...(description ? { tooltip: { content: description } } : {}),
        },
      ]}
    />,
  );

describe('Header button action', () => {
  it('describes why a disabled button is disabled', () => {
    renderButton(true, 'Association is not available.');

    const button = screen.getByRole('button', { name: 'Assign Domain' });
    expect(button).toBeDisabled();
    expect(document.getElementById(button.getAttribute('aria-describedby')!)).toHaveTextContent(
      'Association is not available.',
    );
  });

  it('lets keyboard users reach the tooltip of a disabled button that has a reason', async () => {
    const user = userEvent.setup();
    renderButton(true, 'Association is not available.');

    await user.tab();

    const trigger = screen.getByRole('button', { name: 'Assign Domain' }).parentElement;
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveClass('focus-visible:ring-4');
  });

  it('adds no description or tab stop to a usable button', async () => {
    const user = userEvent.setup();
    renderButton(false);

    const button = screen.getByRole('button', { name: 'Assign Domain' });
    expect(button).not.toHaveAttribute('aria-describedby');
    await user.tab();
    expect(button).toHaveFocus();
  });

  it('keeps a disabled button without a reason out of the tab order', async () => {
    const user = userEvent.setup();
    renderButton(true);

    await user.tab();

    expect(screen.getByRole('button', { name: 'Assign Domain' })).not.toHaveFocus();
  });
});
