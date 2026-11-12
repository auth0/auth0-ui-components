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
