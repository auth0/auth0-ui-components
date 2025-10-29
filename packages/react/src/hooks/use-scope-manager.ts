import { createContext, useContext } from 'react';

export type Audience = 'me' | 'my-org';

export interface ScopeManagerContextValue {
  registerScopes: (audience: Audience, scopes: string) => void;
  isReady: boolean;
  ensured: Record<Audience, string>;
}

export const ScopeManagerContext = createContext<ScopeManagerContextValue>({
  registerScopes: () => {},
  isReady: false,
  ensured: { me: '', 'my-org': '' },
});

export const useScopeManager = () => useContext(ScopeManagerContext);
