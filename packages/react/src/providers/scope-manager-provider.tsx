import React, { useRef, useState, useCallback, useEffect, type ReactNode } from 'react';

import { useCoreClient } from '../hooks/use-core-client';
import { ScopeManagerContext, type Audience } from '../hooks/use-scope-manager';

export const ScopeManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { coreClient } = useCoreClient();

  const scopeRegistry = useRef<Record<Audience, Set<string>>>({
    me: new Set(),
    'my-org': new Set(),
  });

  const [ensured, setEnsured] = useState<Record<Audience, string>>({
    me: '',
    'my-org': '',
  });

  const [isReady, setIsReady] = useState(false);
  const [version, setVersion] = useState(0);

  const registerScopes = useCallback((audience: Audience, scopes: string) => {
    if (!scopes?.trim()) return;

    const newScopes = scopes
      .split(/\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (newScopes.length === 0) return;

    const audienceSet = scopeRegistry.current[audience];
    let changed = false;

    newScopes.forEach((scope) => {
      if (!audienceSet.has(scope)) {
        audienceSet.add(scope);
        changed = true;
      }
    });

    if (changed) {
      setIsReady(false);
      setVersion((v) => v + 1);
    }
  }, []);

  useEffect(() => {
    if (!coreClient) return;

    const ensureAllScopesSequential = async () => {
      const nextEnsured: Record<Audience, string> = { ...ensured };
      let hasScopes = false;
      let updated = false;

      for (const audience of ['me', 'my-org'] as const) {
        const scopes = Array.from(scopeRegistry.current[audience]).sort();
        const scopeString = scopes.join(' ');

        if (scopes.length > 0 && scopeString.trim()) {
          hasScopes = true;

          if (scopeString !== ensured[audience]) {
            await coreClient.ensureScopes(scopeString, audience);
            nextEnsured[audience] = scopeString;
            updated = true;
          }
        }
      }

      if (updated && JSON.stringify(nextEnsured) !== JSON.stringify(ensured)) {
        setEnsured(nextEnsured);
      }

      setIsReady(hasScopes);
    };

    ensureAllScopesSequential();
  }, [coreClient, version, ensured]);

  return (
    <ScopeManagerContext.Provider value={{ registerScopes, isReady, ensured }}>
      {children}
    </ScopeManagerContext.Provider>
  );
};
