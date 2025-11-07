import { Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface LayoutProps {
  children: ReactNode;
}

const navigationSections = [
  {
    title: 'UI Components',
    items: [{ name: 'Getting Started', href: '/' }],
  },
  {
    title: 'My Account',
    items: [
      { name: 'Introduction', href: '/my-account' },
      { name: 'UserMFAMgmt', href: '/my-account/user-mfa-management' },
    ],
  },
  {
    title: 'My Organization',
    items: [
      { name: 'Introduction', href: '/my-org' },
      { name: 'OrgDetailsEdit', href: '/my-org/org-details-edit' },
      { name: 'SsoProviderTable', href: '/my-org/sso-provider-table' },
      { name: 'SsoProviderCreate', href: '/my-org/sso-provider-create' },
      { name: 'SsoProviderEdit', href: '/my-org/sso-provider-edit' },
      { name: 'DomainTable', href: '/my-org/domain-table' },
    ],
  },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();

  const getSectionTitleClasses = (title: string) => {
    switch (title) {
      case 'My Account':
        return 'text-sm font-semibold text-blue-700 tracking-wider mb-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 px-2 py-1 rounded';
      case 'My Organization':
        return 'text-sm font-semibold text-emerald-700 tracking-wider mb-3 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 px-2 py-1 rounded';
      default:
        return 'text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3';
    }
  };

  const getSectionIcon = (title: string) => {
    switch (title) {
      case 'My Account':
        return (
          <svg
            className="w-3 h-3 text-blue-600 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        );
      case 'My Organization':
        return (
          <svg
            className="w-3 h-3 text-emerald-600 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getChildItemClasses = (
    sectionTitle: string,
    isActive: boolean,
    isMobile: boolean = false,
  ) => {
    const baseClasses = 'block px-3 py-2 text-sm rounded-md transition-colors';

    switch (sectionTitle) {
      case 'My Account':
        if (isActive) {
          return `${baseClasses} ${isMobile ? 'bg-gray-100 text-gray-900 border-l-2 border-blue-600/30' : 'bg-white text-gray-900 shadow-sm border border-gray-200 border-l-2 border-l-blue-600/30'}`;
        }
        return `${baseClasses} text-gray-600 hover:text-gray-900 ${isMobile ? 'hover:bg-gray-50' : 'hover:bg-white'}`;

      case 'My Organization':
        if (isActive) {
          return `${baseClasses} ${isMobile ? 'bg-gray-100 text-gray-900 border-l-2 border-emerald-600/30' : 'bg-white text-gray-900 shadow-sm border border-gray-200 border-l-2 border-l-emerald-600/30'}`;
        }
        return `${baseClasses} text-gray-600 hover:text-gray-900 ${isMobile ? 'hover:bg-gray-50' : 'hover:bg-white'}`;

      default:
        if (isActive) {
          return `${baseClasses} ${isMobile ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-900 shadow-sm border border-gray-200'}`;
        }
        return `${baseClasses} text-gray-600 hover:text-gray-900 ${isMobile ? 'hover:bg-gray-50' : 'hover:bg-white'}`;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Auth0 Logo + UI Components + Docs */}
            <div className="flex items-center space-x-4">
              {/* Sidebar Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Auth0 Logo */}
              <div className="flex items-center">
                <img src="/img/auth0_light_mode.png" alt="Auth0" className="h-8 w-auto" />
              </div>

              {/* UI Components */}
              <Link to="/" className="text-lg font-medium text-gray-900">
                UI Components
              </Link>

              <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-yellow-100 text-yellow-800">
                BETA
              </span>
              {/* Docs */}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64">
          <div className="px-4 py-6">
            {navigationSections.map((section) => (
              <div key={section.title} className="mb-6">
                <h3 className={getSectionTitleClasses(section.title)}>
                  <div className="flex items-center">
                    {getSectionIcon(section.title)}
                    {section.title}
                  </div>
                </h3>
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={getChildItemClasses(section.title, isActive, true)}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div className="flex items-center justify-between">
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:border-gray-100 md:bg-gray-50 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto">
          <div className="flex-1 px-4 py-6">
            {navigationSections.map((section) => (
              <div key={section.title} className="mb-8">
                <h3 className={getSectionTitleClasses(section.title)}>
                  <div className="flex items-center">
                    {getSectionIcon(section.title)}
                    {section.title}
                  </div>
                </h3>
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={getChildItemClasses(section.title, isActive, false)}
                      >
                        <div className="flex items-center justify-between">
                          <span>{item.name}</span>
                        </div>
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
    </div>
  );
}
