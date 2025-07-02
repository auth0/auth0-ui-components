import './App.css';
import { Routes, Route } from 'react-router-dom';
import HomePage from './views/home-page';
import UserProfilePage from './views/user-profile-page';
import { Navbar } from './components/nav-bar';
import { Auth0ComponentProvider } from '@auth0-web-ui-components/react';
import '@auth0-web-ui-components/react/dist/index.css';
import { useTranslation } from 'react-i18next';
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const { i18n } = useTranslation();
  const auth0ContextInterface = useAuth0();

  const defaultAuthDetails = {
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    accessToken: undefined,
    scopes: undefined,
    contextInterface: auth0ContextInterface,
  };
  return (
    <div>
      <Auth0ComponentProvider
        authDetails={defaultAuthDetails}
        i18n={{ currentLanguage: i18n.language }}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<UserProfilePage />} />
        </Routes>
      </Auth0ComponentProvider>
    </div>
  );
}

export default App;
