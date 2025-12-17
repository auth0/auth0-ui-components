import CodeBlock from '../components/CodeBlock';
import TabbedCodeBlock from '../components/TabbedCodeBlock';

export default function UserMFA() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-700/10 rounded-xl"></div>
        <div
          className="relative space-y-4 p-6 border-l-4 border-gradient-to-b from-blue-600 to-purple-600"
          style={{ borderImage: 'linear-gradient(to bottom, rgb(37 99 235), rgb(147 51 234)) 1' }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full"></div>
            <span className="text-sm font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full flex items-center">
              <svg
                className="w-3 h-3 text-blue-600 mr-1.5"
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
              My Account
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
              BETA
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">UserMFAMgmt Component</h1>
          <p className="text-xl text-gray-600">
            A comprehensive Multi-Factor Authentication (MFA) management component for Auth0
            applications.
          </p>
        </div>
      </div>

      {/* Component preview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Component preview</h2>
        <div className="max-w-none flex justify-center">
          <img
            src="/img/my-account/UserMFAMgmt.png"
            alt="UserMFAMgmt Component"
            width={700}
            height={500}
          />
        </div>
      </section>

      {/* Setup Requirements */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Setup Requirements</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Auth0 Configuration Required
              </h3>
              <p className="text-blue-800 mb-4">
                Before using the <b>UserMFAMgmt</b> component, you need to configure your Auth0
                tenant with the proper applications, MFA settings, and permissions.
              </p>
              <p className="text-blue-800 mb-4">
                <strong>Complete setup guide:</strong>{' '}
                <a
                  href="/my-account"
                  className="text-blue-700 hover:text-blue-900 underline font-medium"
                >
                  My Account Components Introduction →
                </a>
              </p>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <h4 className="text-md font-medium text-blue-900 mb-2">
                  MFA-Specific Requirements
                </h4>
                <ul className="space-y-2 text-blue-800 text-sm list-disc list-inside">
                  <li>
                    <strong>Enable MFA Methods:</strong> In Auth0 Dashboard, go to Security →
                    Multi-factor Auth and enable the MFA methods you want to use (One-time Password,
                    Push Notification using Auth0 Guardian, Phone Message, Email, Recovery Code)
                  </li>
                </ul>
              </div>
            </div>
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
                {
                  label: 'npm',
                  code: 'npm install @auth0/universal-components-react',
                },
                {
                  label: 'pnpm',
                  code: 'pnpm add @auth0/universal-components-react',
                },
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
              If you're using Shadcn, you can add the UserMFAMgmt block directly to your project.
              You'll still need to install the core package separately:
            </p>
            <div className="space-y-3">
              <TabbedCodeBlock
                tabs={[
                  {
                    label: 'npm',
                    code: 'npm install @auth0/universal-components-core',
                  },
                  {
                    label: 'pnpm',
                    code: 'pnpm add @auth0/universal-components-core',
                  },
                ]}
                language="bash"
                title="1. Install Core Package"
              />
              <CodeBlock
                code="npx shadcn@latest add https://auth0-universal-components.vercel.app/r/my-account/user-mfa-management.json"
                language="bash"
                title="2. Add Shadcn Block"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Shadcn installs the React component source code in your{' '}
                <code>src/auth0-ui-components/</code> directory along with all UI dependencies, but
                you must install the core package separately via npm.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Basic Usage */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Basic Usage</h2>
        <CodeBlock
          code={`// For SPA applications:
import { UserMFAMgmt } from '@auth0/universal-components-react/spa';

// For Next.js/RWA applications:
// import { UserMFAMgmt } from '@auth0/universal-components-react/rwa';

// For shadcn users:
// import { UserMFAMgmt } from '@/auth0-ui-components/blocks/my-account/mfa/user-mfa-management';

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
                  schema
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
                  customMessages
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">Partial&lt;MFAMessages&gt;</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{}</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Custom messages object for i18n support
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  styling
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {'{'}variables?: CSSProperties; classes?: UserMFAMgmtClasses{'}'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Custom styling configuration for component theming and CSS classes
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

        {/* TypeScript Definitions */}
        <details className="mt-8 border-2 border-blue-200 rounded-lg overflow-hidden shadow-sm bg-blue-50">
          <summary className="cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 px-6 py-4 font-semibold text-gray-900 flex items-center justify-between transition-colors">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              <span className="text-lg">TypeScript Definitions</span>
            </div>
            <svg
              className="w-5 h-5 text-blue-600 transform transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          <div className="p-6 space-y-4 bg-white border-t-2 border-blue-100">
            <p className="text-gray-600">
              Complete TypeScript interface definitions for all prop types:
            </p>
            <CodeBlock
              code={`// Main component props interface
interface UserMFAMgmtProps {
  schema?: {
    email?: RegExp;
    phone?: RegExp;
  };
  customMessages?: Partial<MFAMessages>;
  styling?: ComponentStyling<UserMFAMgmtClasses>;
  readOnly?: boolean;
  hideHeader?: boolean;
  showActiveOnly?: boolean;
  disableEnroll?: boolean;
  disableDelete?: boolean;
  factorConfig?: Record<string, {
    visible?: boolean;
    enabled?: boolean;
  }>;
  onEnroll?: () => void;
  onDelete?: () => void;
  onFetch?: () => void;
  onErrorAction?: (error: Error, action: string) => void;
  onBeforeAction?: (action: string, factorType?: string) => boolean;
}

// Custom styling classes
interface UserMFAMgmtClasses {
  'UserMFAMgmt-card'?: string;
  'UserMFASetupForm-dialogContent'?: string;
  'DeleteFactorConfirmation-dialogContent'?: string;
}`}
              language="typescript"
              title="Complete TypeScript definitions"
            />
          </div>
        </details>
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
            <h3 className="text-lg font-medium mb-4">Custom Messages</h3>
            <p className="text-gray-600 mb-4">
              Customize all text and translations. All fields are optional and use defaults if not
              provided:
            </p>

            {/* Available Message Fields */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Available Message Fields</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <strong>General Messages</strong>
                  <ul className="ml-4 list-disc space-y-1 mt-2">
                    <li>
                      <code>title</code> - Component header title
                    </li>
                    <li>
                      <code>description</code> - Component description text
                    </li>
                    <li>
                      <code>no_active_mfa</code> - Message when no factors are enrolled
                    </li>
                    <li>
                      <code>enroll</code> - Enroll button text
                    </li>
                    <li>
                      <code>delete</code> - Delete button text
                    </li>
                    <li>
                      <code>enrolled</code> - Status text for enrolled factors
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>Action Messages</strong>
                  <ul className="ml-4 list-disc space-y-1 mt-2">
                    <li>
                      <code>enroll_factor</code> - Success message after enrollment
                    </li>
                    <li>
                      <code>remove_factor</code> - Success message after deletion
                    </li>
                    <li>
                      <code>delete_mfa_title</code> - Delete confirmation modal title
                    </li>
                    <li>
                      <code>delete_mfa_content</code> - Delete confirmation modal content
                    </li>
                    <li>
                      <code>cancel</code> - Cancel button text
                    </li>
                    <li>
                      <code>deleting</code> - Deleting in progress text
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>Factor-Specific Messages</strong>
                  <ul className="ml-4 list-disc space-y-1 mt-2">
                    <li>
                      <code>sms</code> - SMS factor title and description
                    </li>
                    <li>
                      <code>otp</code> - Authenticator app factor messages
                    </li>
                    <li>
                      <code>email</code> - Email factor messages
                    </li>
                    <li>
                      <code>push-notification</code> - Push notification messages
                    </li>
                    <li>
                      <code>webauthn-platform</code> - Platform authenticator messages
                    </li>
                    <li>
                      <code>webauthn-roaming</code> - Security key messages
                    </li>
                    <li>
                      <code>recovery-code</code> - Recovery code messages
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>Error Messages</strong>
                  <ul className="ml-4 list-disc space-y-1 mt-2">
                    <li>
                      <code>errors.factors_loading_error</code> - Factor loading error
                    </li>
                    <li>
                      <code>errors.delete_factor</code> - Factor deletion error
                    </li>
                    <li>
                      <code>errors.failed</code> - Generic failure message
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<UserMFAMgmt
  customMessages={{
    title: 'Manage Multi-Factor Authentication',
    description: 'Add extra layers of security to protect your account',
    no_active_mfa: 'You have not enrolled any MFA factors yet',
    enroll: 'Add Factor',
    enroll_factor: 'Factor successfully enrolled!',
    remove_factor: 'Factor successfully removed',
    delete_mfa_title: 'Remove MFA Factor?',
    delete_mfa_content: 'Are you sure you want to remove this factor? You will no longer be able to use it for authentication.',
    sms: {
      title: 'SMS Authentication',
      description: 'Receive verification codes via text message'
    },
    otp: {
      title: 'Authenticator App',
      description: 'Use apps like Google Authenticator or Authy'
    },
  }}
/>`}
              language="tsx"
              title="Custom messages example"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Custom Styling</h3>
            <p className="text-gray-600 mb-4">
              Customize appearance with CSS variables and classes. Supports theme-aware styling:
            </p>

            {/* Available Styling Options */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Available Styling Options</h4>
              <div className="space-y-4 text-sm text-blue-800">
                <div>
                  <strong>CSS Variables (styling.variables)</strong>
                  <ul className="ml-4 list-disc space-y-1 mt-2">
                    <li>
                      <code>common</code> - Variables applied to both light and dark modes
                    </li>
                    <li>
                      <code>light</code> - Variables specific to light mode
                    </li>
                    <li>
                      <code>dark</code> - Variables specific to dark mode
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>CSS Classes (styling.classes)</strong>
                  <ul className="ml-4 list-disc space-y-1 mt-2">
                    <li>
                      <code>UserMFAMgmt-card</code> - Main component card container
                    </li>
                    <li>
                      <code>UserMFASetupForm-dialogContent</code> - Enrollment dialog content
                    </li>
                    <li>
                      <code>DeleteFactorConfirmation-dialogContent</code> - Delete confirmation
                      dialog
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<UserMFAMgmt
  styling={{
    variables: {
      common: {
        '--font-size-title': '1.5rem',
      },
      light: {
        '--color-primary': '#2563eb',
        '--color-background': '#ffffff',
      },
      dark: {
        '--color-primary': '#3b82f6',
        '--color-background': '#1f2937',
      }
    },
    classes: {
      'UserMFAMgmt-card': 'shadow-2xl rounded-2xl border-2 p-8',
      'UserMFASetupForm-dialogContent': 'max-w-2xl',
      'DeleteFactorConfirmation-dialogContent': 'max-w-md'
    }
  }}
/>`}
              language="tsx"
              title="Custom styling example"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Schema Validation</h3>
            <p className="text-gray-600 mb-4">
              Set up custom validation rules with the <code>schema</code> prop. All fields are
              optional and override defaults:
            </p>

            {/* Available Schema Fields */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Available Schema Fields</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <strong>email</strong> - Email address validation
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>RegExp</code> - Custom regex pattern
                    </li>
                    <li>Default pattern validates standard email format</li>
                    <li>Used for email-based MFA enrollment</li>
                  </ul>
                </div>
                <div>
                  <strong>phone</strong> - Phone number validation
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>RegExp</code> - Custom regex pattern
                    </li>
                    <li>Default pattern accepts international formats</li>
                    <li>Used for SMS-based MFA enrollment</li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<UserMFAMgmt
  schema={{
    // Custom email validation (more restrictive)
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/,
    
    // Custom phone validation (US numbers only)
    phone: /^\\+1[2-9]\\d{2}[2-9]\\d{2}\\d{4}$/
  }}
/>`}
              language="tsx"
              title="Schema validation example"
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
import { UserMFAMgmt, Auth0ComponentProvider } from '@auth0/universal-components-react/spa';
import { Auth0Provider } from '@auth0/auth0-react';

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
  const authDetails = {
    domain: "your-domain.auth0.com",
    clientId: "your-client-id"
  };
  return (
    <Auth0Provider
      {...authDetails}
      redirectUri={window.location.origin}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
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
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Missing MFA Grant Types</h4>
            <p className="text-gray-700 text-sm">
              If you see authentication errors, ensure MFA grant types are enabled in your Auth0
              application settings.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">MFA Policies Not Configured</h4>
            <p className="text-gray-700 text-sm">
              Configure MFA policies in your Auth0 Dashboard under Security → Multi-factor Auth for
              the component to work properly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
