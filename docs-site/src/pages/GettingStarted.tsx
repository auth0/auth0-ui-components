import CodeBlock from '../components/CodeBlock';
import TabbedCodeBlock from '../components/TabbedCodeBlock';

import { useTech } from '@/contexts/TechContext';

export default function GettingStarted() {
  const { selectedTech } = useTech();

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Auth0 Universal Components{' '}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            BETA
          </span>
        </h1>
        <p className="text-xl text-gray-600">
          Professional React components for Auth0 authentication and identity management, designed
          to help you build secure and user-friendly applications faster.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">What does "BETA" mean?</h3>
            <div className="text-yellow-800">
              <p>
                Our BETA components are stable and have been through rigorous testing. However, the
                component APIs (props, theming variables, etc.) may be subject to changes as we
                gather feedback. We do not recommend using BETA components in production
                applications.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to Use</h3>
            <div className="text-blue-800">
              <p>
                Pre-built, fully functional components that integrate seamlessly with Auth0's
                authentication platform. Simply install, configure, and start building secure
                applications with multi-factor authentication support.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">What's Included</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl">
            <div className="relative z-10">
              <div className="mb-3">
                <svg
                  className="w-8 h-8 text-white/90"
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
              </div>
              <h3 className="text-xl font-semibold mb-2">My Account Components</h3>
              <p className="text-white/90 mb-4">
                Multi-factor authentication and user security management components.
              </p>
              <a
                href="/my-account"
                className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium transition-colors"
              >
                Learn More
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-4 -translate-x-4"></div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-xl">
            <div className="relative z-10">
              <div className="mb-3">
                <svg
                  className="w-8 h-8 text-white/90"
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
              </div>
              <h3 className="text-xl font-semibold mb-2">My Organization Components</h3>
              <p className="text-white/90 mb-4">
                Organization management and administration components.
              </p>
              <a
                href="/my-org"
                className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium transition-colors"
              >
                Learn More
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-4 -translate-x-4"></div>
          </div>
        </div>
      </section>

      {/* Installation */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Installation</h2>
        <div className="space-y-6">
          {/* NPM Installation */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Option 1: NPM Package</h3>
            <p className="text-gray-600 mb-4">Install the React package:</p>
            <TabbedCodeBlock
              tabs={[
                { label: 'npm', code: 'npm install @auth0/universal-components-react' },
                { label: 'pnpm', code: 'pnpm add @auth0/universal-components-react' },
              ]}
              language="bash"
            />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This method installs pre-built components from npm and is the
                recommended approach for most applications.
              </p>
            </div>
          </div>

          {/* Shadcn Installation */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Option 2: Shadcn CLI</h3>
            <p className="text-gray-600 mb-4">
              If you're using Shadcn, you can add individual blocks directly to your project. You'll
              still need to install the core package separately:
            </p>
            <div className="space-y-3">
              <TabbedCodeBlock
                tabs={[
                  { label: 'npm', code: 'npm install @auth0/universal-components-core' },
                  { label: 'pnpm', code: 'pnpm add @auth0/universal-components-core' },
                ]}
                language="bash"
                title="1. Install Core Package"
              />
              <CodeBlock
                code="npx shadcn@latest add https://auth0-universal-components.vercel.app/r/my-org/org-details-edit.json"
                language="bash"
                title="2. Add Shadcn Block (e.g., OrgDetailsEdit)"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800 mb-3">
                <strong>Note:</strong> Shadcn installs the React component source code in your{' '}
                <code>src/auth0-ui-components/</code> directory along with all UI dependencies, but
                you must install the core package separately via npm.
              </p>
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> When using Shadcn components, you must import the global
                styles in your root file:
              </p>
            </div>
            <CodeBlock
              code={`// In your App.tsx or main entry file
import 'src/auth0-ui-components/styles/globals.css';`}
              language="tsx"
              title="3. Import Global Styles"
            />
          </div>
        </div>
      </section>

      {/* Prerequisites */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Prerequisites</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <ul className="space-y-3 text-blue-800">
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <strong>Auth0 Account:</strong> Sign up at{' '}
                <a
                  href="https://auth0.com"
                  className="text-blue-600 hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  auth0.com
                </a>
              </div>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <strong>React 16.11+:</strong> This package supports React 16.11.0 and above,
                including React 17, 18, and 19
              </div>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <strong>Tailwind CSS Configured:</strong> Follow the{' '}
                <a
                  href="https://tailwindcss.com/docs/installation"
                  className="text-blue-600 hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tailwind CSS installation guide
                </a>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Peer Dependencies */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Peer Dependencies</h2>
        <p className="text-gray-600">
          The following packages must be installed in your application:
        </p>

        {selectedTech === 'react' && (
          <>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <ul className="space-y-2 text-gray-800">
                <li className="flex items-center">
                  <code className="text-sm bg-white px-3 py-1 rounded border">
                    react ^16.11.0 || ^17 || ^18 || ^19
                  </code>
                </li>
                <li className="flex items-center">
                  <code className="text-sm bg-white px-3 py-1 rounded border">
                    react-dom ^16.11.0 || ^17 || ^18 || ^19
                  </code>
                </li>
                <li className="flex items-center">
                  <code className="text-sm bg-white px-3 py-1 rounded border">
                    react-hook-form ^7.0.0
                  </code>
                </li>
                <li className="flex items-center">
                  <code className="text-sm bg-white px-3 py-1 rounded border">
                    tailwindcss ^3.0.0 || ^4.0.0
                  </code>
                </li>
                <li className="flex items-center">
                  <code className="text-sm bg-white px-3 py-1 rounded border">
                    @auth0/auth0-react ^2.0.0
                  </code>
                </li>
              </ul>
            </div>

            <TabbedCodeBlock
              tabs={[
                {
                  label: 'npm',
                  code: 'npm install react react-dom react-hook-form tailwindcss @auth0/auth0-react',
                },
                {
                  label: 'pnpm',
                  code: 'pnpm add react react-dom react-hook-form tailwindcss @auth0/auth0-react',
                },
              ]}
              language="bash"
              title="Install Peer Dependencies"
            />
          </>
        )}

        {selectedTech === 'nextjs' && (
          <>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <ul className="space-y-2 text-gray-800">
                <li className="flex items-center">
                  <code className="text-sm bg-white px-3 py-1 rounded border">
                    react ^16.11.0 || ^17 || ^18 || ^19
                  </code>
                </li>
                <li className="flex items-center">
                  <code className="text-sm bg-white px-3 py-1 rounded border">
                    react-dom ^16.11.0 || ^17 || ^18 || ^19
                  </code>
                </li>
                <li className="flex items-center">
                  <code className="text-sm bg-white px-3 py-1 rounded border">
                    react-hook-form ^7.0.0
                  </code>
                </li>
                <li className="flex items-center">
                  <code className="text-sm bg-white px-3 py-1 rounded border">
                    tailwindcss ^3.0.0 || ^4.0.0
                  </code>
                </li>
                <li className="flex items-center">
                  <code className="text-sm bg-white px-3 py-1 rounded border">
                    @auth0/nextjs-auth0 ^4.0.0
                  </code>
                </li>
              </ul>
            </div>

            <TabbedCodeBlock
              tabs={[
                {
                  label: 'npm',
                  code: 'npm install react react-dom react-hook-form tailwindcss @auth0/nextjs-auth0',
                },
                {
                  label: 'pnpm',
                  code: 'pnpm add react react-dom react-hook-form tailwindcss @auth0/nextjs-auth0',
                },
              ]}
              language="bash"
              title="Install Peer Dependencies"
            />
          </>
        )}
      </section>

      {/* Component Configuration */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Component Configuration</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-amber-600 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-amber-900 mb-2">Important</h3>
              <p className="text-amber-800 mb-3">
                Each component may require specific configuration in your Auth0 application. Before
                using any component, make sure to check its dedicated page for component-specific
                prerequisites and Auth0 setup requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Quick Start</h2>

        {selectedTech === 'react' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2">
              <span className="text-2xl">⚛️</span>
              React SPA
            </h3>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                1. Wrap Your App with Auth0Provider and Auth0ComponentProvider
              </h4>
              <CodeBlock
                code={`import { Auth0Provider } from '@auth0/auth0-react';
import { Auth0ComponentProvider } from '@auth0/universal-components-react/spa';
import '@auth0/universal-components-react/styles';

const authDetails = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
};

function App() {
  return (
    <Auth0Provider
      domain={authDetails.domain}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <Auth0ComponentProvider 
        authDetails={authDetails}
      >
        {/* Your app components */}
      </Auth0ComponentProvider>
    </Auth0Provider>
  );
}`}
                language="tsx"
                title="App.tsx"
              />
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                2. Use an Auth0 Universal Component
              </h4>
              <CodeBlock
                code={`import { useAuth0 } from '@auth0/auth0-react';
import { OrgDetailsEdit } from '@auth0/universal-components-react/spa';

function OrganizationManagementPage() {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return (
    <div>
      <OrgDetailsEdit />
    </div>
  );
}`}
                language="tsx"
                title="OrganizationManagementPage.tsx"
              />
            </div>
          </div>
        )}

        {selectedTech === 'nextjs' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2">
              <span className="text-2xl">▲</span>
              Next.js (App Router)
            </h3>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                1. Set up Auth0ComponentProvider in Root Layout
              </h4>
              <CodeBlock
                code={`'use client';

import { Auth0ComponentProvider } from '@auth0/universal-components-react/rwa';
import '@auth0/universal-components-react/styles';

const authDetails = {
  authProxyUrl: '/',
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Auth0ComponentProvider authDetails={authDetails}>
          {children}
        </Auth0ComponentProvider>
      </body>
    </html>
  );
}`}
                language="tsx"
                title="app/layout.tsx"
              />
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                2. Use an Auth0 Universal Component in a Page
              </h4>
              <CodeBlock
                code={`'use client';

import { OrgDetailsEdit } from '@auth0/universal-components-react/rwa';

export default function OrganizationManagementPage() {
  return (
    <div>
      <OrgDetailsEdit />
    </div>
  );
}`}
                language="tsx"
                title="OrganizationManagementPage.tsx"
              />
            </div>
          </div>
        )}
      </section>

      {/* Provider Configuration */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Auth0ComponentProvider Configuration
        </h2>
        <p className="text-gray-600 mb-4">
          The <code className="text-sm bg-gray-100 px-2 py-1 rounded">Auth0ComponentProvider</code>{' '}
          accepts the following properties to configure the behavior and appearance of Auth0 UI
          Components:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Property
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  Required
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  authDetails
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  <code className="text-xs">AuthDetails</code>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">Yes</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Authentication configuration including domain and optional authProxyUrl
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  i18n
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  <code className="text-xs">I18nOptions</code>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">No</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Internationalization settings including currentLanguage and fallbackLanguage
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  themeSettings
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  <code className="text-xs">ThemeSettings</code>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">No</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Theme configuration including mode (light/dark), theme variant
                  (default/minimal/rounded), and CSS variables
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  toastSettings
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  <code className="text-xs">ToastSettings</code>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">No</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Toast notification configuration including provider selection (sonner/custom),
                  positioning, duration, and custom toast methods
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  loader
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  <code className="text-xs">React.ReactNode</code>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">No</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Custom loading component to display during authentication initialization
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* AuthDetails Object */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">authDetails</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Property
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    Required
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    domain
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code className="text-xs">string</code>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">Yes</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Your Auth0 domain (e.g., "your-tenant.auth0.com")
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    authProxyUrl
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code className="text-xs">string</code>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">No</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    URL to your authentication proxy server for server-side authentication (enables
                    Proxy Mode)
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    contextInterface
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code className="text-xs">BasicAuth0ContextInterface</code>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">No</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Custom authentication context interface for frameworks other than
                    @auth0/auth0-react. Provides authentication functions (getAccessTokenSilently,
                    loginWithRedirect, etc.) when not using the Auth0 React SDK
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* i18n Settings */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">i18n</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Property
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    Default
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    currentLanguage
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code className="text-xs">string</code>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">"en"</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Current language code (e.g., "en", "es", "fr")
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    fallbackLanguage
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code className="text-xs">string</code>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">"en"</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Fallback language code when translations are missing
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">themeSettings</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Property
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    Default
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    mode
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code className="text-xs">"light" | "dark"</code>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">"light"</td>
                  <td className="px-4 py-2 text-sm text-gray-500">Theme color mode</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    theme
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code className="text-xs">"default" | "minimal" | "rounded"</code>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">"default"</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Theme variant with different styling approaches
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    variables
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code className="text-xs">ThemeVariables</code>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{'{}'}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    CSS custom properties for common, light, and dark themes
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Available CSS Variables */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">Available CSS Variables</h4>

            <div className="space-y-4 text-sm text-blue-800">
              <div>
                <strong className="block mb-2">Common (applies to all themes):</strong>
                <div className="grid grid-cols-2 gap-2 ml-4">
                  <div>
                    <strong>Typography:</strong>
                    <ul className="list-disc ml-4 text-xs">
                      <li>
                        <code>--font-size-page-header</code>
                      </li>
                      <li>
                        <code>--font-size-page-description</code>
                      </li>
                      <li>
                        <code>--font-size-heading</code>
                      </li>
                      <li>
                        <code>--font-size-title</code>
                      </li>
                      <li>
                        <code>--font-size-subtitle</code>
                      </li>
                      <li>
                        <code>--font-size-body</code>
                      </li>
                      <li>
                        <code>--font-size-paragraph</code>
                      </li>
                      <li>
                        <code>--font-size-label</code>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <strong>Border Radius:</strong>
                    <ul className="list-disc ml-4 text-xs">
                      <li>
                        <code>--radius-xs</code> through <code>--radius-9xl</code>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <strong className="block mb-2">
                  Light & Dark (theme-specific colors and shadows):
                </strong>
                <div className="grid grid-cols-2 gap-2 ml-4">
                  <div>
                    <strong>Colors:</strong>
                    <ul className="list-disc ml-4 text-xs">
                      <li>
                        <code>--background</code>
                      </li>
                      <li>
                        <code>--foreground</code>
                      </li>
                      <li>
                        <code>--card</code>
                      </li>
                      <li>
                        <code>--card-foreground</code>
                      </li>
                      <li>
                        <code>--primary</code>
                      </li>
                      <li>
                        <code>--primary-foreground</code>
                      </li>
                      <li>
                        <code>--secondary</code>
                      </li>
                      <li>
                        <code>--secondary-foreground</code>
                      </li>
                      <li>
                        <code>--accent</code>
                      </li>
                      <li>
                        <code>--accent-foreground</code>
                      </li>
                      <li>
                        <code>--muted</code>
                      </li>
                      <li>
                        <code>--muted-foreground</code>
                      </li>
                      <li>
                        <code>--destructive</code>
                      </li>
                      <li>
                        <code>--destructive-foreground</code>
                      </li>
                      <li>
                        <code>--popover</code>
                      </li>
                      <li>
                        <code>--popover-foreground</code>
                      </li>
                      <li>
                        <code>--input</code>
                      </li>
                      <li>
                        <code>--border</code>
                      </li>
                      <li>
                        <code>--ring</code>
                      </li>
                      <li>
                        <code>--color-page</code>
                      </li>
                      <li>
                        <code>--color-info</code>
                      </li>
                      <li>
                        <code>--color-info-foreground</code>
                      </li>
                      <li>
                        <code>--color-success</code>
                      </li>
                      <li>
                        <code>--color-success-foreground</code>
                      </li>
                      <li>
                        <code>--color-warning</code>
                      </li>
                      <li>
                        <code>--color-warning-foreground</code>
                      </li>
                      <li>
                        <code>--color-destructive-border</code>
                      </li>
                      <li>
                        <code>--color-popover-border</code>
                      </li>
                      <li>
                        <code>--color-input-foreground</code>
                      </li>
                      <li>
                        <code>--color-input-muted</code>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <strong>Shadows:</strong>
                    <ul className="list-disc ml-4 text-xs">
                      <li>
                        <code>--shadow-bevel-*</code> (xs, sm, md, lg, xl, 2xl)
                      </li>
                      <li>
                        <code>--shadow-button-*</code> (resting, hover, focus)
                      </li>
                      <li>
                        <code>--shadow-button-destructive-*</code>
                      </li>
                      <li>
                        <code>--shadow-button-outlined-*</code>
                      </li>
                      <li>
                        <code>--shadow-input-*</code> (resting, hover, focus)
                      </li>
                      <li>
                        <code>--shadow-input-destructive-*</code>
                      </li>
                      <li>
                        <code>--shadow-checkbox-*</code> (resting, hover)
                      </li>
                      <li>
                        <code>--shadow-switch-*</code> (resting, hover, focus, thumb, thumb-dark)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Settings */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">toastSettings</h3>
          <p className="text-gray-600 mb-4">
            Toast settings support two provider types: Sonner (default) or custom. Each provider has
            its own configuration structure for better type safety.
          </p>

          {/* Sonner Provider */}
          <div className="mb-6">
            <h4 className="text-base font-medium text-gray-900 mb-3">Sonner Provider (Default)</h4>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Property
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                      Default
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      provider
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      <code className="text-xs">"sonner"</code>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">"sonner"</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      Uses the built-in Sonner toast library
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      settings.position
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      <code className="text-xs">ToastPosition</code>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      "top-right"
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      Position where toasts appear: "top-left", "top-right", "bottom-left",
                      "bottom-right", "top-center", "bottom-center"
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      settings.duration
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      <code className="text-xs">number</code>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">4000</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      Duration in milliseconds before toast auto-dismisses
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      settings.maxToasts
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      <code className="text-xs">number</code>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">3</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      Maximum number of toasts visible at once
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      settings.dismissible
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      <code className="text-xs">boolean</code>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">true</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      Whether toasts can be manually dismissed by user interaction
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      settings.closeButton
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      <code className="text-xs">boolean</code>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">true</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      Whether to show an explicit close button on toasts for better UX
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Custom Provider */}
          <div className="mb-6">
            <h4 className="text-base font-medium text-gray-900 mb-3">Custom Provider</h4>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Property
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                      Required
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      provider
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      <code className="text-xs">"custom"</code>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">Yes</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      Uses your custom toast implementation
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      methods
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      <code className="text-xs">CustomToastMethods</code>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">Yes</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      Custom toast methods for success, error, warning, info, and dismiss actions
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sonner Provider Example */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">Sonner Provider Example</h4>
            <div className="text-sm text-blue-800 space-y-3">
              <p>Using the built-in Sonner toast library with custom settings:</p>

              <div className="bg-white rounded p-3 font-mono text-xs overflow-x-auto">
                <pre>{`const toastSettings = {
  provider: 'sonner', // Optional, this is the default
  settings: {
    position: 'top-center',
    duration: 6000,
    maxToasts: 5,
    dismissible: true,
    closeButton: true // Enabled by default for better UX
  }
};`}</pre>
              </div>
            </div>
          </div>

          {/* Custom Provider Example */}
          <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-3">Custom Provider Example</h4>
            <div className="text-sm text-purple-800 space-y-3">
              <p>
                When using <code>provider: "custom"</code>, you need to provide custom methods:
              </p>

              <div className="bg-white rounded p-3 font-mono text-xs overflow-x-auto">
                <pre>{`const toastSettings = {
  provider: 'custom',
  methods: {
    success: (message: string) => {
      // Your custom success toast implementation
      myToastLibrary.success(message);
    },
    error: (message: string) => {
      // Your custom error toast implementation
      myToastLibrary.error(message);
    },
    warning: (message: string) => {
      // Your custom warning toast implementation
      myToastLibrary.warning(message);
    },
    info: (message: string) => {
      // Your custom info toast implementation
      myToastLibrary.info(message);
    },
    dismiss: (toastId?: string) => {
      // Your custom dismiss implementation
      myToastLibrary.dismiss(toastId);
    }
  }
};`}</pre>
              </div>
              <p>
                <strong>Note:</strong> Custom methods only receive the message text. Your custom
                implementation handles all styling, positioning, and timing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Start Building</h2>
        <p className="text-lg text-gray-600 mb-6">
          Ready to add Auth0 components to your application? Choose your path:
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl">
            <div className="relative z-10">
              <div className="mb-3">
                <svg
                  className="w-8 h-8 text-white/90"
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
              </div>
              <h3 className="text-xl font-semibold mb-2">My Account Components</h3>
              <p className="text-white/90 mb-4">
                Multi-factor authentication and user security management components.
              </p>
              <a
                href="/my-account/user-mfa-management"
                className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium transition-colors"
              >
                Explore UserMFA
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-4 -translate-x-4"></div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-xl">
            <div className="relative z-10">
              <div className="mb-3">
                <svg
                  className="w-8 h-8 text-white/90"
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
              </div>
              <h3 className="text-xl font-semibold mb-2">My Organization Components</h3>
              <p className="text-white/90 mb-4">
                Organization management and administration components.
              </p>
              <a
                href="/my-org"
                className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium transition-colors"
              >
                Explore My Organization
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-4 -translate-x-4"></div>
          </div>
        </div>

        <div className="mt-8 bg-white border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-3">Example Implementation</h3>
          <p className="text-gray-600 mb-4">
            See complete working examples in the "react-spa-npm", "react-spa-shadcn", "next-rwa"
            sample applications.
          </p>
          <a
            href="https://github.com/auth0/auth0-ui-components/tree/main/examples"
            className="text-blue-600 hover:underline font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub →
          </a>
        </div>
      </section>
    </div>
  );
}
