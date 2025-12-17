import type { CoreClientInterface, AuthDetails } from '@auth0/universal-components-core';
import { render, type RenderResult } from '@testing-library/react';
import React from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

import { Form } from '../components/ui/form';
import { CoreClientContext } from '../hooks/use-core-client';
import { ScopeManagerContext, type Audience } from '../hooks/use-scope-manager';

import { createMockCoreClient } from './__mocks__/core/core-client.mocks';

export interface TestProviderProps {
  children: React.ReactNode;
  coreClient?: CoreClientInterface;
  authDetails?: Partial<AuthDetails>;
}

/**
 * Mock ScopeRegistryProvider for testing - doesn't call real ensureScopes
 */
function MockScopeRegistryProvider({ children }: { children: React.ReactNode }) {
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

    setEnsuredScopes((prev) => {
      const currentScopes = prev[audience] ? prev[audience].split(' ').filter(Boolean) : [];
      const allScopes = [...new Set([...currentScopes, ...newScopes])].sort().join(' ');
      return { ...prev, [audience]: allScopes };
    });
  }, []);

  const value = React.useMemo(
    () => ({ registerScopes, isReady: true, ensured: ensuredScopes }),
    [registerScopes, ensuredScopes],
  );

  return <ScopeManagerContext.Provider value={value}>{children}</ScopeManagerContext.Provider>;
}

export const TestProvider: React.FC<TestProviderProps> = ({
  children,
  coreClient,
  authDetails,
}) => {
  const mockCoreClient = coreClient || createMockCoreClient(authDetails);

  const contextValue = React.useMemo(
    () => ({
      coreClient: mockCoreClient,
    }),
    [mockCoreClient],
  );

  return (
    <CoreClientContext.Provider value={contextValue}>
      <MockScopeRegistryProvider>{children}</MockScopeRegistryProvider>
    </CoreClientContext.Provider>
  );
};

export const renderWithProviders = (
  component: React.ReactElement,
  options?: {
    coreClient?: CoreClientInterface;
    authDetails?: Partial<AuthDetails>;
  },
): RenderResult => {
  return render(
    <TestProvider coreClient={options?.coreClient} authDetails={options?.authDetails}>
      {component}
    </TestProvider>,
  );
};

export function renderWithFormProvider<T extends FieldValues>(
  component: React.ReactElement,
  form: UseFormReturn<T>,
) {
  return renderWithProviders(<Form {...form}>{component}</Form>);
}
