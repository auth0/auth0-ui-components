import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Header, type ActionProps } from '@/components/auth0/shared/header';

describe('Header — accessibility', () => {
  describe('A1 — landmark', () => {
    it('does not expose a banner landmark (reserved for the app shell)', () => {
      render(<Header title="SSO Providers" />);
      expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    });
  });

  describe('A2 — heading level', () => {
    it('renders the title as <h2> by default (never <h1>)', () => {
      render(<Header title="SSO Providers" />);
      expect(screen.getByRole('heading', { level: 2, name: 'SSO Providers' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    });

    it('honors an explicit headingLevel', () => {
      render(<Header title="SSO Providers" headingLevel={3} />);
      expect(screen.getByRole('heading', { level: 3, name: 'SSO Providers' })).toBeInTheDocument();
    });
  });

  describe('A3 — loading keeps the action mounted', () => {
    const switchAction: ActionProps = {
      type: 'switch',
      checked: true,
      onCheckedChange: vi.fn(),
      'aria-label': 'Enable provider',
    };

    it('keeps a switch action mounted, disabled, and aria-busy while loading', () => {
      render(<Header title="SSO Provider" actions={[switchAction]} isLoading />);

      const toggle = screen.getByRole('switch', { name: 'Enable provider' });
      expect(toggle).toBeInTheDocument();
      expect(toggle).toBeDisabled();
      expect(toggle).toHaveAttribute('aria-busy', 'true');
    });

    it('keeps a button action mounted, disabled, and aria-busy while loading', () => {
      const buttonAction: ActionProps = {
        type: 'button',
        label: 'Create',
        onClick: vi.fn(),
      };
      render(<Header title="SSO Providers" actions={[buttonAction]} isLoading />);

      const button = screen.getByRole('button', { name: 'Create' });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('renders a non-busy switch normally when not loading', () => {
      render(<Header title="SSO Provider" actions={[switchAction]} />);
      const toggle = screen.getByRole('switch', { name: 'Enable provider' });
      expect(toggle).toBeEnabled();
      expect(toggle).not.toHaveAttribute('aria-busy');
    });
  });
});
