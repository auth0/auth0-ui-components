import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';

// Mock Auth0 context for documentation demos
interface MockAuth0ContextType {
  user?: { sub: string; name?: string; email?: string; picture?: string };
  isAuthenticated: boolean;
  isLoading: boolean;
  getAccessTokenSilently: () => Promise<string>;
  loginWithRedirect: () => Promise<void>;
  logout: (options?: { logoutParams?: { returnTo?: string } }) => void;
}

const MockAuth0Context = createContext<MockAuth0ContextType>({
  user: {
    sub: 'demo-user',
    name: 'Demo User',
    email: 'demo@example.com',
    picture: 'https://via.placeholder.com/40',
  },
  isAuthenticated: false,
  isLoading: false,
  getAccessTokenSilently: () => Promise.resolve('mock-access-token'),
  loginWithRedirect: () => Promise.resolve(),
  logout: () => {},
});

interface MockAuth0ProviderProps {
  children: ReactNode;
  authenticated?: boolean;
}

export function MockAuth0Provider({ children, authenticated = false }: MockAuth0ProviderProps) {
  const mockContextValue: MockAuth0ContextType = {
    user: authenticated
      ? {
          sub: 'demo-user',
          name: 'Demo User',
          email: 'demo@example.com',
          picture: 'https://via.placeholder.com/40',
        }
      : undefined,
    isAuthenticated: authenticated,
    isLoading: false,
    getAccessTokenSilently: () => Promise.resolve('mock-access-token'),
    loginWithRedirect: () => Promise.resolve(),
    logout: () => {},
  };

  return <MockAuth0Context.Provider value={mockContextValue}>{children}</MockAuth0Context.Provider>;
}

// Export useAuth0 hook for mock context
export function useAuth0() {
  return useContext(MockAuth0Context);
}
