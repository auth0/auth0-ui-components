import React, { useState, useCallback, useEffect, type ReactNode } from 'react';

import { useCoreClient } from '../hooks/use-core-client';
import { ScopeManagerContext, type Audience } from '../hooks/use-scope-manager';

export const ScopeManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { coreClient } = useCoreClient();

  const [scopeRegistry, setScopeRegistry] = useState<Record<Audience, Set<string>>>(() => ({
    me: new Set(),
    'my-org': new Set(),
  }));

  const [ensured, setEnsured] = useState<Record<Audience, string>>({
    me: '',
    'my-org': '',
  });

  const [isReady, setIsReady] = useState(false);

  const registerScopes = useCallback((audience: Audience, scopes: string) => {
    if (!scopes?.trim()) return;

    const newScopes = scopes
      .split(/\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (newScopes.length === 0) return;

    setScopeRegistry((currentRegistry) => {
      const audienceSet = currentRegistry[audience];
      let changed = false;
      const nextAudienceSet = new Set(audienceSet);

      newScopes.forEach((scope) => {
        if (!nextAudienceSet.has(scope)) {
          nextAudienceSet.add(scope);
          changed = true;
        }
      });

      if (changed) {
        return {
          ...currentRegistry,
          [audience]: nextAudienceSet,
        };
      }
      return currentRegistry;
    });
  }, []);

  useEffect(() => {
    if (!coreClient) return;

    const ensureAllScopesSequential = async () => {
      let hasScopes = false;
      let anyUpdated = false;

      for (const audience of ['me', 'my-org'] as const) {
        const scopes = Array.from(scopeRegistry[audience]).sort();
        const scopeString = scopes.join(' ');

        if (scopes.length > 0 && scopeString.trim()) {
          hasScopes = true;

          if (scopeString !== ensured[audience]) {
            try {
              await coreClient.ensureScopes(scopeString, audience);
              anyUpdated = true;
            } catch (error) {
              console.error(`Failed to ensure scopes for ${audience}: ${scopeString}`, error);
            }
          }
        }
      }

      // Update ensured state to match current registry
      if (anyUpdated) {
        setEnsured({
          me: Array.from(scopeRegistry.me).sort().join(' '),
          'my-org': Array.from(scopeRegistry['my-org']).sort().join(' '),
        });
      }

      setIsReady(hasScopes);
    };

    ensureAllScopesSequential();
  }, [coreClient, scopeRegistry, ensured]);

  const contextValue = React.useMemo(
    () => ({ registerScopes, isReady, ensured }),
    [registerScopes, isReady, ensured],
  );

  return (
    <ScopeManagerContext.Provider value={contextValue}>{children}</ScopeManagerContext.Provider>
  );
};
