import { Link } from 'react-router-dom';

import { AuthButton } from './AuthButton';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation - Left aligned */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="-m-1.5 p-1.5">
              <img
                className="h-8 w-auto"
                src="https://cdn.auth0.com/quantum-assets/dist/2.0.2/logos/auth0/auth0-lockup-en-onlight.svg"
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
