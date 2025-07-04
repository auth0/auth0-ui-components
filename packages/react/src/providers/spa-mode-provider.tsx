'use client';

import * as React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { AuthDetails } from './types';

/**
 * Props for the SpaModeProvider component.
 */
interface SpaModeProviderProps {
  /** The child components to render within the provider. */
  children: React.ReactNode;
  /**
   * State setter for authentication details. Called with the fetched Auth0 authentication
   * information including access token, domain, client ID, scopes, and any errors.
   */
  setAuthDetails: React.Dispatch<React.SetStateAction<AuthDetails | undefined>>;
  /**
   * State setter for the API base URL. Called with the Auth0 domain extracted from
   * the ID token claims, or undefined if authentication fails.
   */
  setApiBaseUrl: React.Dispatch<React.SetStateAction<string | undefined>>;
}

/**
 * SpaModeProvider
 *
 * A React component that handles authentication state management in SPA (Single Page Application) mode.
 * This provider fetches Auth0 authentication details when mounted and updates the parent component's
 * state with the retrieved information.
 *
 * **Key Features:**
 * - Automatically fetches access tokens and ID token claims on mount
 * - Extracts authentication details (domain, client ID, scopes) from Auth0 responses
 * - Handles authentication errors gracefully
 * - Updates parent state with authentication information and API base URL
 * - Uses cache-off mode to ensure fresh token retrieval
 *
 * **Authentication Flow:**
 * 1. Calls `getAccessTokenSilently()` with detailed response to get access token and scopes
 * 2. Calls `getIdTokenClaims()` to extract issuer (domain) and audience (client ID)
 * 3. Combines the information into an `AuthDetails` object
 * 4. Sets the Auth0 domain as the API base URL for subsequent API calls
 * 5. On error, sets all auth details to undefined and captures the error
 *
 * **Usage:**
 * This component is typically used internally by `Auth0ComponentProvider` when operating
 * in SPA mode (when `authProxyUrl` is not provided). It should not be used directly
 * by consuming applications.
 *
 * @param props - The component props
 * @param props.children - Child components that require authentication context
 * @param props.setAuthDetails - Function to update the authentication details in parent state
 * @param props.setApiBaseUrl - Function to update the API base URL in parent state
 * @returns JSX element that renders the provided children
 *
 * @example
 * ```tsx
 * // Internal usage within Auth0ComponentProvider
 * <SpaModeProvider
 *   setAuthDetails={setAuthDetails}
 *   setApiBaseUrl={setApiBaseUrl}
 * >
 *   <App />
 * </SpaModeProvider>
 * ```
 *
 * @see {@link AuthDetails} for the structure of authentication details
 * @see {@link Auth0ComponentProvider} for the main provider component
 */
function SpaModeProvider({ children, setAuthDetails, setApiBaseUrl }: SpaModeProviderProps) {
  const { getIdTokenClaims, getAccessTokenSilently } = useAuth0();

  React.useEffect(() => {
    const fetchAuth = async () => {
      try {
        const tokenRes = await getAccessTokenSilently({
          cacheMode: 'off',
          detailedResponse: true,
        });
        const claims = await getIdTokenClaims();

        const details: AuthDetails = {
          accessToken: tokenRes.access_token,
          domain: claims?.iss,
          clientId: claims?.aud,
          scopes: tokenRes.scope,
          loading: false,
          error: undefined,
        };
        setAuthDetails(details);
        setApiBaseUrl(details.domain);
      } catch (err) {
        const errorDetails: AuthDetails = {
          accessToken: undefined,
          domain: undefined,
          clientId: undefined,
          scopes: undefined,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        };
        setAuthDetails(errorDetails);
        setApiBaseUrl(undefined);
      }
    };

    fetchAuth();
  }, [getIdTokenClaims, getAccessTokenSilently, setAuthDetails, setApiBaseUrl]);

  return <>{children}</>;
}

export default SpaModeProvider;
