import CodeBlock from '../components/CodeBlock';
import TabbedCodeBlock from '../components/TabbedCodeBlock';

export default function UserPasskeyMgmtDocs() {
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
          <h1 className="text-4xl font-bold text-gray-900">UserPasskeyMgmt Component</h1>
          <p className="text-xl text-gray-600">
            A passkey management component that lets users enroll, rename, and revoke WebAuthn
            passkeys on their account.
          </p>
        </div>
      </div>

      {/* Component preview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Component preview</h2>
        <div className="max-w-none flex justify-center">
          <img
            src="/img/my-account/UserPasskeyMgmt.png"
            alt="UserPasskeyMgmt Component"
            width={700}
            height={171}
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
                Before using the <b>UserPasskeyMgmt</b> component, you need to configure your Auth0
                tenant with the proper applications and permissions.
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
                  Passkey-Specific Requirements
                </h4>
                <ul className="space-y-2 text-blue-800 text-sm list-disc list-inside">
                  <li>
                    <strong>Enable Passkeys:</strong> In Auth0 Dashboard, go to Security →
                    Passwordless and enable Passkeys for your application. See the{' '}
                    <a
                      href="https://auth0.com/docs/authenticate/database-connections/passkeys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-900"
                    >
                      Auth0 Passkeys guide →
                    </a>
                  </li>
                  <li>
                    <strong>Configure Passkey Policy:</strong> Set up your passkey policy (user
                    verification, fallback options) in the Auth0 Dashboard. See{' '}
                    <a
                      href="https://auth0.com/docs/authenticate/database-connections/passkeys/configure-passkey-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-900"
                    >
                      Configure Passkey Policy →
                    </a>
                  </li>
                  <li>
                    <strong>Custom Domain:</strong> A custom domain must be configured in the Auth0
                    Dashboard under Branding → Custom Domains. Passkeys are bound to a{' '}
                    <a
                      href="https://www.w3.org/TR/webauthn/#relying-party-identifier"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-900"
                    >
                      Relying Party ID
                    </a>{' '}
                    — Auth0 sets this to your custom domain (e.g. <code>acme.org</code>). Without a
                    custom domain, passkey enrollment will fail.
                  </li>
                  <li>
                    <strong>Relying Party:</strong> The RP ID must match the domain your app is
                    served from. If your custom domain is <code>acme.org</code>, your app must be
                    hosted on <code>acme.org</code> or a subdomain of it (e.g.{' '}
                    <code>app.acme.org</code>) for the browser to accept the passkey.
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

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Option 2: Shadcn CLI</h3>
            <p className="text-gray-600 mb-4">
              If you're using Shadcn, you can add the UserPasskeyMgmt block directly to your
              project:
            </p>
            <CodeBlock
              code="npx shadcn@latest add @auth0/user-passkey-management"
              language="bash"
              title="Add Shadcn Block"
            />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This installs the React component source code in your{' '}
                <code>src/components/auth0/</code> directory along with all UI dependencies and the
                core package.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Basic Usage */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Basic Usage</h2>
        <CodeBlock
          code={`// For SPA/Next.js/RWA applications:
import { UserPasskeyMgmt } from '@auth0/universal-components-react';

// For shadcn users:
// import { UserPasskeyMgmt } from '@/components/auth0/my-account/user-passkey-management';

export function SecurityPage() {
  return (
    <div>
      <h1>Security Settings</h1>
      <UserPasskeyMgmt />
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
                <td className="px-4 py-2 text-sm text-gray-500">Partial&lt;PasskeyMessages&gt;</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{'{}'}</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Custom messages for i18n overrides
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  styling
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {'{'} variables?: CSSProperties; classes?: UserPasskeyMgmtClasses {'}'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Custom styling configuration for component theming and CSS classes
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  hideHeader
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">boolean</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">false</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Whether to hide the page header (title + description)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  addAction
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">ComponentAction&lt;void&gt;</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Lifecycle hooks for the add passkey action. Set <code>disabled: true</code> to
                  hide the add button
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  revokeAction
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">ComponentAction&lt;Passkey&gt;</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Lifecycle hooks for the revoke passkey action. Set <code>disabled: true</code> to
                  hide the revoke option
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  renameAction
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  ComponentAction&lt;Passkey, string&gt;
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Lifecycle hooks for the rename passkey action. Set <code>disabled: true</code> to
                  hide the rename option
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  onFetch
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">() =&gt; void</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Callback fired after passkeys are successfully loaded
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  onErrorAction
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  (error: Error, action: 'add' | 'rename' | 'revoke') =&gt; void
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Callback fired when an action fails
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
              code={`interface UserPasskeyMgmtProps {
  customMessages?: Partial<PasskeyMessages>;
  styling?: ComponentStyling<UserPasskeyMgmtClasses>;
  hideHeader?: boolean;
  addAction?: ComponentAction<void>;
  revokeAction?: ComponentAction<Passkey>;
  renameAction?: ComponentAction<Passkey, string>;
  onFetch?: () => void;
  onErrorAction?: (error: Error, action: 'add' | 'rename' | 'revoke') => void;
}

interface Passkey {
  id: string;
  name?: string;
  createdAt?: string;
  lastUsedAt?: string;
  deviceInfo?: string;
}

interface UserPasskeyMgmtClasses {
  'UserPasskeyMgmt-root'?: string;
  'UserPasskeyMgmt-item'?: string;
  'PasskeyActionModal-modalContent'?: string;
}

// ComponentAction provides before/after hooks and a disabled flag
interface ComponentAction<TResult, TArg = void> {
  disabled?: boolean;
  onBefore?: (arg: TArg) => boolean | Promise<boolean>;
  onAfter?: (result: TResult) => void;
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
            <h3 className="text-lg font-medium mb-4">Event Callbacks</h3>
            <p className="text-gray-600 mb-4">
              React to passkey lifecycle events using <code>addAction</code>,{' '}
              <code>revokeAction</code>, and <code>renameAction</code>:
            </p>
            <CodeBlock
              code={`<UserPasskeyMgmt
  addAction={{
    onAfter: () => console.log('Passkey added'),
  }}
  revokeAction={{
    onAfter: (passkey) => console.log('Revoked:', passkey.name),
  }}
  renameAction={{
    onAfter: (passkey, newName) => console.log('Renamed to:', newName),
  }}
  onFetch={() => console.log('Passkeys loaded')}
  onErrorAction={(error, action) => {
    console.error(\`Error during \${action}:\`, error);
  }}
/>`}
              language="tsx"
              title="Event callback handlers"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Disabling Actions</h3>
            <p className="text-gray-600 mb-4">
              Use the <code>disabled</code> flag on each action to hide the corresponding UI
              controls:
            </p>
            <CodeBlock
              code={`// Read-only: hide add and revoke, keep rename
<UserPasskeyMgmt
  addAction={{ disabled: true }}
  revokeAction={{ disabled: true }}
/>`}
              language="tsx"
              title="Disabling add and revoke"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Custom Messages</h3>
            <p className="text-gray-600 mb-4">
              Customize all visible text. All fields are optional and fall back to defaults:
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Available Message Fields</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <strong>General</strong>
                  <ul className="ml-4 list-disc space-y-1 mt-2">
                    <li>
                      <code>header.title</code> - Page header title
                    </li>
                    <li>
                      <code>header.description</code> - Page header description
                    </li>
                    <li>
                      <code>section_title</code> - Card section title
                    </li>
                    <li>
                      <code>enabled</code> - Badge label when passkeys exist
                    </li>
                    <li>
                      <code>no_passkeys</code> - Empty state message
                    </li>
                    <li>
                      <code>add_passkey</code> - Add button label
                    </li>
                    <li>
                      <code>created_at</code> - Created date label (use {'${date}'})
                    </li>
                    <li>
                      <code>last_used</code> - Last used date label (use {'${date}'})
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>Actions & Modals</strong>
                  <ul className="ml-4 list-disc space-y-1 mt-2">
                    <li>
                      <code>actions.rename</code> - Rename menu item label
                    </li>
                    <li>
                      <code>actions.revoke</code> - Revoke menu item label
                    </li>
                    <li>
                      <code>success.add</code> - Success toast after add
                    </li>
                    <li>
                      <code>success.rename</code> - Success toast after rename
                    </li>
                    <li>
                      <code>success.revoke</code> - Success toast after revoke
                    </li>
                    <li>
                      <code>modals.rename.*</code> - Rename modal strings
                    </li>
                    <li>
                      <code>modals.revoke.*</code> - Revoke confirmation strings
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<UserPasskeyMgmt
  customMessages={{
    header: {
      title: 'Login Methods',
      description: 'Manage your passkeys and other sign-in options.',
    },
    section_title: 'Passkeys',
    no_passkeys: 'No passkeys registered yet.',
    add_passkey: 'Add a passkey',
    success: {
      add: 'Passkey registered successfully.',
      revoke: 'Passkey removed.',
    },
    modals: {
      revoke: {
        title: 'Remove passkey?',
        consent: 'This will permanently remove <bold>\${name}</bold>.',
        cancel: 'Cancel',
        confirm: 'Remove',
      },
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
              Customize appearance with CSS variables and Tailwind class overrides:
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Available CSS Classes</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <ul className="ml-4 list-disc space-y-1">
                  <li>
                    <code>UserPasskeyMgmt-root</code> — outer card container
                  </li>
                  <li>
                    <code>UserPasskeyMgmt-item</code> — individual passkey row card
                  </li>
                  <li>
                    <code>PasskeyActionModal-modalContent</code> — rename / revoke modal content
                  </li>
                </ul>
              </div>
            </div>

            <CodeBlock
              code={`<UserPasskeyMgmt
  styling={{
    variables: {
      common: {
        '--font-size-body': '0.875rem',
      },
      light: {
        '--color-primary': '#2563eb',
      },
      dark: {
        '--color-primary': '#3b82f6',
      },
    },
    classes: {
      'UserPasskeyMgmt-root': 'shadow-xl border-2',
      'UserPasskeyMgmt-item': 'rounded-xl border border-gray-200',
    },
  }}
/>`}
              language="tsx"
              title="Custom styling example"
            />
          </div>
        </div>
      </section>

      {/* Integration Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Complete Integration Example</h2>
        <CodeBlock
          code={`import { UserPasskeyMgmt } from '@auth0/universal-components-react';
import { Auth0ComponentProvider } from '@auth0/universal-components-react/spa';
import { Auth0Provider } from '@auth0/auth0-react';

function SecurityPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <UserPasskeyMgmt
        addAction={{
          onAfter: () => {
            // e.g. refresh session, show confirmation
            console.log('Passkey enrolled');
          },
        }}
        revokeAction={{
          onAfter: (passkey) => {
            console.log('Revoked passkey:', passkey.id);
          },
        }}
        onErrorAction={(error, action) => {
          console.error(\`Passkey \${action} failed:\`, error.message);
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
      authorizationParams={{ redirect_uri: window.location.origin }}
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
            <h4 className="font-medium text-gray-900 mb-2">Passkeys not available</h4>
            <p className="text-gray-700 text-sm">
              WebAuthn requires a secure origin. Ensure your app is served over HTTPS (or localhost
              for development). The browser must also support the Web Authentication API.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Enrollment fails with 400</h4>
            <p className="text-gray-700 text-sm">
              Ensure passkeys are enabled in your Auth0 Dashboard under Security → Passwordless and
              that the My Account API scopes include <code>create:authentication_methods</code> and{' '}
              <code>update:authentication_methods</code>.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Empty passkey list</h4>
            <p className="text-gray-700 text-sm">
              Verify the My Account API scope includes <code>read:authentication_methods</code>.
              Check the network tab to confirm the list API is returning passkey-typed entries.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              "The relying party ID is not a registrable domain suffix of, nor equal to the current
              domain"
            </h4>
            <p className="text-gray-700 text-sm mb-2">
              The browser enforces that the Relying Party ID must be equal to or a registrable
              domain suffix of the page's origin. This error means your app's domain doesn't match
              the RP ID Auth0 configured on your custom domain.
            </p>
            <ul className="text-gray-700 text-sm list-disc list-inside space-y-1">
              <li>
                Ensure your Auth0 custom domain (e.g. <code>acme.org</code>) matches the domain your
                app is served from, or is a parent domain of it (e.g. <code>app.acme.org</code>).
              </li>
              <li>
                If Auth0 fails to fetch the <code>.well-known/webauthn</code> resource from your
                claimed RP ID, verify that your custom domain is fully active and DNS is propagated
                in the Auth0 Dashboard under Branding → Custom Domains.
              </li>
              <li>
                Do not test passkey enrollment from a different origin (e.g. <code>localhost</code>{' '}
                or a tunnel domain that doesn't match the RP ID).
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
