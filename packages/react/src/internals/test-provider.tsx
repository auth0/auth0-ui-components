import type { CoreClientInterface, AuthDetails } from '@auth0/universal-components-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import React from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

import { Form } from '../components/ui/form';
import { CoreClientContext } from '../hooks/use-core-client';
import { ScopeManagerProvider } from '../providers/scope-manager-provider';

import { createMockCoreClient } from './__mocks__/core/core-client.mocks';

// Create a new QueryClient for each test to avoid shared state
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry in tests
        gcTime: 0, // Disable garbage collection time in tests
        staleTime: 0, // Always consider data stale in tests
      },
      mutations: {
        retry: false,
      },
    },
  });

export const createTestQueryClientWrapper = (queryClient?: QueryClient) => {
  const client = queryClient || createTestQueryClient();
  const wrapper = ({ children }: React.PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return { queryClient: client, wrapper };
};

export interface TestProviderProps {
  children: React.ReactNode;
  coreClient?: CoreClientInterface;
  authDetails?: Partial<AuthDetails>;
  queryClient?: QueryClient;
}

/**
 * Test provider that wraps components with the necessary context for testing
 */
export const TestProvider: React.FC<TestProviderProps> = ({
  children,
  coreClient,
  authDetails,
  queryClient,
}) => {
  const mockCoreClient = coreClient || createMockCoreClient(authDetails);
  const testQueryClient = React.useMemo(
    () => queryClient || createTestQueryClient(),
    [queryClient],
  );

  const contextValue = React.useMemo(
    () => ({
      coreClient: mockCoreClient,
    }),
    [mockCoreClient],
  );

  return (
    <QueryClientProvider client={testQueryClient}>
      <CoreClientContext.Provider value={contextValue}>
        <ScopeManagerProvider>{children}</ScopeManagerProvider>
      </CoreClientContext.Provider>
    </QueryClientProvider>
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
    queryClient?: QueryClient;
  },
): RenderResult => {
  return render(
    <TestProvider
      coreClient={options?.coreClient}
      authDetails={options?.authDetails}
      queryClient={options?.queryClient}
    >
      {component}
    </TestProvider>,
  );
};

/**
 * Utility function to render components with Form provider
 */
export function renderWithFormProvider<T extends FieldValues>(
  component: React.ReactElement,
  form: UseFormReturn<T>,
) {
  return renderWithProviders(<Form {...form}>{component}</Form>);
}
