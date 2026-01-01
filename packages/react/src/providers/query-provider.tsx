import {
  QueryClient,
  QueryClientProvider as TanStackQueryClientProvider,
} from '@tanstack/react-query';
import * as React from 'react';

/**
 * Default QueryClient configuration optimized for Auth0 UI Components
 */
function createDefaultQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Cache is garbage collected after 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests up to 3 times
        retry: 3,
        // Exponential backoff for retries
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Don't refetch on window focus by default (can be overridden per query)
        refetchOnWindowFocus: false,
        // Refetch when reconnecting
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
      },
    },
  });
}

// Singleton QueryClient instance
let queryClientInstance: QueryClient | null = null;

/**
 * Get or create the singleton QueryClient instance
 */
export function getQueryClient(): QueryClient {
  if (!queryClientInstance) {
    queryClientInstance = createDefaultQueryClient();
  }
  return queryClientInstance;
}

/**
 * Reset the QueryClient instance (useful for testing)
 */
export function resetQueryClient(): void {
  if (queryClientInstance) {
    queryClientInstance.clear();
    queryClientInstance = null;
  }
}

export interface QueryProviderProps {
  children: React.ReactNode;
  /**
   * Custom QueryClient instance. If not provided, a default one will be created.
   */
  client?: QueryClient;
}

/**
 * Context to track if QueryProvider is already mounted
 */
const QueryProviderContext = React.createContext<boolean>(false);

/**
 * Hook to check if QueryProvider is available
 */
export function useQueryProviderCheck(): boolean {
  return React.useContext(QueryProviderContext);
}

/**
 * QueryProvider component that wraps TanStack Query's QueryClientProvider
 *
 * Features:
 * - Singleton QueryClient management
 * - Prevents duplicate provider nesting
 *
 * @example
 * ```tsx
 * import { QueryProvider } from '@auth0/universal-components-react';
 *
 * function App() {
 *   return (
 *     <QueryProvider>
 *       <YourComponents />
 *     </QueryProvider>
 *   );
 * }
 * ```
 */
export function QueryProvider({ children, client }: QueryProviderProps) {
  const isAlreadyProvided = useQueryProviderCheck();

  const queryClient = React.useMemo(() => {
    return client || getQueryClient();
  }, [client]);

  // If already wrapped in a QueryProvider, just render children
  if (isAlreadyProvided) {
    return <>{children}</>;
  }

  return (
    <QueryProviderContext.Provider value={true}>
      <TanStackQueryClientProvider client={queryClient}>{children}</TanStackQueryClientProvider>
    </QueryProviderContext.Provider>
  );
}
