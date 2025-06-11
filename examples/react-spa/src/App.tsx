import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { useAuth0 } from '@auth0/auth0-react';
import { ManageMfa } from '@auth0-web-ui-components/react';

function App() {
  const [count, setCount] = useState(0);
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  const logoutWithRedirect = () =>
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });

  //TODO cleanup to add auth0 asset
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
      {!isAuthenticated && <button onClick={() => loginWithRedirect()}>Login</button>}
      <button onClick={() => logoutWithRedirect()}>Logout</button>
      {isAuthenticated && (
        <ManageMfa
          localization={{ title: 'My Factors' }}
          factorConfig={{
            duo: {
              enabled: false,
            },
            'webauthn-platform': {
              visible: false,
            },
          }}
        />
      )}
    </>
  );
}

export default App;
