import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ThemeProvider } from '../theme-provider';

import { useTheme } from '@/hooks/shared/use-theme';

describe('ThemeProvider', () => {
  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Hello</div>
      </ThemeProvider>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('provides default theme to children', () => {
    const TestComponent = () => {
      const { theme } = useTheme();
      return <div data-testid="theme">{theme ?? 'no-theme'}</div>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme')).toBeInTheDocument();
  });
});
