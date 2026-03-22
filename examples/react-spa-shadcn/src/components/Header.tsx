import { Link } from 'react-router-dom';

import { useDarkMode } from '../hooks/use-dark-mode';

import { AuthButton } from './AuthButton';

const LOGO_ON_LIGHT =
  'https://cdn.auth0.com/quantum-assets/dist/2.0.2/logos/auth0/auth0-lockup-en-onlight.svg';
const LOGO_ON_DARK =
  'https://cdn.auth0.com/quantum-assets/dist/2.0.2/logos/auth0/auth0-lockup-en-ondark.svg';

const Header = () => {
  const isDarkMode = useDarkMode();

  return (
    <header className="bg-white dark:bg-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation - Left aligned */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="-m-1.5 p-1.5">
              <img
                className="h-8 w-auto"
                src={isDarkMode ? LOGO_ON_DARK : LOGO_ON_LIGHT}
                alt="Auth0 Logo"
              />
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8"></nav>
          </div>

          {/* Auth Button */}
          <div className="flex items-center space-x-4">
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
