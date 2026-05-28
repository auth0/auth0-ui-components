/**
 * SPA provider using @auth0/auth0-react.
 * @module spa-provider
 */

'use client';

import { useAuth0 } from '@auth0/auth0-react';
import type {
  AuthDetails,
  BasicAuth0ContextInterface,
  CssImplementation,
  TelemetryComponentGetter,
  TelemetryConfig,
} from '@auth0/universal-components-core';
import type { DistributionChannel } from '@auth0/universal-components-core';
import * as React from 'react';

import { Toaster } from '@/components/auth0/shared/sonner';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Spinner } from '@/components/ui/spinner';
import { CoreClientContext } from '@/hooks/shared/use-core-client';
import { useCoreClientInitialization } from '@/hooks/shared/use-core-client-initialization';
import { useToastProvider } from '@/hooks/shared/use-toast-provider';
import { detectCssImplementation } from '@/lib/utils/css-detection';
import { QueryProvider } from '@/providers/query-provider';
import { TelemetryProvider } from '@/providers/telemetry-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import type { Auth0ComponentProviderProps } from '@/types/auth-types';

/**
 * Build-time constant for distribution channel.
 * - npm build: tsup replaces __DISTRIBUTION__ with 'npm'
 * - shadcn copy: __DISTRIBUTION__ undefined, falls back to 'shadcn'
 */
declare const __DISTRIBUTION__: DistributionChannel;
const DISTRIBUTION: DistributionChannel =
  typeof __DISTRIBUTION__ !== 'undefined' ? __DISTRIBUTION__ : 'shadcn';
const FRAMEWORK = 'react' as const;

/**
 * Auth0 provider for SPAs. Wraps components with required contexts.
 * @param props - Provider configuration including domain, mode, authContext, i18n, themeSettings, toastSettings, cacheConfig, loader, and children.
 * @returns Provider component tree
 */
export const Auth0ComponentProvider = (
  props: Extract<Auth0ComponentProviderProps, { mode?: 'direct' }> & { children: React.ReactNode },
) => {
  const {
    i18n,
    previewMode,
    themeSettings = {
      theme: 'default',
      mode: 'light',
      variables: {
        common: {},
        light: {},
        dark: {},
      },
    },
    toastSettings,
    cacheConfig,
    loader,
    children,
    authContext,
  } = props;
  const mergedToastSettings = useToastProvider(toastSettings);

  // CSS detection for telemetry
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [css, setCss] = React.useState<CssImplementation>('unknown');

  // Component name ref - updated by useTelemetryTracker in block components
  const componentRef = React.useRef<string>('unknown');

  // Stable callback for core package to call
  const getComponent = React.useCallback<TelemetryComponentGetter>(() => componentRef.current, []);

  React.useLayoutEffect(() => {
    if (containerRef.current) {
      setCss(detectCssImplementation(containerRef.current));
    }
  }, []);

  const auth0ReactContext = useAuth0();

  const resolvedAuthContext = React.useMemo(() => {
    if (authContext) {
      return authContext;
    }
    if (auth0ReactContext && 'isAuthenticated' in auth0ReactContext) {
      return auth0ReactContext as BasicAuth0ContextInterface;
    }

    throw new Error(
      'Auth0ContextInterface is not available. Make sure you wrap your app with Auth0Provider from @auth0/auth0-react, or pass authContext.',
    );
  }, [auth0ReactContext, authContext]);

  const memoizedAuthDetails = React.useMemo<AuthDetails>(
    () => ({
      contextInterface: resolvedAuthContext,
      previewMode,
    }),
    [resolvedAuthContext, previewMode],
  );

  const telemetry = React.useMemo<TelemetryConfig>(
    () => ({
      css,
      distribution: DISTRIBUTION,
      framework: FRAMEWORK,
    }),
    [css],
  );

  const coreClient = useCoreClientInitialization({
    authDetails: memoizedAuthDetails,
    i18nOptions: i18n,
    telemetry,
    getComponent,
  });

  const coreClientValue = React.useMemo(
    () => ({
      coreClient,
    }),
    [coreClient],
  );

  const fallback = loader || (
    <StyledScope>
      <div className="flex items-center justify-center min-h-[200px]">
        <Spinner />
      </div>
    </StyledScope>
  );

  return (
    <div ref={containerRef}>
      <TelemetryProvider componentRef={componentRef}>
        <ThemeProvider
          themeSettings={{
            mode: themeSettings.mode,
            variables: themeSettings.variables,
            loader,
            theme: themeSettings.theme,
          }}
        >
          {mergedToastSettings.provider === 'sonner' && (
            <Toaster
              position={mergedToastSettings.settings?.position || 'top-right'}
              closeButton={mergedToastSettings.settings?.closeButton ?? true}
              className="auth0-universal"
            />
          )}
          {coreClient ? (
            <CoreClientContext.Provider value={coreClientValue}>
              <QueryProvider cacheConfig={cacheConfig}>{children}</QueryProvider>
            </CoreClientContext.Provider>
          ) : (
            fallback
          )}
        </ThemeProvider>
      </TelemetryProvider>
    </div>
  );
};

export default Auth0ComponentProvider;
