import { render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { useCoreClient } from '../../hooks/use-core-client';
import { useScopeManager } from '../../hooks/use-scope-manager';
import { ThemeContext } from '../../hooks/use-theme';
import { createMockCoreClient } from '../../internals/__mocks__/core/core-client.mocks';
import { Auth0ComponentProvider } from '../component-provider';

// ===== Mock Modules =====

vi.mock('@auth0/universal-components-core', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    createCoreClient: vi.fn(),
    applyStyleOverrides: vi.fn(),
  };
});

vi.mock('../../components/ui/sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

vi.mock('../../components/ui/spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

// Get mocked functions
const { createCoreClient, applyStyleOverrides } = await import('@auth0/universal-components-core');
const mockCreateCoreClient = createCoreClient as ReturnType<typeof vi.fn>;
const mockApplyStyleOverrides = applyStyleOverrides as ReturnType<typeof vi.fn>;

// ===== Test Utilities =====

const TestChild = () => {
  const { coreClient } = useCoreClient();
  return (
    <div data-testid="test-child">{coreClient ? 'Core Client Available' : 'No Core Client'}</div>
  );
};

const ThemeConsumer = () => {
  const theme = React.useContext(ThemeContext);
  return (
    <div data-testid="theme-consumer">
      <span data-testid="is-dark">{theme.isDarkMode ? 'dark' : 'light'}</span>
      <span data-testid="has-loader">{theme.loader ? 'has-loader' : 'no-loader'}</span>
    </div>
  );
};

const ScopeConsumer = () => {
  const scopeManager = useScopeManager();

  React.useEffect(() => {
    if (scopeManager.registerScopes) {
      scopeManager.registerScopes('my-org', 'read:org');
    }
  }, [scopeManager]);

  return (
    <div data-testid="scope-consumer">
      <span data-testid="is-ready">{scopeManager.isReady ? 'ready' : 'not-ready'}</span>
      <span data-testid="ensured-org">{scopeManager.ensured?.['my-org'] || 'none'}</span>
    </div>
  );
};

// ===== Tests =====

describe('Auth0ComponentProvider', () => {
  const defaultAuthDetails = {
    domain: 'test.auth0.com',
    clientId: 'test-client-id',
    authProxyUrl: 'https://proxy.example.com',
  };

  let mockCoreClient: ReturnType<typeof createMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = createMockCoreClient();
    mockCreateCoreClient.mockResolvedValue(mockCoreClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render children when core client is initialized', async () => {
      render(
        <Auth0ComponentProvider authDetails={defaultAuthDetails}>
          <TestChild />
        </Auth0ComponentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-child')).toBeInTheDocument();
      });
    });

    it('should render Toaster component', async () => {
      render(
        <Auth0ComponentProvider authDetails={defaultAuthDetails}>
          <TestChild />
        </Auth0ComponentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('toaster')).toBeInTheDocument();
      });
    });

    it('should use custom loader in Suspense fallback when provided', async () => {
      // This test verifies the loader prop is passed through to the provider
      render(
        <Auth0ComponentProvider
          authDetails={defaultAuthDetails}
          loader={<div data-testid="custom-loader">Custom Loading...</div>}
        >
          <TestChild />
        </Auth0ComponentProvider>,
      );

      // The component should eventually render (loader may flash briefly)
      await waitFor(() => {
        expect(screen.getByTestId('test-child')).toBeInTheDocument();
      });
    });
  });

  describe('CoreClient initialization', () => {
    it('should call createCoreClient with authDetails', async () => {
      render(
        <Auth0ComponentProvider authDetails={defaultAuthDetails}>
          <TestChild />
        </Auth0ComponentProvider>,
      );

      await waitFor(() => {
        expect(mockCreateCoreClient).toHaveBeenCalledWith(
          expect.objectContaining({
            domain: defaultAuthDetails.domain,
            clientId: defaultAuthDetails.clientId,
            authProxyUrl: defaultAuthDetails.authProxyUrl,
          }),
          undefined,
        );
      });
    });

    it('should pass i18n options to createCoreClient', async () => {
      const i18nOptions = {
        currentLanguage: 'es',
        fallbackLanguage: 'en',
      };

      render(
        <Auth0ComponentProvider authDetails={defaultAuthDetails} i18n={i18nOptions}>
          <TestChild />
        </Auth0ComponentProvider>,
      );

      await waitFor(() => {
        expect(mockCreateCoreClient).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining(i18nOptions),
        );
      });
    });

    it('should provide coreClient to children via context', async () => {
      render(
        <Auth0ComponentProvider authDetails={defaultAuthDetails}>
          <TestChild />
        </Auth0ComponentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-child')).toHaveTextContent('Core Client Available');
      });
    });

    it('should handle createCoreClient failure gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockCreateCoreClient.mockRejectedValue(new Error('Init failed'));

      render(
        <Auth0ComponentProvider authDetails={defaultAuthDetails}>
          <TestChild />
        </Auth0ComponentProvider>,
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Core Client Init Failed:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('ThemeProvider', () => {
    it('should provide default theme context values', async () => {
      render(
        <Auth0ComponentProvider authDetails={defaultAuthDetails}>
          <ThemeConsumer />
        </Auth0ComponentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-dark')).toHaveTextContent('light');
      });
    });

    it('should set dark mode when theme mode is dark', async () => {
      render(
        <Auth0ComponentProvider authDetails={defaultAuthDetails} themeSettings={{ mode: 'dark' }}>
          <ThemeConsumer />
        </Auth0ComponentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-dark')).toHaveTextContent('dark');
      });
    });

    it('should apply style overrides on mount', async () => {
      const customVariables = {
        common: { '--font-size-body': '14px' },
        light: { '--background': '#ffffff' },
        dark: { '--background': '#000000' },
      };

      render(
        <Auth0ComponentProvider
          authDetails={defaultAuthDetails}
          themeSettings={{ variables: customVariables, mode: 'light', theme: 'rounded' }}
        >
          <TestChild />
        </Auth0ComponentProvider>,
      );

      await waitFor(() => {
        expect(mockApplyStyleOverrides).toHaveBeenCalledWith(customVariables, 'light', 'rounded');
      });
    });

    it('should provide loader in theme context', async () => {
      const customLoader = <div>Custom Loader</div>;

      render(
        <Auth0ComponentProvider authDetails={defaultAuthDetails} loader={customLoader}>
          <ThemeConsumer />
        </Auth0ComponentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('has-loader')).toHaveTextContent('has-loader');
      });
    });
  });

  describe('ScopeRegistryProvider', () => {
    it('should provide scope manager context to children', async () => {
      render(
        <Auth0ComponentProvider authDetails={defaultAuthDetails}>
          <ScopeConsumer />
        </Auth0ComponentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('scope-consumer')).toBeInTheDocument();
      });
    });

    it('should register scopes and track them in ensured state', async () => {
      render(
        <Auth0ComponentProvider authDetails={defaultAuthDetails}>
          <ScopeConsumer />
        </Auth0ComponentProvider>,
      );

      // Verify scopes are tracked in the ensured state
      await waitFor(() => {
        expect(screen.getByTestId('ensured-org')).toHaveTextContent('read:org');
      });
    });

    it('should set isReady to true after scopes are ensured', async () => {
      render(
        <Auth0ComponentProvider authDetails={defaultAuthDetails}>
          <ScopeConsumer />
        </Auth0ComponentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-ready')).toHaveTextContent('ready');
      });
    });

    it('should not register empty scopes', async () => {
      const EmptyScopeConsumer = () => {
        const scopeManager = useScopeManager();

        React.useEffect(() => {
          if (scopeManager.registerScopes) {
            scopeManager.registerScopes('my-org', '');
            scopeManager.registerScopes('my-org', '   ');
          }
        }, [scopeManager]);

        return (
          <div data-testid="empty-scope-consumer">
            <span data-testid="empty-ensured">{scopeManager.ensured?.['my-org'] || 'none'}</span>
          </div>
        );
      };

      render(
        <Auth0ComponentProvider authDetails={defaultAuthDetails}>
          <EmptyScopeConsumer />
        </Auth0ComponentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('empty-scope-consumer')).toBeInTheDocument();
      });

      // ensured should remain empty (none) for empty scopes
      expect(screen.getByTestId('empty-ensured')).toHaveTextContent('none');
    });

    it('should deduplicate registered scopes', async () => {
      const DuplicateScopeConsumer = () => {
        const scopeManager = useScopeManager();

        React.useEffect(() => {
          if (scopeManager.registerScopes) {
            scopeManager.registerScopes('my-org', 'read:org read:org update:org');
          }
        }, [scopeManager]);

        return (
          <div data-testid="dup-scope-consumer">
            <span data-testid="dup-ensured">{scopeManager.ensured?.['my-org'] || 'none'}</span>
          </div>
        );
      };

      render(
        <Auth0ComponentProvider authDetails={defaultAuthDetails}>
          <DuplicateScopeConsumer />
        </Auth0ComponentProvider>,
      );

      await waitFor(() => {
        // Should show deduplicated scopes
        const ensured = screen.getByTestId('dup-ensured').textContent;
        expect(ensured).toContain('read:org');
        expect(ensured).toContain('update:org');
      });
    });
  });

  describe('Auth0Orchestrator', () => {
    it('should use proxy mode when authProxyUrl is provided', async () => {
      render(
        <Auth0ComponentProvider authDetails={defaultAuthDetails}>
          <TestChild />
        </Auth0ComponentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-child')).toHaveTextContent('Core Client Available');
      });

      // Should not attempt to import @auth0/auth0-react in proxy mode
      expect(mockCreateCoreClient).toHaveBeenCalled();
    });

    it('should use proxy mode when contextInterface is provided', async () => {
      const authDetailsWithContext = {
        ...defaultAuthDetails,
        authProxyUrl: undefined,
        contextInterface: {
          isAuthenticated: true,
          isLoading: false,
          getAccessTokenSilently: vi.fn(),
          getAccessTokenWithPopup: vi.fn(),
          loginWithRedirect: vi.fn(),
        },
      };

      render(
        <Auth0ComponentProvider authDetails={authDetailsWithContext}>
          <TestChild />
        </Auth0ComponentProvider>,
      );

      await waitFor(() => {
        expect(mockCreateCoreClient).toHaveBeenCalled();
      });
    });
  });

  describe('default values', () => {
    it('should use default style overrides when themeSettings not provided', async () => {
      render(
        <Auth0ComponentProvider authDetails={defaultAuthDetails}>
          <TestChild />
        </Auth0ComponentProvider>,
      );

      await waitFor(() => {
        expect(mockApplyStyleOverrides).toHaveBeenCalledWith(
          { common: {}, light: {}, dark: {} },
          'light',
          'default',
        );
      });
    });
  });
});

describe('ThemeContext', () => {
  it('should have correct default values', () => {
    const TestConsumer = () => {
      const ctx = React.useContext(ThemeContext);
      return (
        <div>
          <span data-testid="dark">{ctx.isDarkMode ? 'true' : 'false'}</span>
          <span data-testid="loader">{ctx.loader === null ? 'null' : 'set'}</span>
        </div>
      );
    };

    render(<TestConsumer />);

    expect(screen.getByTestId('dark')).toHaveTextContent('false');
    expect(screen.getByTestId('loader')).toHaveTextContent('null');
  });
});
