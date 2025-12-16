import { useAuth0 } from '@auth0/auth0-react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useCoreClientInitialization } from '../../hooks/use-core-client-initialization';
import { Auth0ComponentProviderSpa } from '../spa-provider';

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
}));

vi.mock('../../hooks/use-core-client-initialization', () => ({
  useCoreClientInitialization: vi.fn(),
}));

const mockUseAuth0 = vi.mocked(useAuth0);
const mockUseCoreClientInitialization = vi.mocked(useCoreClientInitialization);

describe('Auth0ComponentProviderSpa (SPA)', () => {
  const mockAuth0Context = {
    isAuthenticated: true,
    isLoading: false,
    user: { sub: 'user123' },
    getAccessTokenSilently: vi.fn(),
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
  };

  const mockCoreClient = {
    getMyAccountApiClient: vi.fn(),
    getMyOrgApiClient: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth0.mockReturnValue(mockAuth0Context as unknown as ReturnType<typeof useAuth0>);
    mockUseCoreClientInitialization.mockReturnValue(mockCoreClient as never);
  });

  it('should render children when initialized', () => {
    render(
      <Auth0ComponentProviderSpa authDetails={{}}>
        <div data-testid="child-content">Test Content</div>
      </Auth0ComponentProviderSpa>,
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should use auth0 context from useAuth0 hook', () => {
    render(
      <Auth0ComponentProviderSpa authDetails={{}}>
        <div data-testid="child-content">Test Content</div>
      </Auth0ComponentProviderSpa>,
    );

    expect(mockUseAuth0).toHaveBeenCalled();
    expect(mockUseCoreClientInitialization).toHaveBeenCalledWith(
      expect.objectContaining({
        authDetails: expect.objectContaining({
          contextInterface: mockAuth0Context,
        }),
      }),
    );
  });

  it('should use contextInterface from authDetails when provided', () => {
    const customContextInterface = {
      isAuthenticated: true,
      isLoading: false,
      user: { sub: 'custom-user' },
      getAccessTokenSilently: vi.fn(),
    };

    mockUseAuth0.mockReturnValue({} as ReturnType<typeof useAuth0>);

    render(
      <Auth0ComponentProviderSpa
        authDetails={{ contextInterface: customContextInterface as never }}
      >
        <div data-testid="child-content">Test Content</div>
      </Auth0ComponentProviderSpa>,
    );

    expect(mockUseCoreClientInitialization).toHaveBeenCalledWith(
      expect.objectContaining({
        authDetails: expect.objectContaining({
          contextInterface: customContextInterface,
        }),
      }),
    );
  });

  it('should throw error when no auth0 context is available', () => {
    mockUseAuth0.mockReturnValue({} as ReturnType<typeof useAuth0>);

    expect(() => {
      render(
        <Auth0ComponentProviderSpa authDetails={{}}>
          <div>Test</div>
        </Auth0ComponentProviderSpa>,
      );
    }).toThrow(
      'Auth0ContextInterface is not available. Make sure you wrap your app with Auth0Provider from @auth0/auth0-react, or pass a contextInterface via authDetails.',
    );
  });

  it('should apply default theme settings', () => {
    render(
      <Auth0ComponentProviderSpa authDetails={{}}>
        <div data-testid="child-content">Test Content</div>
      </Auth0ComponentProviderSpa>,
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should apply custom theme settings', () => {
    render(
      <Auth0ComponentProviderSpa
        authDetails={{}}
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
        <div data-testid="child-content">Test Content</div>
      </Auth0ComponentProviderSpa>,
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should render custom loader in suspense fallback', () => {
    render(
      <Auth0ComponentProviderSpa
        authDetails={{}}
        loader={<div data-testid="custom-loader">Loading...</div>}
      >
        <div data-testid="child-content">Test Content</div>
      </Auth0ComponentProviderSpa>,
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should pass i18n options to useCoreClientInitialization', () => {
    const i18nOptions = { currentLanguage: 'es' };

    render(
      <Auth0ComponentProviderSpa authDetails={{}} i18n={i18nOptions}>
        <div data-testid="child-content">Test Content</div>
      </Auth0ComponentProviderSpa>,
    );

    expect(mockUseCoreClientInitialization).toHaveBeenCalledWith(
      expect.objectContaining({
        i18nOptions,
      }),
    );
  });

  it('should provide coreClient through context', () => {
    render(
      <Auth0ComponentProviderSpa authDetails={{}}>
        <div data-testid="child-content">Test Content</div>
      </Auth0ComponentProviderSpa>,
    );

    expect(mockUseCoreClientInitialization).toHaveBeenCalled();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });
});
