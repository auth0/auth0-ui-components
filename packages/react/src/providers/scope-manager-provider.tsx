import { isMfaRequiredError } from '@auth0/universal-components-core';
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useMfaErrorHandler } from '@/providers/mfa-error-handler-provider';

export type Audience = 'me' | 'my-org';

interface ScopeManagerContextValue {
  registerScopes: (audience: Audience, scopes: string) => void;
  isReady: boolean;
  ensured: Record<Audience, string>;
}

const ScopeManagerContext = createContext<ScopeManagerContextValue | null>(null);

export const useScopeManager = () => {
  const context = useContext(ScopeManagerContext);
  if (!context) {
    throw new Error('useScopeManager must be used within ScopeManagerProvider');
  }
  return context;
};

const AUDIENCES: readonly Audience[] = ['me', 'my-org'] as const;

export const ScopeManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { coreClient } = useCoreClient();
  const { handleMfaError } = useMfaErrorHandler();

  const [scopeRegistry, setScopeRegistry] = useState<Record<Audience, Set<string>>>(() => ({
    me: new Set(),
    'my-org': new Set(),
  }));

  const [ensured, setEnsured] = useState<Record<Audience, string>>({
    me: '',
    'my-org': '',
  });

  const [isReady, setIsReady] = useState(false);
  const lastEnsuredRef = useRef<Record<Audience, string>>({ me: '', 'my-org': '' });

  const registerScopes = useCallback((audience: Audience, scopes: string) => {
    if (!scopes?.trim()) return;

    const newScopes = scopes
      .split(/\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (newScopes.length === 0) return;

    setScopeRegistry((prev) => {
      const audienceSet = prev[audience];
      const nextSet = new Set(audienceSet);
      let changed = false;

      for (const scope of newScopes) {
        if (!nextSet.has(scope)) {
          nextSet.add(scope);
          changed = true;
        }
      }

      return changed ? { ...prev, [audience]: nextSet } : prev;
    });
  }, []);

  useEffect(() => {
    if (!coreClient) return;

    const ensureScopes = async () => {
      const scopeData = AUDIENCES.map((audience) => {
        const scopes = Array.from(scopeRegistry[audience]).sort();
        const scopeString = scopes.join(' ');
        return { audience, scopeString, hasScopes: scopeString.trim().length > 0 };
      });

      const hasAnyScopes = scopeData.some((data) => data.hasScopes);
      const updates = scopeData.filter(
        (data) => data.hasScopes && data.scopeString !== lastEnsuredRef.current[data.audience],
      );

      if (updates.length === 0) {
        setIsReady(hasAnyScopes);
        return;
      }

      const results = await Promise.allSettled(
        updates.map(({ audience, scopeString }) =>
          coreClient.ensureScopes(scopeString, audience).then(() => ({ audience, scopeString })),
        ),
      );

      const nextEnsured = { ...lastEnsuredRef.current };
      let anyUpdated = false;

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { audience, scopeString } = result.value;
          nextEnsured[audience] = scopeString;
          lastEnsuredRef.current[audience] = scopeString;
          anyUpdated = true;
        } else {
          const error = result.reason;

          if (isMfaRequiredError(error)) {
            // Retry by clearing the last ensured ref for this audience
            const failedAudience = updates.find(
              (u) => u.scopeString === result.reason?.scopeString,
            )?.audience;
            if (failedAudience) {
              handleMfaError(error, () => {
                lastEnsuredRef.current[failedAudience] = '';
              });
            }
          } else {
            console.error('Failed to ensure scopes:', error);
          }
        }
      }

      if (anyUpdated) {
        setEnsured(nextEnsured);
      }
      setIsReady(hasAnyScopes);
    };

    ensureScopes();
  }, [coreClient, scopeRegistry, handleMfaError]);

  const contextValue = React.useMemo(
    () => ({ registerScopes, isReady, ensured }),
    [registerScopes, isReady, ensured],
  );

  return (
    <ScopeManagerContext.Provider value={contextValue}>{children}</ScopeManagerContext.Provider>
  );
};
