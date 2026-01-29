import { Auth0Provider } from '@auth0/auth0-react';
import type { AppState } from '@auth0/auth0-react';
import type { Auth0ProviderOptions } from '@auth0/auth0-react';
import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface Auth0ProviderWithRedirectCallbackProps extends Auth0ProviderOptions {
  children: ReactNode;
}

/**
 * Auth0Provider wrapper that handles redirect callbacks with React Router navigation.
 * This component ensures that after authentication, users are redirected back to the
 * page they were on before logging in (via appState.returnTo).
 */
export const Auth0ProviderWithRedirectCallback: FC<Auth0ProviderWithRedirectCallbackProps> = ({
  children,
  ...props
}) => {
  const navigate = useNavigate();

  const onRedirectCallback = (appState?: AppState) => {
    navigate((appState && appState.returnTo) || window.location.pathname);
  };

  return (
    <Auth0Provider onRedirectCallback={onRedirectCallback} {...props}>
      {children}
    </Auth0Provider>
  );
};
