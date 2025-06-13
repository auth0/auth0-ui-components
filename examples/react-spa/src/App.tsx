import './App.css';
import { Routes, Route } from 'react-router-dom';
import HomePage from './views/home-page';
import UserProfilePage from './views/user-profile-page';
import { Navbar } from './components/nav-bar';
import { Auth0ComponentProvider } from '@auth0-web-ui-components/react';
import '@auth0-web-ui-components/react/dist/index.css';
import { useTranslation } from 'react-i18next';

function App() {
  const { i18n } = useTranslation();
  return (
    <div>
      <Auth0ComponentProvider i18n={{ currentLanguage: i18n.language }}>
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
