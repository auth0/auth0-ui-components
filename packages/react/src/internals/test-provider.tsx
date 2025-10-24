import type { CoreClientInterface, AuthDetailsCore } from '@auth0-web-ui-components/core';
import { render, type RenderResult } from '@testing-library/react';
import React from 'react';

import { CoreClientContext } from '../hooks/use-core-client';

import { createMockCoreClient } from './__mocks__/core';

export interface TestProviderProps {
  children: React.ReactNode;
  coreClient?: CoreClientInterface;
  authDetails?: Partial<AuthDetailsCore>;
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

  return <CoreClientContext.Provider value={contextValue}>{children}</CoreClientContext.Provider>;
};

/**
 * Utility function to render components with TestProvider
 */
export const renderWithProviders = (
  component: React.ReactElement,
  options?: {
    coreClient?: CoreClientInterface;
    authDetails?: Partial<AuthDetailsCore>;
  },
): RenderResult => {
  return render(
    <TestProvider coreClient={options?.coreClient} authDetails={options?.authDetails}>
      {component}
    </TestProvider>,
  );
};
