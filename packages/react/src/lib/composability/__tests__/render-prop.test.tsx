import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mergeRenderProp } from '@/lib/composability/render-prop';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('mergeRenderProp', () => {
  it('clones a valid element and wires the component behavior', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    const merged = mergeRenderProp(<button>Add</button>, {
      type: 'button',
      disabled: false,
      onClick,
    });

    expect(merged).not.toBeNull();
    render(merged as React.ReactElement);

    const button = screen.getByRole('button', { name: 'Add' });
    expect(button).toHaveAttribute('type', 'button');
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('preserves host props (children/className) — host wins for non-behavioral props', () => {
    const merged = mergeRenderProp(<button className="host-cls">Add domain</button>, {
      type: 'button',
      onClick: vi.fn(),
    });

    render(merged as React.ReactElement);
    const button = screen.getByRole('button', { name: 'Add domain' });
    expect(button).toHaveClass('host-cls');
  });

  it('chains onClick: host runs first, component action skipped on preventDefault', async () => {
    const user = userEvent.setup();
    const ownOnClick = vi.fn();
    const hostOnClick = vi.fn((e: React.MouseEvent) => e.preventDefault());

    const merged = mergeRenderProp(<button onClick={hostOnClick}>Add</button>, {
      onClick: ownOnClick,
    });

    render(merged as React.ReactElement);
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(hostOnClick).toHaveBeenCalledTimes(1);
    expect(ownOnClick).not.toHaveBeenCalled();
  });

  it('disables when EITHER the host or the component sets disabled (union, not "component wins")', () => {
    // Component says not-disabled, host says disabled → merged is disabled.
    const merged = mergeRenderProp(<button disabled>Add</button>, {
      disabled: false,
      onClick: vi.fn(),
    });

    render(merged as React.ReactElement);
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('does not fire the component action when the merged element is disabled', async () => {
    const user = userEvent.setup();
    const ownOnClick = vi.fn();

    const merged = mergeRenderProp(<button disabled>Add</button>, {
      disabled: false,
      onClick: ownOnClick,
    });

    render(merged as React.ReactElement);
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(ownOnClick).not.toHaveBeenCalled();
  });

  it('returns null and dev-warns for a Fragment (would silently drop behavior)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const merged = mergeRenderProp(
      (
        <>
          <span>icon</span>Add
        </>
      ) as React.ReactElement,
      { onClick: vi.fn() },
    );

    expect(merged).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('returns null and dev-warns for a non-element (string) instead of throwing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const merged = mergeRenderProp('Add' as unknown as React.ReactElement, {
      onClick: vi.fn(),
    });

    expect(merged).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
