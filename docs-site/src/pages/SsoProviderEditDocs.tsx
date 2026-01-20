import CodeBlock from '../components/CodeBlock';
import TabbedCodeBlock from '../components/TabbedCodeBlock';

export default function SsoProviderEditDocs() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-cyan-700/10 rounded-xl"></div>
        <div
          className="relative space-y-4 p-6 border-l-4 border-gradient-to-b from-emerald-600 to-teal-600"
          style={{ borderImage: 'linear-gradient(to bottom, rgb(5 150 105), rgb(15 118 110)) 1' }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full"></div>
            <span className="text-sm font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full flex items-center">
              <svg
                className="w-3 h-3 text-emerald-600 mr-1.5"
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
              My Organization
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
              BETA
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">SsoProviderEdit Component</h1>
          <p className="text-xl text-gray-600">
            Comprehensive SSO provider management: configure authentication settings, enable
            provisioning with SCIM tokens, manage domain associations, and control provider
            lifecycle — all in a tabbed interface.
          </p>
        </div>
      </div>
      {/* Component Preview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Component Preview</h2>
        <div className="max-w-none flex justify-center">
          <img
            src="/img/my-organization/idp-management/sso-provider-edit.png"
            alt="SsoProviderEdit"
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
                Before using the <b>SsoProviderEdit</b> component, ensure your tenant is configured
                with the proper APIs, applications, and permissions.
              </p>
              <p className="text-blue-800">
                <strong>Setup guide:</strong>{' '}
                <a
                  href="/my-organization"
                  className="text-blue-700 hover:text-blue-900 underline font-medium"
                >
                  My Organization Components Introduction →
                </a>
              </p>
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
              If you're using Shadcn, you can add the SsoProviderEdit block directly to your
              project. You'll still need to install the core package separately:
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
                code="npx shadcn@latest add https://auth0-universal-components.vercel.app/r/my-organization/sso-provider-edit.json"
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
import { SsoProviderEdit } from '@auth0/universal-components-react/spa';

// For Next.js/RWA applications:
// import { SsoProviderEdit } from '@auth0/universal-components-react/rwa';

// For shadcn users:
// import { SsoProviderEdit } from '@/auth0-ui-components/blocks/my-organization/idp-management/sso-provider-edit';
import { useNavigate } from 'react-router-dom';

export function ProviderEditPage({ providerId }: { providerId: string }) {
  const navigate = useNavigate();

  return (
    <div>
      <SsoProviderEdit
        providerId={providerId}
        backButton={{
          onClick: () => navigate('/providers')
        }}
        sso={{
          delete: {},
          removeFromOrganization: {}
        }}
      />
    </div>
  );
}`}
          language="tsx"
          title="Basic implementation"
        />
      </section>
      {/* Props Overview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Props</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                  Prop
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                  Default
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[40%]">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  customMessages
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  Partial&lt;SsoProvideEditMessages&gt;
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{'{}'}</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Custom messages object for internationalization support
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  styling
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  ComponentStyling&lt;SsoProviderEditClasses&gt;
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {'{ variables: {}, classes: {} }'}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Custom styling variables and CSS classes
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  schema
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  SsoProviderEditSchema
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Schema configuration for provider, provisioning, and domains tabs
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  hideHeader
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  boolean
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">false</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Whether to hide the header section with provider name and toggle
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  providerId
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  string
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  The unique identifier of the SSO provider to edit (required)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  backButton
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  BackButton
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for the back button in the header
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  sso
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  SsoProviderTabEditProps
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for the SSO tab including update, delete, and removeFromOrganization
                  actions
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  provisioning
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  SsoProvisioningTabEditProps
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for the Provisioning tab including SCIM token management actions
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  domains
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  SsoDomainsTabEditProps
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for domain management in the domains tab
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
interface SsoProviderEditProps {
  customMessages?: Partial<SsoProviderEditMessages>;
  styling?: ComponentStyling<SsoProviderEditClasses>;
  schema?: SsoProviderEditSchema;
  hideHeader?: boolean;
  providerId: string;
  backButton?: {
    icon?: LucideIcon;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  };
  sso?: {
    updateAction?: ComponentAction<IdentityProvider, IdentityProvider>;
    deleteAction?: ComponentAction<IdentityProvider>;
    removeFromOrganizationAction?: ComponentAction<IdentityProvider>;
  };
  provisioning?: {
    createAction?: ComponentAction<
      IdentityProvider,
      CreateIdPProvisioningConfigResponseContent
    >;
    deleteAction?: ComponentAction<IdentityProvider>;
    createScimTokenAction?: ComponentAction<
      IdentityProvider,
      CreateIdpProvisioningScimTokenResponseContent
    >;
    deleteScimTokenAction?: ComponentAction<IdentityProvider>;
  };
  domains?: {
    createAction?: ComponentAction<Domain>;
    verifyAction?: ComponentAction<Domain>;
    deleteAction?: ComponentAction<Domain>;
    associateToProviderAction?: ComponentAction<Domain, IdentityProvider | null>;
    deleteFromProviderAction?: ComponentAction<Domain, IdentityProvider | null>;
  };
}

// Action interface
interface ComponentAction<T, U = undefined> {
  disabled?: boolean;
  onBefore?: (data: T, extra?: U) => boolean | Promise<boolean>;
  onAfter?: (data: T, extra?: U) => void | Promise<void>;
}`}
              language="typescript"
              title="Complete TypeScript definitions"
            />
          </div>
        </details>
      </section>{' '}
      <hr />
      {/* Advanced Configuration */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Advanced Configuration</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Actions</h3>
            <p className="text-gray-600 mb-4">
              Handle provider events with lifecycle callbacks. Actions are organized by tab. All
              action properties are optional:
            </p>

            {/* Available Action Options */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Available Action Properties</h4>

              {/* SSO Tab Actions */}
              <div className="mb-6">
                <h5 className="font-semibold text-blue-900 mb-3">SSO Tab Actions (sso prop)</h5>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <h6 className="font-semibold mb-2">sso.updateAction</h6>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        <code>disabled</code> – Disable provider updates
                      </li>
                      <li>
                        <code>onBefore</code> – Validate before updating (can cancel)
                      </li>
                      <li>
                        <code>onAfter</code> – Handle post-update actions (analytics, notifications)
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-semibold mb-2">sso.deleteAction</h6>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        <code>disabled</code> – Disable provider deletion
                      </li>
                      <li>
                        <code>onBefore</code> – Confirm or validate before deleting (can cancel)
                      </li>
                      <li>
                        <code>onAfter</code> – Handle post-deletion actions (redirect, cleanup)
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-semibold mb-2">sso.deleteFromOrganizationAction</h6>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        <code>disabled</code> – Disable provider removal from organization
                      </li>
                      <li>
                        <code>onBefore</code> – Confirm or validate before removing (can cancel)
                      </li>
                      <li>
                        <code>onAfter</code> – Handle post-removal actions (redirect, notifications)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Provisioning Tab Actions */}
              <div className="mb-6">
                <h5 className="font-semibold text-blue-900 mb-3">
                  Provisioning Tab Actions (provisioning prop)
                </h5>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <h6 className="font-semibold mb-2">provisioning.createAction</h6>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        <code>disabled</code> – Disable provisioning creation
                      </li>
                      <li>
                        <code>onBefore</code> – Validate before creating provisioning (can cancel)
                      </li>
                      <li>
                        <code>onAfter</code> – Handle post-creation actions (analytics, setup
                        wizard)
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-semibold mb-2">provisioning.deleteAction</h6>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        <code>disabled</code> – Disable provisioning deletion
                      </li>
                      <li>
                        <code>onBefore</code> – Confirm or validate before deleting (can cancel)
                      </li>
                      <li>
                        <code>onAfter</code> – Handle post-deletion actions (cleanup, notifications)
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-semibold mb-2">provisioning.createScimTokenAction</h6>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        <code>disabled</code> – Disable SCIM token creation
                      </li>
                      <li>
                        <code>onBefore</code> – Validate before creating token (can cancel)
                      </li>
                      <li>
                        <code>onAfter</code> – Handle post-creation actions (copy token, show guide)
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-semibold mb-2">provisioning.deleteScimTokenAction</h6>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        <code>disabled</code> – Disable SCIM token deletion
                      </li>
                      <li>
                        <code>onBefore</code> – Confirm or validate before deleting (can cancel)
                      </li>
                      <li>
                        <code>onAfter</code> – Handle post-deletion actions (notifications, cleanup)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Domains Tab Actions */}
              <div>
                <h5 className="font-semibold text-blue-900 mb-3">
                  Domains Tab Actions (domains prop)
                </h5>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <h6 className="font-semibold mb-2">domains.createAction</h6>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        <code>disabled</code> – Disable domain creation
                      </li>
                      <li>
                        <code>onBefore</code> – Validate before creating domain (can cancel)
                      </li>
                      <li>
                        <code>onAfter</code> – Handle post-creation actions (analytics,
                        notifications)
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-semibold mb-2">domains.verifyAction</h6>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        <code>disabled</code> – Disable domain verification
                      </li>
                      <li>
                        <code>onBefore</code> – Validate before verifying (can cancel)
                      </li>
                      <li>
                        <code>onAfter</code> – Handle post-verification actions
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-semibold mb-2">domains.deleteAction</h6>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        <code>disabled</code> – Disable domain deletion
                      </li>
                      <li>
                        <code>onBefore</code> – Confirm before deleting (can cancel)
                      </li>
                      <li>
                        <code>onAfter</code> – Handle post-deletion actions (cleanup)
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-semibold mb-2">domains.associateToProviderAction</h6>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        <code>disabled</code> – Disable associating domains to provider
                      </li>
                      <li>
                        <code>onBefore</code> – Validate before associating (can cancel)
                      </li>
                      <li>
                        <code>onAfter</code> – Handle post-association actions
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-semibold mb-2">domains.deleteFromProviderAction</h6>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        <code>disabled</code> – Disable removing domains from provider
                      </li>
                      <li>
                        <code>onBefore</code> – Confirm before removing (can cancel)
                      </li>
                      <li>
                        <code>onAfter</code> – Handle post-removal actions
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-2 bg-blue-100 rounded text-xs text-blue-700">
                <b>💡 Tip:</b> <code>onBefore</code> hooks can return <code>false</code> to cancel
                the action
              </div>
            </div>

            <CodeBlock
              code={`<SsoProviderEdit
  providerId={providerId}
  sso={{
    deleteAction: {
      onBefore: (provider) => confirm('Delete ' + provider.name + '?'),
      onAfter: (provider) => {
        // Track provider delete event 
        analytics.track('Provider Deleted', {
          providerId: provider.id,
        });
        navigate('/providers');
      }
    },
  }}
  provisioning={{
    createAction: {
      onBefore: (provider) => !!provider.id,
      onAfter: (provider, config) => console.log('Provisioning enabled', config)
    },
  }}
/>`}
              language="tsx"
              title="Action hook usage"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Custom Messages</h3>
            <p className="text-gray-600 mb-4">
              Customize all text and translations. All fields are optional and use defaults if not
              provided:
            </p>

            {/* Available Messages */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">SsoProviderEditMessages Structure</h4>
              <div className="space-y-4 text-sm text-blue-800">
                <div>
                  <h5 className="font-semibold mb-2">Header</h5>
                  <ul className="space-y-1 list-disc list-inside ml-2">
                    <li>
                      <code>header.back_button_text</code> – Back button text
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold mb-2">SSO Tab</h5>
                  <ul className="space-y-1 list-disc list-inside ml-2">
                    <li>
                      <code>tabs.sso.name</code> – Tab label
                    </li>
                    <li>
                      <code>tabs.sso.content.alert.warning</code> – Warning alert
                    </li>
                    <li>
                      <code>tabs.sso.content.alert.error</code> – Error alert
                    </li>
                    <li>
                      <code>tabs.sso.content.details.submit_button_label</code> – Save button
                    </li>
                    <li>
                      <code>tabs.sso.content.details.unsaved_changes_text</code> – Unsaved warning
                    </li>
                    <li>
                      <code>tabs.sso.content.details.details_fields.title</code> – Section title
                    </li>
                    <li>
                      <code>tabs.sso.content.details.details_fields.description</code> – Section
                      description
                    </li>
                    <li>
                      <code>tabs.sso.content.details.details_fields.fields.name.*</code> – Name
                      field (label, placeholder, helper_text, error)
                    </li>
                    <li>
                      <code>tabs.sso.content.details.details_fields.fields.display_name.*</code> –
                      Display name field
                    </li>
                    <li>
                      <code>tabs.sso.content.details.configure_fields.okta.*</code> – Okta
                      configuration fields (domain, client_id, client_secret, icon_url,
                      callback_url)
                    </li>
                    <li>
                      <code>tabs.sso.content.details.configure_fields.adfs.*</code> – ADFS
                      configuration fields (meta_data_source, meta_data_url, etc.)
                    </li>
                    <li>
                      <code>tabs.sso.content.details.configure_fields['google-apps'].*</code> –
                      Google Workspace fields
                    </li>
                    <li>
                      <code>tabs.sso.content.delete.title</code> – Delete button label
                    </li>
                    <li>
                      <code>tabs.sso.content.delete.description</code> – Delete description
                    </li>
                    <li>
                      <code>tabs.sso.content.delete.delete_button_label</code> – Delete action
                      button
                    </li>
                    <li>
                      <code>tabs.sso.content.delete.modal.title</code> – Delete modal title
                    </li>
                    <li>
                      <code>tabs.sso.content.delete.modal.description</code> – Delete modal
                      description
                    </li>
                    <li>
                      <code>tabs.sso.content.delete.modal.content.description</code> – Modal content
                      description
                    </li>
                    <li>
                      <code>tabs.sso.content.delete.modal.content.field.label</code> – Confirmation
                      field label
                    </li>
                    <li>
                      <code>tabs.sso.content.delete.modal.content.field.placeholder</code> –
                      Confirmation placeholder
                    </li>
                    <li>
                      <code>tabs.sso.content.delete.modal.actions.cancel_button_label</code> –
                      Cancel button
                    </li>
                    <li>
                      <code>tabs.sso.content.delete.modal.actions.delete_button_label</code> –
                      Confirm delete button
                    </li>
                    <li>
                      <code>tabs.sso.content.remove.title</code> – Remove button label
                    </li>
                    <li>
                      <code>tabs.sso.content.remove.description</code> – Remove description
                    </li>
                    <li>
                      <code>tabs.sso.content.remove.remove_button_label</code> – Remove action
                      button
                    </li>
                    <li>
                      <code>tabs.sso.content.remove.modal.*</code> – Remove modal (same structure as
                      delete modal)
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold mb-2">Provisioning Tab</h5>
                  <ul className="space-y-1 list-disc list-inside ml-2">
                    <li>
                      <code>tabs.provisioning.name</code> – Tab label
                    </li>
                    <li>
                      <code>tabs.provisioning.content.header.title</code> – Header title
                    </li>
                    <li>
                      <code>tabs.provisioning.content.header.description</code> – Header description
                    </li>
                    <li>
                      <code>tabs.provisioning.content.header.guided_setup_button_label</code> –
                      Setup button
                    </li>
                    <li>
                      <code>tabs.provisioning.content.header.enable_provisioning_tooltip</code> –
                      Tooltip text
                    </li>
                    <li>
                      <code>tabs.provisioning.content.warning_alert_message.title</code> – Warning
                      title
                    </li>
                    <li>
                      <code>tabs.provisioning.content.warning_alert_message.description</code> –
                      Warning description
                    </li>
                    <li>
                      <code>tabs.provisioning.content.save_button_label</code> – Save button
                    </li>
                    <li>
                      <code>tabs.provisioning.content.unsaved_changes_text</code> – Unsaved warning
                    </li>
                    <li>
                      <code>tabs.provisioning.content.details.manage_tokens.title</code> – Token
                      section title
                    </li>
                    <li>
                      <code>tabs.provisioning.content.details.manage_tokens.description</code> –
                      Token description
                    </li>
                    <li>
                      <code>
                        tabs.provisioning.content.details.manage_tokens.generate_button_label
                      </code>{' '}
                      – Generate button
                    </li>
                    <li>
                      <code>tabs.provisioning.content.details.manage_tokens.empty_state.*</code> –
                      Empty state (title, description)
                    </li>
                    <li>
                      <code>tabs.provisioning.content.details.manage_tokens.table.*</code> – Table
                      headers (token_id_label, created_label, expires_label, actions_label)
                    </li>
                    <li>
                      <code>
                        tabs.provisioning.content.details.manage_tokens.create_modal.title
                      </code>{' '}
                      – Create modal title
                    </li>
                    <li>
                      <code>tabs.provisioning.content.details.manage_tokens.delete_modal.*</code> –
                      Delete modal (title, cancel_button_label, delete_button_label)
                    </li>
                    <li>
                      <code>tabs.provisioning.content.details.fields.user_id_attribute.*</code> –
                      User ID field (label, placeholder, helper_text, error)
                    </li>
                    <li>
                      <code>tabs.provisioning.content.details.fields.scim_endpoint_url.*</code> –
                      SCIM endpoint field
                    </li>
                    <li>
                      <code>tabs.provisioning.content.details.mappings.title</code> – Mappings title
                    </li>
                    <li>
                      <code>tabs.provisioning.content.details.mappings.description</code> – Mappings
                      description
                    </li>
                    <li>
                      <code>tabs.provisioning.content.details.mappings.card.*</code> – Mappings card
                      (title, description, table columns)
                    </li>
                    <li>
                      <code>tabs.provisioning.content.delete.modal.title</code> – Delete modal title
                    </li>
                    <li>
                      <code>tabs.provisioning.content.delete.modal.content.description</code> –
                      Delete modal description
                    </li>
                    <li>
                      <code>tabs.provisioning.content.delete.modal.actions.*</code> – Delete modal
                      actions (cancel_button_label, delete_button_label)
                    </li>
                    <li>
                      <code>tabs.provisioning.content.notifications.*</code> – Notification messages
                      (delete_success, remove_success, update_success, general_error,
                      provisioning_disabled_success, scim_token_delete_sucess)
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold mb-2">Domains Tab</h5>
                  <ul className="space-y-1 list-disc list-inside ml-2">
                    <li>
                      <code>tabs.domains.name</code> – Tab label
                    </li>
                    <li>
                      <code>tabs.domains.content.title</code> – Section title
                    </li>
                    <li>
                      <code>tabs.domains.content.description</code> – Section description
                    </li>
                    <li>
                      <code>tabs.domains.content.create_button_text</code> – Create button
                    </li>
                    <li>
                      <code>tabs.domains.content.table.empty_message</code> – Empty state message
                    </li>
                    <li>
                      <code>tabs.domains.content.table.columns.name</code> – Name column header
                    </li>
                    <li>
                      <code>tabs.domains.content.table.columns.status</code> – Status column header
                    </li>
                    <li>
                      <code>tabs.domains.content.table.columns.verify</code> – Verify column header
                    </li>
                    <li>
                      <code>tabs.domains.content.table.domain_statuses.pending</code> – Pending
                      status label
                    </li>
                    <li>
                      <code>tabs.domains.content.table.domain_statuses.verified</code> – Verified
                      status label
                    </li>
                    <li>
                      <code>tabs.domains.content.table.domain_statuses.failed</code> – Failed status
                      label
                    </li>
                    <li>
                      <code>tabs.domains.content.domain_create.modal.title</code> – Create modal
                      title
                    </li>
                    <li>
                      <code>tabs.domains.content.domain_create.modal.field.*</code> – Create field
                      (label, placeholder, error)
                    </li>
                    <li>
                      <code>tabs.domains.content.domain_create.modal.actions.*</code> – Create
                      actions (cancel_button_text, create_button_text)
                    </li>
                    <li>
                      <code>tabs.domains.content.domain_verify.modal.title</code> – Verify modal
                      title
                    </li>
                    <li>
                      <code>tabs.domains.content.domain_verify.modal.txt_record_name.*</code> – TXT
                      record name (label, description)
                    </li>
                    <li>
                      <code>tabs.domains.content.domain_verify.modal.txt_record_content.*</code> –
                      TXT record content
                    </li>
                    <li>
                      <code>tabs.domains.content.domain_verify.modal.verification_status.*</code> –
                      Verification status (label, description, pending)
                    </li>
                    <li>
                      <code>tabs.domains.content.domain_verify.modal.actions.*</code> – Verify
                      actions (verify_button_text, delete_button_text, done_button_text)
                    </li>
                    <li>
                      <code>
                        tabs.domains.content.domain_verify.modal.errors.verification_failed
                      </code>{' '}
                      – Verification error
                    </li>
                    <li>
                      <code>tabs.domains.content.domain_delete.modal.title</code> – Delete modal
                      title
                    </li>
                    <li>
                      <code>tabs.domains.content.domain_delete.modal.description.pending</code> –
                      Delete description for pending
                    </li>
                    <li>
                      <code>tabs.domains.content.domain_delete.modal.description.verified</code> –
                      Delete description for verified
                    </li>
                    <li>
                      <code>tabs.domains.content.domain_delete.modal.actions.*</code> – Delete
                      actions (cancel_button_text, create_button_text)
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<SsoProviderEdit
  providerId={providerId}
  customMessages={{
    header: {
      back_button_text: 'Back to Providers'
    },
    tabs: {
      sso: {
        name: 'Authentication',
        content: {
          alert: {
            warning: 'Changes may affect user authentication',
            error: 'Failed to load provider configuration'
          },
          details: {
            submit_button_label: 'Save Configuration',
            unsaved_changes_text: 'You have unsaved changes',
            details_fields: {
              title: 'Provider Details',
              description: 'Configure basic provider information',
            },
          },
        }
      },
      provisioning: {
        name: 'User Provisioning',
        content: {
          header: {
            title: 'Provisioning Configuration',
            description: 'Manage user provisioning settings',
            guided_setup_button_label: 'Setup Guide',
            enable_provisioning_tooltip: 'Enable to sync users'
          },
        }
      },
    }
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
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <strong>variables</strong> - Custom CSS variables
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>common?: Record&lt;string, string&gt;</code> - Common
                    </li>
                    <li>
                      <code>light?: Record&lt;string, string&gt;</code> - Light mode only
                    </li>
                    <li>
                      <code>dark?: Record&lt;string, string&gt;</code> - Dark mode only
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>classes</strong> - CSS class overrides
                  <ul className="ml-4 list-disc text-xs">
                    <li>
                      <code>SsoProviderEdit-header</code> - Header container
                    </li>
                    <li>
                      <code>SsoProviderEdit-tabs</code> - Tabs container
                    </li>
                    <li>
                      <code>SsoProviderDetails-formActions</code> - Form actions
                    </li>
                    <li>
                      <code>ProviderDetails-root</code> - Provider details section
                    </li>
                    <li>
                      <code>ProviderConfigure-root</code> - Configuration section
                    </li>
                    <li>
                      <code>ProviderDelete-root</code> - Delete button section
                    </li>
                    <li>
                      <code>ProviderRemove-root</code> - Remove button section
                    </li>
                    <li>
                      <code>SsoProvisioningTab-root</code> - Provisioning tab
                    </li>
                    <li>
                      <code>SsoProvisioningDetails-root</code> - Provisioning details
                    </li>
                    <li>
                      <code>SsoProvisioningDetails-provisioningMapping</code> - Mappings section
                    </li>
                    <li>
                      <code>SsoProvisioningDetails-provisioningOptional</code> - Optional fields
                    </li>
                    <li>
                      <code>SsoProvisioningDetails-formActions</code> - Provisioning actions
                    </li>
                    <li>
                      <code>ProvisioningManageToken-root</code> - Token management
                    </li>
                    <li>
                      <code>ProvisioningManageToken-header</code> - Token header
                    </li>
                    <li>
                      <code>ProvisioningManageToken-table</code> - Token table
                    </li>
                    <li>
                      <code>ProvisioningManageToken-emptyState</code> - Empty state
                    </li>
                    <li>
                      <code>SsoDomainsTab-header</code> - Domains tab header
                    </li>
                    <li>
                      <code>SsoDomainsTab-table</code> - Domains table
                    </li>
                    <li>
                      <code>SsoDomainsTab-createModal</code> - Create domain modal
                    </li>
                    <li>
                      <code>SsoDomainsTab-verifyModal</code> - Verify domain modal
                    </li>
                    <li>
                      <code>SsoDomainsTab-deleteModal</code> - Delete domain modal
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<SsoProviderEdit
  providerId={providerId}
  sso={{
    delete: {},
    removeFromOrganization: {}
  }}
  styling={{
    variables: {
      common: {
        '--font-size-title': '1.5rem'
      },
      light: {
        '--color-primary': '#2563eb'
      }
    },
    classes: {
      'SsoProviderEdit-header': 'shadow-xl rounded-xl',
      'SsoProviderEdit-tabs': 'rounded-lg',
      'ProviderDetails-root': 'space-y-6',
      'SsoProvisioningTab-root': 'p-6'
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
              Configure validation rules for form fields across all tabs. All schema fields are
              optional and override defaults:
            </p>

            {/* Schema Structure Overview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Schema Structure</h4>
              <div className="text-sm text-blue-800 space-y-3">
                <p>
                  The <code>schema</code> prop is organized by tab and supports validation for:
                </p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>
                    <code>provider</code> - SSO tab provider details and protocol-specific
                    configuration
                  </li>
                  <li>
                    <code>provisioning</code> - Provisioning tab (currently no field schemas)
                  </li>
                  <li>
                    <code>domains</code> - Domain tab field validation
                  </li>
                </ul>
              </div>
            </div>

            {/* Provider Schema (SSO Tab) */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-3">
                Provider Schema (SSO Tab - <strong>schema.provider</strong>)
              </h4>

              <div className="space-y-4 text-sm text-blue-800">
                <div>
                  <h5 className="font-semibold mb-2">Provider Details Fields</h5>
                  <div className="ml-4 space-y-2">
                    <div>
                      <strong>provider.name</strong> - Provider name validation
                      <ul className="ml-4 list-disc text-xs">
                        <li>
                          <code>required?: boolean</code>
                        </li>
                        <li>
                          <code>minLength?: number</code>
                        </li>
                        <li>
                          <code>maxLength?: number</code>
                        </li>
                        <li>
                          <code>regex?: RegExp</code>
                        </li>
                        <li>
                          <code>errorMessage?: string</code>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <strong>provider.displayName</strong> - Display name validation (same
                      properties as name)
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold mb-2">Protocol Configuration Fields</h5>
                  <p className="mb-2 text-xs">
                    Each protocol has specific field schemas. Common validation properties include{' '}
                    <code>required</code>, <code>minLength</code>, <code>maxLength</code>,{' '}
                    <code>regex</code>, and <code>errorMessage</code>.
                  </p>

                  <div className="ml-4 space-y-3">
                    <div>
                      <strong>provider.okta</strong> - Okta Workforce configuration
                      <div className="text-xs ml-4">
                        Fields: <code>domain</code>, <code>client_id</code>,{' '}
                        <code>client_secret</code>, <code>icon_url</code>, <code>callback_url</code>
                      </div>
                    </div>

                    <div>
                      <strong>provider.google-apps</strong> - Google Workspace configuration
                      <div className="text-xs ml-4">
                        Fields: <code>domain</code>, <code>client_id</code>,{' '}
                        <code>client_secret</code>, <code>icon_url</code>, <code>callback_url</code>
                      </div>
                    </div>

                    <div>
                      <strong>provider.waad</strong> - Azure Active Directory configuration
                      <div className="text-xs ml-4">
                        Fields: <code>domain</code>, <code>client_id</code>,{' '}
                        <code>client_secret</code>, <code>icon_url</code>, <code>callback_url</code>
                      </div>
                    </div>

                    <div>
                      <strong>provider.oidc</strong> - OpenID Connect configuration
                      <div className="text-xs ml-4">
                        Fields: <code>type</code>, <code>client_id</code>,{' '}
                        <code>client_secret</code>, <code>discovery_url</code>,{' '}
                        <code>isFrontChannel</code>
                      </div>
                    </div>

                    <div>
                      <strong>provider.samlp</strong> - SAML configuration
                      <div className="text-xs ml-4">
                        Fields: <code>meta_data_source</code>, <code>single_sign_on_login_url</code>
                        , <code>signatureAlgorithm</code>, <code>digestAlgorithm</code>,{' '}
                        <code>protocolBinding</code>, <code>signSAMLRequest</code>,{' '}
                        <code>bindingMethod</code>, <code>metadataUrl</code>, <code>cert</code>,{' '}
                        <code>idpInitiated</code>, <code>icon_url</code>
                      </div>
                    </div>

                    <div>
                      <strong>provider.adfs</strong> - ADFS configuration
                      <div className="text-xs ml-4">
                        Fields: <code>meta_data_source</code>, <code>meta_data_location_url</code>,{' '}
                        <code>adfs_server</code>, <code>fedMetadataXml</code>
                      </div>
                    </div>

                    <div>
                      <strong>provider.pingfederate</strong> - PingFederate configuration
                      <div className="text-xs ml-4">
                        Fields: <code>signatureAlgorithm</code>, <code>digestAlgorithm</code>,{' '}
                        <code>signSAMLRequest</code>, <code>metadataUrl</code>,{' '}
                        <code>signingCert</code>, <code>idpInitiated</code>, <code>icon_url</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Domains Schema */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-3">
                Domains Schema (Domains Tab - <strong>schema.domains</strong>)
              </h4>

              <div className="space-y-2 text-sm text-blue-800">
                <div>
                  <strong>domains.create.domainUrl</strong> - Domain URL validation
                  <ul className="ml-4 list-disc text-xs mt-1">
                    <li>
                      <code>regex?: RegExp</code> - Custom validation pattern
                    </li>
                    <li>
                      <code>errorMessage?: string</code> - Custom error message
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Provisioning Schema Note */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> The <code>provisioning</code> schema currently has no field
                validation schemas defined.
              </p>
            </div>

            <CodeBlock
              code={`<SsoProviderEdit
  providerId={providerId}
  schema={{
    domains: {
      create: {
        domainUrl: {
          regex: /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\\.[a-zA-Z]{2,}$/,
          errorMessage: "Must be a valid domain (e.g., company.com)"
        }
      }
    }
  }}
/>`}
              language="tsx"
              title="Schema validation example"
            />
          </div>
        </div>
      </section>
      {/* Integration Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Complete Integration Example</h2>
        <p className="text-gray-600 mb-4">
          Comprehensive example demonstrating schema configuration, action lifecycle hooks, custom
          messages, styling, and navigation:
        </p>
        <CodeBlock
          code={`import React from 'react';
import { SsoProviderEdit } from '@auth0/universal-components-react/spa';
import { Auth0Provider } from '@auth0/auth0-react';
import { Auth0ComponentProvider } from '@auth0/universal-components-react/spa';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function ProviderEditScreen() {
  const navigate = useNavigate();
  const { providerId } = useParams<{ providerId: string }>();

  if (!providerId) {
    return <div>Provider ID is required</div>;
  }

  return (
    <div className='max-w-5xl mx-auto p-6'>
      <SsoProviderEdit
        providerId={providerId}
        backButton={{
          icon: ArrowLeft,
          onClick: () => navigate('/providers')
        }}
        schema={{
          provider: {
            name: {
              required: true,
            }
          },
        }}
        sso={{
          updateAction: {
            onBefore: (provider) => {
              // Validate before updating
              if (!provider.name?.trim()) {
                alert('Provider name is required');
                return false; // Cancel the update
              }
              return true;
            },
            onAfter: (provider) => {
              // Track analytics after successful update
              console.log('Provider updated:', provider.name);
              analytics.track('SSO Provider Updated', {
                providerId: provider.id,
              });
            }
          },
        }}
        customMessages={{
          header: {
            back_button_text: 'Back to Providers'
          },
          tabs: {
            sso: {
              name: 'Authentication',
              content: {
                alert: {
                  warning: 'Changes may affect user authentication',
                  error: 'Unable to load provider configuration'
                },
              }
            },
          }
        }}
        
        // Custom styling with theme support
        styling={{
          variables: {
            common: {
              '--font-size-label': '12px',
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
            'SsoProviderEdit-header': 'shadow-lg rounded-xl border border-gray-200',
            'ProviderDetails-root': 'space-y-6 p-6',
            'SsoProvisioningTab-root': 'p-6 bg-white rounded-lg'
          }
        }}
      />
    </div>
  );
}

export default function App() {
  const authDetails = {
    domain: 'your-domain.auth0.com',
    clientId: 'your-client-id'
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
        <ProviderEditScreen />
      </Auth0ComponentProvider>
    </Auth0Provider>
  );
}`}
          language="tsx"
          title="Complete implementation with all features"
        />
      </section>
      <hr />
      {/* Advanced Customization */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Advanced Customization</h2>
        <p className="text-gray-600">
          The <b>SsoProviderEdit</b> component is composed of smaller subcomponents and hooks. You
          can import them individually to build custom provider management workflows if you use
          shadcn.
        </p>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Available Subcomponents</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-sm text-blue-800">
              <div className="mb-4">
                <strong className="text-blue-900">Tab Components</strong>
                <div className="mt-2 space-y-1">
                  <div>
                    <code>SsoProviderTab</code> – Main SSO configuration tab with provider details,
                    delete, and remove
                  </div>
                  <div>
                    <code>SsoProvisioningTab</code> – User provisioning tab with SCIM token
                    management
                  </div>
                  <div>
                    <code>SsoDomainTab</code> – Domain management tab for associating domains with
                    provider
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <strong className="text-blue-900">SSO Tab Components</strong>
                <div className="mt-2 space-y-1">
                  <div>
                    <code>SsoProviderDetails</code> – Provider details form (name, display name,
                    logo, configuration)
                  </div>
                  <div>
                    <code>ProviderConfigureFields</code> – Protocol-specific configuration fields
                    (SAML, OIDC, Okta, etc.)
                  </div>
                  <div>
                    <code>SsoProviderDelete</code> – Delete provider section with confirmation
                  </div>
                  <div>
                    <code>SsoProviderDeleteModal</code> – Delete provider confirmation modal
                  </div>
                  <div>
                    <code>SsoProviderRemoveFromOrganization</code> – Remove provider from
                    organization section
                  </div>
                  <div>
                    <code>SsoProviderRemoveFromOrganizationModal</code> – Remove from organization
                    confirmation modal
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <strong className="text-blue-900">Provisioning Tab Components</strong>
                <div className="mt-2 space-y-1">
                  <div>
                    <code>SsoProvisioningDetails</code> – Provisioning configuration form with
                    mappings
                  </div>
                  <div>
                    <code>ProvisioningManageToken</code> – SCIM token management table and actions
                  </div>
                  <div>
                    <code>ProvisioningFieldMappings</code> – User attribute mapping configuration
                  </div>
                  <div>
                    <code>ProvisioningWarningAlert</code> – Warning alert for provisioning changes
                  </div>
                  <div>
                    <code>ProvisioningCreateTokenModal</code> – Modal for creating new SCIM tokens
                  </div>
                  <div>
                    <code>ProvisioningDeleteTokenModal</code> – Modal for deleting SCIM tokens
                  </div>
                  <div>
                    <code>SsoProvisioningDeleteModal</code> – Modal for disabling provisioning
                  </div>
                </div>
              </div>

              <div>
                <strong className="text-blue-900">Domain Tab Components</strong>
                <div className="mt-2 space-y-1">
                  <div>
                    <code>DomainCreateModal</code> – Modal for creating new domains
                  </div>
                  <div>
                    <code>DomainVerifyModal</code> – Modal for verifying domain ownership with DNS
                    records
                  </div>
                  <div>
                    <code>DomainDeleteModal</code> – Modal for deleting domains
                  </div>
                  <div>
                    <code>DomainConfigureProvidersModal</code> – Modal for associating/dissociating
                    domains with providers
                  </div>
                  <div>
                    <code>SsoDomainTabActionsColumn</code> – Action buttons column for domain table
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Available Hooks</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-sm text-blue-800 space-y-2">
              <div>
                <code>useSsoProviderEdit</code> – Main hook for provider and provisioning editing
                (fetch provider, update, delete, remove from organization, provisioning CRUD, SCIM
                token management)
              </div>
              <div>
                <code>useSsoDomainTab</code> – Hook for domain management within provider edit
                (create, verify, delete, associate domains)
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
