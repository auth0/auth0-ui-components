import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Auth0ComponentProviderProxy } from '../proxy-provider';

vi.mock('../../hooks/use-core-client-initialization', () => ({
  useCoreClientInitialization: vi.fn(() => ({
    isInitialized: true,
    error: undefined,
  })),
}));

vi.mock('../../components/ui/sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

vi.mock('../../components/ui/spinner', () => ({
  Spinner: () => <div data-testid="spinner" />,
}));

vi.mock('../scope-manager-provider', () => ({
  ScopeManagerProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scope-manager-provider">{children}</div>
  ),
}));

vi.mock('../theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

describe('Auth0ComponentProviderProxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children', () => {
    render(
      <Auth0ComponentProviderProxy authDetails={{ authProxyUrl: '/api/auth' }}>
        <div data-testid="child-content">Test Content</div>
      </Auth0ComponentProviderProxy>,
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render ThemeProvider', () => {
    render(
      <Auth0ComponentProviderProxy authDetails={{ authProxyUrl: '/api/auth' }}>
        <div>Test</div>
      </Auth0ComponentProviderProxy>,
    );

    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
  });

  it('should render Toaster', () => {
    render(
      <Auth0ComponentProviderProxy authDetails={{ authProxyUrl: '/api/auth' }}>
        <div>Test</div>
      </Auth0ComponentProviderProxy>,
    );

    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('should render ScopeManagerProvider', () => {
    render(
      <Auth0ComponentProviderProxy authDetails={{ authProxyUrl: '/api/auth' }}>
        <div>Test</div>
      </Auth0ComponentProviderProxy>,
    );

    expect(screen.getByTestId('scope-manager-provider')).toBeInTheDocument();
  });

  it('should apply default theme settings when not provided', () => {
    render(
      <Auth0ComponentProviderProxy authDetails={{ authProxyUrl: '/api/auth' }}>
        <div>Test</div>
      </Auth0ComponentProviderProxy>,
    );

    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
  });

  it('should apply custom theme settings', () => {
    render(
      <Auth0ComponentProviderProxy
        authDetails={{ authProxyUrl: '/api/auth' }}
        themeSettings={{
          mode: 'dark',
          theme: 'rounded',
          variables: {
            common: {},
            light: {},
            dark: {},
          },
        }}
      >
        <div>Test</div>
      </Auth0ComponentProviderProxy>,
    );

    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
  });

  it('should render custom loader when provided', () => {
    render(
      <Auth0ComponentProviderProxy
        authDetails={{ authProxyUrl: '/api/auth' }}
        loader={<div data-testid="custom-loader">Loading...</div>}
      >
        <div>Test</div>
      </Auth0ComponentProviderProxy>,
    );

    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
  });
});
