import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { ThemeContext } from '@/providers/theme-provider';
import type { ThemeContextValue } from '@/types/theme-types';

const renderWithTheme = (ui: React.ReactElement, themeValue?: Partial<ThemeContextValue>) => {
  const value: ThemeContextValue = {
    isDarkMode: false,
    variables: { common: {}, light: {}, dark: {} },
    loader: null,
    ...themeValue,
  };

  return render(<ThemeContext.Provider value={value}>{ui}</ThemeContext.Provider>);
};

describe('StyledScope', () => {
  it('renders children', () => {
    renderWithTheme(
      <StyledScope>
        <p>hello</p>
      </StyledScope>,
    );

    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('applies auth0-universal class and default theme', () => {
    const { container } = renderWithTheme(
      <StyledScope>
        <p>content</p>
      </StyledScope>,
    );

    const scope = container.firstElementChild as HTMLElement;
    expect(scope.classList.contains('auth0-universal')).toBe(true);
    expect(scope.dataset.theme).toBe('default');
    expect(scope.classList.contains('dark')).toBe(false);
  });

  it('adds dark class when isDarkMode is true', () => {
    const { container } = renderWithTheme(
      <StyledScope>
        <p>dark content</p>
      </StyledScope>,
      { isDarkMode: true },
    );

    const scope = container.firstElementChild as HTMLElement;
    expect(scope.classList.contains('dark')).toBe(true);
  });

  it('sets data-theme from context', () => {
    const { container } = renderWithTheme(
      <StyledScope>
        <p>themed</p>
      </StyledScope>,
      { theme: 'minimal' },
    );

    const scope = container.firstElementChild as HTMLElement;
    expect(scope.dataset.theme).toBe('minimal');
  });

  it('applies provider-level variables as inline styles', () => {
    const { container } = renderWithTheme(
      <StyledScope>
        <p>styled</p>
      </StyledScope>,
      {
        variables: {
          common: { '--radius-2xl': '0px' },
          light: { '--auth0-primary': 'red' },
          dark: {},
        },
      },
    );

    const scope = container.firstElementChild as HTMLElement;
    expect(scope.style.getPropertyValue('--radius-2xl')).toBe('0px');
    expect(scope.style.getPropertyValue('--auth0-primary')).toBe('red');
  });

  it('applies dark-mode variables when isDarkMode is true', () => {
    const { container } = renderWithTheme(
      <StyledScope>
        <p>dark styled</p>
      </StyledScope>,
      {
        isDarkMode: true,
        variables: {
          common: { '--radius-2xl': '4px' },
          light: { '--auth0-primary': 'blue' },
          dark: { '--auth0-primary': 'purple' },
        },
      },
    );

    const scope = container.firstElementChild as HTMLElement;
    expect(scope.style.getPropertyValue('--radius-2xl')).toBe('4px');
    expect(scope.style.getPropertyValue('--auth0-primary')).toBe('purple');
  });

  it('component-level style overrides provider-level variables', () => {
    const { container } = renderWithTheme(
      <StyledScope style={{ '--radius-2xl': '8px' } as React.CSSProperties}>
        <p>overridden</p>
      </StyledScope>,
      {
        variables: {
          common: { '--radius-2xl': '0px' },
          light: {},
          dark: {},
        },
      },
    );

    const scope = container.firstElementChild as HTMLElement;
    expect(scope.style.getPropertyValue('--radius-2xl')).toBe('8px');
  });

  it('merges provider and component styles without dropping either', () => {
    const { container } = renderWithTheme(
      <StyledScope style={{ '--radius-xl': '10px' } as React.CSSProperties}>
        <p>merged</p>
      </StyledScope>,
      {
        variables: {
          common: { '--radius-2xl': '0px' },
          light: { '--auth0-primary': 'green' },
          dark: {},
        },
      },
    );

    const scope = container.firstElementChild as HTMLElement;
    expect(scope.style.getPropertyValue('--radius-2xl')).toBe('0px');
    expect(scope.style.getPropertyValue('--auth0-primary')).toBe('green');
    expect(scope.style.getPropertyValue('--radius-xl')).toBe('10px');
  });

  it('works with no provider variables and no component style', () => {
    const { container } = renderWithTheme(
      <StyledScope>
        <p>plain</p>
      </StyledScope>,
    );

    const scope = container.firstElementChild as HTMLElement;
    expect(scope.style.length).toBe(0);
  });
});
