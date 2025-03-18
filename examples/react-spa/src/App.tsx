import './App.css';
import { useAuth0 } from '@auth0/auth0-react';
import { ManageMfa } from '@auth0-web-ui-components/react';

function App() {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  const logoutWithRedirect = () =>
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });

  return (
    <div>
      <img
        src="https://cdn.cookielaw.org/logos/5b38f79c-c925-4d4e-af5e-ec27e97e1068/01963fbf-a156-710c-9ff0-e3528aa88982/baec8c9a-62ca-45e4-8549-18024c4409b1/auth0-logo.png"
        className="logo"
        alt="Auth0 logo"
      />
      <h1 className="app-title">React SPA</h1>

      {!isAuthenticated && (
        <button className="auth-button" onClick={() => loginWithRedirect()}>
          Login
        </button>
      )}
      {isAuthenticated && (
        <button className="auth-button" onClick={() => logoutWithRedirect()}>
          Logout
        </button>
      )}

      {isAuthenticated && (
        <div className="mfa-container">
          <ManageMfa
            localization={{ title: 'MFA Factors' }}
            factorConfig={{
              duo: {
                enabled: false,
              },
              'webauthn-platform': {
                visible: false,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
