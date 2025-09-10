import React from 'react';

import CodeBlock from '../components/CodeBlock';
import { ComponentDemo } from '../components/ComponentDemo';

export default function UserMFA() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">UserMFAMgmt Component</h1>
        <p className="text-xl text-gray-600">
          A comprehensive Multi-Factor Authentication (MFA) management component for Auth0
          applications.
        </p>
      </div>

      {/* Overview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Overview</h2>
        <div className="max-w-none">
          <p>
            The <code>UserMFAMgmt</code> component provides a complete solution for managing user
            Multi-Factor Authentication factors. It handles fetching, enrolling, and deleting MFA
            factors while supporting both Single Page Application (SPA) and Regular Web Application
            (RWA) authentication modes.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Factor Management</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• View existing MFA factors</li>
              <li>• Enroll new factors</li>
              <li>• Remove unwanted factors</li>
              <li>• Filter active factors</li>
            </ul>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Supported Factor Types</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Phone Message</li>
              <li>• One-Time Password</li>
              <li>• Email</li>
              <li>• Push Notification using Auth0 Guardian</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Prerequisites */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Prerequisites</h2>
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">
              Auth0 Application Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">1. Enable MFA Grant Types</h4>
                <p className="text-blue-700 text-sm mb-2">
                  In your Auth0 Dashboard, navigate to Applications → [Your App] → Settings →
                  Advanced Settings → Grant Types and ensure the following are enabled:
                </p>
                <div className="bg-white rounded-lg p-3 space-y-1">
                  <p className="text-sm text-gray-700">• MFA (mfa)</p>
                  <p className="text-sm text-gray-700">• Authorization Code</p>
                  <p className="text-sm text-gray-700">• Refresh Token</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-blue-800 mb-2">2. Configure MFA Policies</h4>
                <p className="text-blue-700 text-sm mb-2">
                  Navigate to Security → Multi-factor Auth and configure:
                </p>
                <div className="bg-white rounded-lg p-3 space-y-1">
                  <p className="text-sm text-gray-700">
                    • Enable desired MFA factors (Phone Message, One-Time Password, Email)
                  </p>
                  <p className="text-sm text-gray-700">
                    • Set up MFA policies for your application
                  </p>
                  <p className="text-sm text-gray-700">• Configure factor settings and templates</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-blue-800 mb-2">3. Environment Variables</h4>
                <p className="text-blue-700 text-sm mb-2">
                  Create a <code>.env</code> file in your project root:
                </p>
                <div className="bg-white rounded-lg p-3">
                  <CodeBlock
                    code={`VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-audience # Optional`}
                    language="bash"
                    title=".env"
                  />
                </div>
              </div>
            </div>
          </div>

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
                <h3 className="text-lg font-medium text-amber-900 mb-2">Important Notes</h3>
                <ul className="space-y-2 text-amber-800 text-sm">
                  <li>• The user must be authenticated before using this component</li>
                  <li>
                    • MFA configuration may take a few minutes to propagate across Auth0's systems
                  </li>
                  <li>
                    • Test MFA enrollment in a development environment before deploying to
                    production
                  </li>
                  <li>• Consider implementing fallback authentication methods</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Interactive Demo</h2>
        <div className="max-w-none">
          <p>
            Experience the <code>UserMFAMgmt</code> component in action. Use the controls below to
            see how different configuration options affect the component's appearance and behavior.
          </p>
        </div>
        <ComponentDemo />
      </section>

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
              If you are using Shadcn, you can add the UserMFA component as a block to your project:
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

      {/* Basic Usage */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Basic Usage</h2>
        <CodeBlock
          code={`import { UserMFAMgmt } from '@auth0/ui-components-react';

export function SecurityPage() {
  return (
    <div>
      <h1>Security Settings</h1>
      <UserMFAMgmt />
    </div>
  );
}`}
          language="tsx"
          title="Basic implementation"
        />
      </section>

      {/* Props */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Props</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  Prop
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  Type
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  Default
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  customMessages
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">Partial&lt;MFALocaleContent&gt;</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{}</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  customMessages object for i18n support
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  hideHeader
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">boolean</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">false</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Whether to hide the component header
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  showActiveOnly
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">boolean</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">false</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Whether to show only active MFA factors
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  disableEnroll
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">boolean</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">false</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Whether to disable enrollment of new factors
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  disableDelete
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">boolean</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">false</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Whether to disable deletion of factors
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  readOnly
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">boolean</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">false</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Whether the component is in read-only mode
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  schemaValidation
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {'{'}email?: RegExp; phone?: RegExp{'}'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Custom validation patterns for email and phone inputs
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  factorConfig
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Record&lt;string, {'{'}visible?: boolean; enabled?: boolean{'}'}&gt;
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for individual MFA factors (phone-message, One-Time Password, email,
                  duo, webauthn-platform, webauthn-roaming, recovery-code)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  onEnroll
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">() =&gt; void</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Callback function called when a factor is successfully enrolled
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  onDelete
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">() =&gt; void</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Callback function called when a factor is successfully deleted
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  onFetch
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">() =&gt; void</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Callback function called when factors are successfully fetched
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  onErrorAction
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  (error: Error, action: string) =&gt; void
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Callback function called when an error occurs during any action
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  onBeforeAction
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  (action: string, factorType?: string) =&gt; boolean
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Callback function called before any action. Return false to cancel the action
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Advanced Configuration */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Advanced Configuration</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Factor Configuration</h3>
            <p className="text-gray-600 mb-4">
              Control which MFA factors are visible and enabled using the <code>factorConfig</code>{' '}
              prop:
            </p>
            <CodeBlock
              code={`<UserMFAMgmt
  factorConfig={{
    sms: { visible: true, enabled: true },
    totp: { visible: true, enabled: true },
    email: { visible: false, enabled: false },
    'webauthn-platform': { visible: true, enabled: true }
  }}
/>`}
              language="tsx"
              title="Factor configuration example"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Event Callbacks</h3>
            <p className="text-gray-600 mb-4">
              React to component events by defining callback functions:
            </p>
            <CodeBlock
              code={`<UserMFAMgmt
  onEnroll={() => console.log('Factor enrolled')}
  onDelete={() => console.log('Factor deleted')}
  onFetch={() => console.log('Factors fetched')}
  onErrorAction={(error, action) => {
    console.error(\`Error during \${action}:\`, error);
  }}
  onBeforeAction={(action, factorType) => {
    // Return false to cancel the action
    return confirm(\`Are you sure you want to \${action} \${factorType}?\`);
  }}
/>`}
              language="tsx"
              title="Event callback handlers"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">customMessages</h3>
            <p className="text-gray-600 mb-4">Customize text and translations:</p>
            <CodeBlock
              code={`<UserMFAMgmt
  customMessages={{
    title: 'Manage MFA Factors',
    description: 'Secure your account with multi-factor authentication.',
    no_active_mfa: 'No MFA factors configured',
    enroll_factor: 'MFA factor enrolled successfully',
    remove_factor: 'MFA factor removed successfully',
    sms: {
      title: 'SMS Authentication',
      description: 'Receive codes via text message'
    },
    totp: {
      title: 'Authenticator App',
      description: 'Use an authenticator app like Google Authenticator'
    }
  }}
/>`}
              language="tsx"
              title="customMessages configuration"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Schema Validation</h3>
            <p className="text-gray-600 mb-4">
              Customize validation patterns for email and phone number inputs:
            </p>
            <CodeBlock
              code={`<UserMFAMgmt
  schemaValidation={{
    // Custom email validation (more restrictive)
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/,
    
    // Custom phone validation (US numbers only)
    phone: /^\\+1[2-9]\\d{2}[2-9]\\d{2}\\d{4}$/
  }}
/>`}
              language="tsx"
              title="Custom schema validation"
            />
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> If no custom patterns are provided, the component uses
                default validation patterns. The email pattern uses standard email validation, and
                the phone pattern accepts international formats with optional formatting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Complete Integration Example</h2>
        <CodeBlock
          code={`import React from 'react';
import { UserMFAMgmt } from '@auth0/ui-components-react';
import { Auth0Provider } from '@auth0/auth0-react';
import { Auth0ComponentProvider } from '@auth0/ui-components-react';

function SecurityPage() {
  const handleMFAEnroll = () => {
    // Handle successful enrollment
    console.log('MFA factor enrolled successfully');
  };

  const handleMFADelete = () => {
    // Handle successful deletion
    console.log('MFA factor deleted successfully');
  };

  const handleError = (error, action) => {
    // Handle errors
    console.error(\`MFA \${action} error:\`, error);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Security Settings</h1>
        <p className="text-gray-600">
          Manage your multi-factor authentication settings
        </p>
      </div>
      
      <UserMFAMgmt
        onEnroll={handleMFAEnroll}
        onDelete={handleMFADelete}
        onErrorAction={handleError}
        factorConfig={{
          sms: { visible: true, enabled: true },
          totp: { visible: true, enabled: true },
          'webauthn-platform': { visible: true, enabled: true }
        }}
        customMessages={{
          title: 'Multi-Factor Authentication',
          description: 'Add extra security to your account'
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <Auth0Provider
      domain="your-domain.auth0.com"
      clientId="your-client-id"
      redirectUri={window.location.origin}
    >
      <Auth0ComponentProvider>
        <SecurityPage />
      </Auth0ComponentProvider>
    </Auth0Provider>
  );
}`}
          language="tsx"
          title="Complete implementation example"
        />
      </section>

      {/* Common Issues */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Common Issues</h2>
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Missing MFA Grant Types</h4>
            <p className="text-yellow-800 text-sm">
              If you see authentication errors, ensure MFA grant types are enabled in your Auth0
              application settings.
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">MFA Policies Not Configured</h4>
            <p className="text-yellow-800 text-sm">
              Configure MFA policies in your Auth0 Dashboard under Security → Multi-factor Auth for
              the component to work properly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
