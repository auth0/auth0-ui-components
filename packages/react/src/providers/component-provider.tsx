'use client';

import {
  applyStyleOverrides,
  createCoreClient,
  type BasicAuth0ContextInterface,
  type AuthDetails,
  type StylingVariables,
  type CoreClientInterface,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { Toaster } from '../components/ui/sonner';
import { Spinner } from '../components/ui/spinner';
import { CoreClientContext, useCoreClient } from '../hooks/use-core-client';
import { ScopeManagerContext, type Audience } from '../hooks/use-scope-manager';
import { ThemeContext } from '../hooks/use-theme';
import type { Auth0ComponentProviderProps } from '../types/auth-types';
import type { I18nOptions } from '../types/i18n-types';
import type { ThemeInput } from '../types/theme-types';

const DEFAULT_STYLE_OVERRIDES: StylingVariables = { common: {}, light: {}, dark: {} };

interface Auth0ReactPackage {
  useAuth0: () => BasicAuth0ContextInterface;
}

const ScopeRegistryProvider = ({ children }: { children: React.ReactNode }) => {
  const { coreClient } = useCoreClient();
  const [isReady, setIsReady] = React.useState(false);
  const [scopeRegistry, setScopeRegistry] = React.useState<Record<Audience, Set<string>>>(() => ({
    me: new Set(),
    'my-org': new Set(),
  }));
  const [ensuredScopes, setEnsuredScopes] = React.useState<Record<Audience, string>>({
    me: '',
    'my-org': '',
  });

  const registerScopes = React.useCallback((audience: Audience, scopes: string) => {
    if (!scopes?.trim()) return;
    const newScopes = scopes
      .split(/\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!newScopes.length) return;

    setScopeRegistry((prev) => {
      const nextSet = new Set(prev[audience]);
      let changed = false;
      newScopes.forEach((s) => {
        if (!nextSet.has(s)) {
          nextSet.add(s);
          changed = true;
        }
      });
      return changed ? { ...prev, [audience]: nextSet } : prev;
    });
  }, []);

  React.useEffect(() => {
    if (!coreClient) return;
    const ensureScopes = async () => {
      let anyUpdated = false;
      const nextEnsured = { ...ensuredScopes };
      let hasScopes = false;

      for (const aud of ['me', 'my-org'] as const) {
        const scopes = Array.from(scopeRegistry[aud]).sort();
        const str = scopes.join(' ');
        if (scopes.length > 0 && str.trim()) {
          hasScopes = true;
          if (str !== ensuredScopes[aud]) {
            try {
              await coreClient.ensureScopes(str, aud);
              nextEnsured[aud] = str;
              anyUpdated = true;
            } catch (e) {
              console.error(`Failed to ensure scopes for ${aud}`, e);
            }
          }
        }
      }
      if (anyUpdated) setEnsuredScopes(nextEnsured);
      setIsReady(hasScopes);
    };
    ensureScopes();
  }, [coreClient, scopeRegistry, ensuredScopes]);

  const value = React.useMemo(
    () => ({ registerScopes, isReady, ensured: ensuredScopes }),
    [registerScopes, isReady, ensuredScopes],
  );

  return <ScopeManagerContext.Provider value={value}>{children}</ScopeManagerContext.Provider>;
};

const CoreServicesProvider = ({
  authDetails,
  i18n,
  loader,
  children,
}: {
  authDetails: AuthDetails;
  children: React.ReactNode;
  i18n?: I18nOptions;
  loader?: React.ReactNode;
}) => {
  const [coreClient, setCoreClient] = React.useState<CoreClientInterface | null>(null);

  React.useEffect(() => {
    createCoreClient(authDetails, i18n)
      .then(setCoreClient)
      .catch((e) => console.error('Core Client Init Failed:', e));
  }, [authDetails.domain, authDetails.authProxyUrl, i18n]);

  const contextValue = React.useMemo(() => ({ coreClient }), [coreClient]);
  const LoadingComponent = loader || (
    <div className="flex items-center justify-center min-h-[200px]">
      <Spinner />
    </div>
  );

  return (
    <>
      <Toaster position="top-right" />
      <React.Suspense fallback={LoadingComponent}>
        <CoreClientContext.Provider value={contextValue}>
          <ScopeRegistryProvider>{children}</ScopeRegistryProvider>
        </CoreClientContext.Provider>
      </React.Suspense>
    </>
  );
};

const ThemeProvider = ({
  themeSettings,
  loader,
  children,
}: {
  themeSettings?: ThemeInput;
  loader?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const { variables, mode, theme } = React.useMemo(
    () => ({
      variables: themeSettings?.variables ?? DEFAULT_STYLE_OVERRIDES,
      mode: themeSettings?.mode ?? 'light',
      theme: themeSettings?.theme ?? 'default',
    }),
    [themeSettings],
  );

  React.useEffect(() => {
    applyStyleOverrides(variables, mode, theme);
  }, [variables, mode, theme]);

  const value = React.useMemo(
    () => ({ isDarkMode: mode === 'dark', variables, loader }),
    [mode, variables, loader],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

const WithAuth0Hook = ({
  module,
  authDetails,
  i18n,
  loader,
  children,
}: {
  module: Auth0ReactPackage;
  authDetails: AuthDetails;
  children: React.ReactNode;
  i18n?: I18nOptions;
  loader?: React.ReactNode;
}) => {
  const context = module.useAuth0();
  const adaptedDetails = React.useMemo(
    () => ({ ...authDetails, contextInterface: context }),
    [authDetails, context],
  );
  return (
    <CoreServicesProvider authDetails={adaptedDetails} i18n={i18n} loader={loader}>
      {children}
    </CoreServicesProvider>
  );
};

const Auth0Orchestrator = ({
  authDetails,
  i18n,
  loader,
  children,
}: {
  authDetails: AuthDetails;
  children: React.ReactNode;
  i18n?: I18nOptions;
  loader?: React.ReactNode;
}) => {
  const isProxy = !!(authDetails.authProxyUrl || authDetails.contextInterface);
  const [auth0Module, setAuth0Module] = React.useState<Auth0ReactPackage | null>(null);
  const [isLoading, setIsLoading] = React.useState(!isProxy);

  React.useEffect(() => {
    if (isProxy) {
      return;
    }

    import('@auth0/auth0-react')
      .then((mod) => setAuth0Module(mod as Auth0ReactPackage))
      .catch((e) => console.error('Failed to load @auth0/auth0-react:', e))
      .finally(() => setIsLoading(false));
  }, [isProxy]);

  if (isLoading) {
    return (
      loader || (
        <div className="flex items-center justify-center min-h-[200px]">
          <Spinner />
        </div>
      )
    );
  }

  if (auth0Module) {
    return (
      <WithAuth0Hook module={auth0Module} authDetails={authDetails} i18n={i18n} loader={loader}>
        {children}
      </WithAuth0Hook>
    );
  }

  return (
    <CoreServicesProvider authDetails={authDetails} i18n={i18n} loader={loader}>
      {children}
    </CoreServicesProvider>
  );
};

export const Auth0ComponentProvider = ({
  authDetails,
  themeSettings,
  i18n,
  loader,
  children,
}: Auth0ComponentProviderProps & { children: React.ReactNode }) => {
  return (
    <ThemeProvider themeSettings={themeSettings} loader={loader}>
      <Auth0Orchestrator authDetails={authDetails} i18n={i18n} loader={loader}>
        {children}
      </Auth0Orchestrator>
    </ThemeProvider>
  );
};

export default Auth0ComponentProvider;
