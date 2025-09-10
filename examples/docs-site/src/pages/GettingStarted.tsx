import React from 'react';

import CodeBlock from '../components/CodeBlock';

export default function GettingStarted() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Getting Started</h1>
        <p className="text-xl text-gray-600">
          Learn how to integrate Auth0 UI Components into your React application.
        </p>
      </div>

      {/* Installation */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Installation</h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            Install the Auth0 UI Components package using your preferred package manager:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <CodeBlock code="npm install @auth0/ui-components-react" language="bash" title="npm" />
            <CodeBlock code="pnpm add @auth0/ui-components-react" language="bash" title="pnpm" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Shadcn</h3>
            <p className="text-gray-600 mb-4">
              If you are using Shadcn, you can add a component like UserMFA as a block to your
              project:
            </p>
            <CodeBlock
              code="npx shadcn@latest add https://auth0-web-ui-components.vercel.app/r/user-mfa-management.json"
              language="bash"
              title="Shadcn Block Installation"
            />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This method installs the component in your{' '}
                <code>src/blocks/</code> directory and includes all necessary UI dependencies.
              </p>
            </div>
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
                <strong>Auth0 Account:</strong> Sign up for a free account at{' '}
                <a href="https://auth0.com" className="text-blue-600 hover:underline">
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
                <strong>React Application:</strong> This package is designed for React 18+
                applications
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
                <strong>Auth0 React SDK:</strong> Install and configure @auth0/auth0-react
              </div>
            </li>
          </ul>
        </div>
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
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              1. Wrap Your App with Auth0Provider and Auth0ComponentProvider
            </h3>
            <CodeBlock
              code={`import { Auth0Provider } from '@auth0/auth0-react';
import { Auth0ComponentProvider } from '@auth0/ui-components-react';

const authDetails = {
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  };

function App() {
  return (
    <Auth0Provider
      authDetails={authDetails}
    >
      <Auth0ComponentProvider authDetails={authDetails}>
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
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              2. Add an Auth0 UI component (e.g. UserMFAMgmt)
            </h3>
            <CodeBlock
              code={`import { UserMFAMgmt } from '@auth0/ui-components-react';
import { useAuth0 } from '@auth0/auth0-react';

function SecurityPage() {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return (
    <div>
      <h1>Security Settings</h1>
      <UserMFAMgmt />
    </div>
  );
}`}
              language="tsx"
              title="SecurityPage.tsx"
            />
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Next Steps</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Explore Components</h3>
            <p className="text-gray-600 mb-4">
              Learn about the UserMFAMgmt component's props and customization options.
            </p>
            <a href="/components/user-mfa" className="text-blue-600 hover:underline font-medium">
              View UserMFAMgmt Documentation →
            </a>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Example Implementation</h3>
            <p className="text-gray-600 mb-4">
              See complete working examples in the `react-spa-npm` or `react-spa-shadcn` sample
              applications.
            </p>
            <a
              href="https://github.com/atko-cic/auth0-ui-components/tree/main/examples"
              className="text-blue-600 hover:underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
