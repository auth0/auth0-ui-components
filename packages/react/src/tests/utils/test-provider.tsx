import type { CoreClientInterface, AuthDetails } from '@auth0/universal-components-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import React from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

import { Form } from '@/components/ui/form';
import { CoreClientContext } from '@/hooks/shared/use-core-client';
import { GateKeeperContext } from '@/providers/gate-keeper-context';
import { PermissionContext } from '@/providers/permission-provider';
import { TelemetryProvider } from '@/providers/telemetry-provider';
import { createMockCoreClient } from '@/tests/utils/__mocks__/core/core-client.mocks';
import { ALL_MY_ORG_PERMISSIONS } from '@/tests/utils/__mocks__/permissions/permission.mocks';

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
  permissions?: string[];
}

/**
 * Test provider that wraps components with the necessary context for testing
 * @param props - Provider props.
 * @param props.children - Child components.
 * @param props.coreClient - Core client instance.
 * @param props.authDetails - Auth details.
 * @param props.queryClient - Query client instance.
 * @param props.permissions - Granted permissions.
 * @returns JSX element
 */
export const TestProvider: React.FC<TestProviderProps> = ({
  children,
  coreClient,
  authDetails,
  queryClient,
  permissions = ALL_MY_ORG_PERMISSIONS,
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

  const permissionValue = React.useMemo(() => ({ permissions, isLoading: false }), [permissions]);

  // Create a ref for telemetry tracker
  const componentRef = React.useRef<string>('test-component');

  return (
    <QueryClientProvider client={testQueryClient}>
      <TelemetryProvider componentRef={componentRef}>
        <GateKeeperContext.Provider value={{ error: null }}>
          <CoreClientContext.Provider value={contextValue}>
            <PermissionContext.Provider value={permissionValue}>
              {children}
            </PermissionContext.Provider>
          </CoreClientContext.Provider>
        </GateKeeperContext.Provider>
      </TelemetryProvider>
    </QueryClientProvider>
  );
};

/**
 * Utility function to render components with TestProvider
 * @param component - React component to render
 * @param options - Configuration options
 * @param options.coreClient - Core client instance
 * @param options.authDetails - Authentication details configuration
 * @param options.queryClient - React Query client instance
 * @param options.permissions - Granted permissions
 * @returns JSX element
 */
export const renderWithProviders = (
  component: React.ReactElement,
  options?: {
    coreClient?: CoreClientInterface;
    authDetails?: Partial<AuthDetails>;
    queryClient?: QueryClient;
    permissions?: string[];
  },
): RenderResult => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestProvider
      coreClient={options?.coreClient}
      authDetails={options?.authDetails}
      queryClient={options?.queryClient}
      permissions={options?.permissions}
    >
      {children}
    </TestProvider>
  );
  return render(component, { wrapper: Wrapper });
};

/**
 * Utility function to render components with Form provider
 * @param component - React component to render
 * @param form - React Hook Form instance
 * @returns JSX element
 */
export function renderWithFormProvider<T extends FieldValues>(
  component: React.ReactElement,
  form: UseFormReturn<T>,
) {
  return renderWithProviders(<Form {...form}>{component}</Form>);
}

export const createQueryClientWrapper = createTestQueryClientWrapper;
