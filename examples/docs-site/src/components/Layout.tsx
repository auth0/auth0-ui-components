import { useAuth0 } from '@auth0/auth0-react';
import { Menu, X, LogOut, User } from 'lucide-react';
import type { ReactNode } from 'react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const navigationSections = [
  {
    title: 'Getting Started',
    items: [
      { name: 'Introduction', href: '/' },
      { name: 'Installation', href: '/getting-started' },
    ],
  },
  {
    title: 'Components',
    items: [{ name: 'UserMFA', href: '/components/user-mfa' }],
  },
];

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const location = useLocation();
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0();

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (userMenuOpen && !target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Auth0 Logo + UI Components + Docs */}
            <div className="flex items-center space-x-4">
              {/* Auth0 Logo */}
              <div className="flex items-center">
                <img src="/auth0_light_mode.png" alt="Auth0" className="h-8 w-auto" />
              </div>

              {/* UI Components */}
              <Link to="/" className="text-lg font-medium text-gray-900">
                UI Components
              </Link>

              {/* Docs */}
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
                Docs
              </Link>
            </div>

            {/* Right side - User profile and mobile menu */}
            <div className="flex items-center space-x-4">
              {/* User Profile Dropdown */}
              <div className="relative user-menu-container">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
                      >
                        {user?.picture ? (
                          <img
                            src={user.picture}
                            alt={user.name || 'User'}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                        <span className="hidden md:block">{user?.name || user?.email}</span>
                      </button>

                      {userMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                          <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                            <div className="font-medium">{user?.name || 'User'}</div>
                            <div className="text-gray-500">{user?.email}</div>
                          </div>
                          <button
                            onClick={() => {
                              localStorage.setItem(
                                'preLogoutLocation',
                                window.location.pathname + window.location.hash,
                              );
                              logout({ logoutParams: { returnTo: window.location.origin } });
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : !isLoading ? (
                  <button
                    onClick={() =>
                      loginWithRedirect({
                        appState: { returnTo: window.location.pathname + window.location.hash },
                      })
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </button>
                ) : null}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  type="button"
                  className="text-gray-600 hover:text-gray-900 p-2"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:border-gray-100 md:bg-gray-50 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto">
          <div className="flex-1 px-4 py-6">
            {navigationSections.map((section) => (
              <div key={section.title} className="mb-8">
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                          isActive
                            ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-6 py-8">{children}</div>
        </main>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3">
            {/* Navigation Sections */}
            {navigationSections.map((section) => (
              <div key={section.title} className="mb-6">
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                          isActive
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
