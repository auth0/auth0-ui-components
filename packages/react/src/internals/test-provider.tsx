import type { CoreClientInterface, AuthDetails } from '@auth0-web-ui-components/core';
import { render, type RenderResult } from '@testing-library/react';
import React from 'react';

import { CoreClientContext } from '../hooks/use-core-client';
import { ScopeManagerProvider } from '../providers/scope-manager-provider';

import { createMockCoreClient } from './__mocks__/core/core-client.mocks';

export interface TestProviderProps {
  children: React.ReactNode;
  coreClient?: CoreClientInterface;
  authDetails?: Partial<AuthDetails>;
}

/**
 * Test provider that wraps components with the necessary context for testing
 */
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
      <ScopeManagerProvider>{children}</ScopeManagerProvider>
    </CoreClientContext.Provider>
  );
};

/**
 * Utility function to render components with TestProvider
 */
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
