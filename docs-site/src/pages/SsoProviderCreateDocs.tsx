import CodeBlock from '../components/CodeBlock';

export default function SsoProviderCreateDocs() {
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
          <h1 className="text-4xl font-bold text-gray-900">SsoProviderCreate Component</h1>
          <p className="text-xl text-gray-600">
            Multi-step wizard for creating SSO providers with provider selection, details
            configuration, and authentication setup for Okta, ADFS, SAML, OIDC, Google Workspace,
            Azure AD, and PingFederate.
          </p>
        </div>
      </div>
      {/* Component Preview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Component Preview</h2>
        <div className="max-w-none flex justify-center">
          <img
            src="/img/my-org/idp-management/sso-provider-create.png"
            alt="SsoProviderCreate"
            width={700}
            height={500}
          />
        </div>
      </section>
      {/* Prerequisites */}
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
                Before using the <b>SsoProviderCreate</b> component, ensure your tenant is
                configured with the proper APIs, applications, and permissions.
              </p>
              <p className="text-blue-800 mb-4">
                <strong>Complete setup guide:</strong>{' '}
                <a
                  href="/my-org"
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
            <CodeBlock
              code="npm install @auth0/web-ui-components-react"
              language="bash"
              title="npm"
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
              If you're using Shadcn, you can add the SsoProviderCreate block directly to your
              project. You'll still need to install the core package separately:
            </p>
            <div className="space-y-3">
              <CodeBlock
                code="npm install @auth0/web-ui-components-core"
                language="bash"
                title="1. Install Core Package"
              />
              <CodeBlock
                code="npx shadcn@latest add https://auth0-ui-components.vercel.app/r/my-org/sso-provider-create.json"
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
          code={`import { SsoProviderCreate } from '@auth0/web-ui-components-react';
// For shadcn users:
// import { SsoProviderCreate } from '@/auth0-ui-components/blocks/my-org/idp-management/sso-provider-create';

export function CreateProviderPage() {
  return (
    <div>
      <SsoProviderCreate
        createAction={{
          onAfter: () => {
            navigate('/providers/list');
          },
        }}
        backButton={{
          onClick: () => {
            navigate('/providers/list');
          },
        }}
      />
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  schema
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">SsoProviderSchema</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Validation schema for form fields including regex patterns and error messages
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  customMessages
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  Partial&lt;SsoProviderCreateMessages&gt;
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{}</td>
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
                  ComponentStyling&lt;SsoProviderCreateClasses&gt;
                </td>
                <td
                  className="px-4 py-2 whitespace-nowrap text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {'{ variables: {}, classes: {} }'}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Custom CSS variables and class names for styling
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  readOnly
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">boolean</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">false</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  When true, form is read-only and actions are disabled
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  hideHeader
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">boolean</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">false</td>
                <td className="px-4 py-2 text-sm text-gray-500">Hides the component header</td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  createAction
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  ComponentAction&lt;CreateIdentityProviderRequestContentPrivate,
                  IdentityProvider&gt;
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">required</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for create action including onBefore and onAfter hooks
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  backButton
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">SsoProviderCreateBackButton</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Back button configuration with icon and click handler
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  onNext
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  (stepId: string, values: Partial&lt;SsoProviderFormValues&gt;) =&gt; boolean
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Callback when moving to next wizard step, return false to prevent navigation
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  onPrevious
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  (stepId: string, values: Partial&lt;SsoProviderFormValues&gt;) =&gt; boolean
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Callback when moving to previous wizard step, return false to prevent navigation
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
interface SsoProviderCreateProps {
  schema?: SsoProviderSchema;
  customMessages?: Partial<SsoProviderCreateMessages>;
  styling?: ComponentStyling<SsoProviderCreateClasses>;
  readOnly?: boolean;
  hideHeader?: boolean;
  createAction?: ComponentAction<
    CreateIdentityProviderRequestContentPrivate,
    IdentityProvider
  >;
  backButton?: {
    icon?: LucideIcon;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  };
  onNext?: (stepId: string, values: Partial<SsoProviderFormValues>) => boolean;
  onPrevious?: (stepId: string, values: Partial<SsoProviderFormValues>) => boolean;
}

// Action interface
interface ComponentAction<TInput, TOutput = void> {
  disabled?: boolean;
  onBefore?: (data: TInput) => boolean | Promise<boolean>;
  onAfter?: (data: TInput, result?: TOutput) => void | Promise<void>;
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
              Handle wizard lifecycle events with callbacks. All action properties are optional
              except for createAction:
            </p>

            {/* Available Action Options */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Available Action Properties</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <strong>createAction</strong> - Provider creation action
                  <ul className="ml-4 list-disc">
                    <li>disabled</li>
                    <li>onBefore</li>
                    <li>onAfter</li>
                  </ul>
                </div>
                <div>
                  <strong>backButton</strong> - Navigation action
                  <ul className="ml-4 list-disc">
                    <li>icon</li>
                    <li>onClick</li>
                  </ul>
                </div>
                <div>
                  <strong>onNext</strong> - Step navigation callback
                  <ul className="ml-4 list-disc">
                    <li>Receives stepId and form values</li>
                    <li>Return false to prevent navigation</li>
                  </ul>
                </div>
                <div>
                  <strong>onPrevious</strong> - Step navigation callback
                  <ul className="ml-4 list-disc">
                    <li>Receives stepId and form values</li>
                    <li>Return false to prevent navigation</li>
                  </ul>
                </div>
              </div>
              <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-700">
                The onBefore hooks can return false to cancel the action
              </div>
            </div>

            <CodeBlock
              code={`<SsoProviderCreate
  createAction={{
    onBefore: (provider) => {
      return confirm('Create SSO provider ' + provider.display_name + '?');
    },
    onAfter: (provider, result) => {
      analytics.track('SSO Provider Created', {
        strategy: provider.strategy,
        name: provider.name,
      });
      navigate('/sso-providers');
    }
  }}
  backButton={{
    onClick: () => navigate('/sso-providers')
  }}
/>`}
              language="tsx"
              title="Action hooks example"
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
              <h4 className="font-medium text-blue-900 mb-2">Available Messages</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
                <div>
                  <strong>header</strong> - Component header
                  <ul className="ml-4 list-disc">
                    <li>title</li>
                    <li>back_button_text</li>
                  </ul>
                </div>
                <div>
                  <strong>provider_select</strong> - Step 1
                  <ul className="ml-4 list-disc">
                    <li>title</li>
                    <li>description</li>
                  </ul>
                </div>
                <div>
                  <strong>provider_details</strong> - Step 2
                  <ul className="ml-4 list-disc">
                    <li>title</li>
                    <li>description</li>
                    <li>fields.name.label</li>
                    <li>fields.name.placeholder</li>
                    <li>fields.name.helper_text</li>
                    <li>fields.name.error</li>
                    <li>fields.display_name.label</li>
                    <li>fields.display_name.placeholder</li>
                    <li>fields.display_name.helper_text</li>
                    <li>fields.display_name.error</li>
                  </ul>
                </div>
                <div>
                  <strong>provider_configure</strong> - Step 3
                  <ul className="ml-4 list-disc">
                    <li>title</li>
                    <li>description</li>
                    <li>guided_setup_button_text</li>
                  </ul>
                </div>
                <div className="break-words">
                  <strong className="break-words">fields.okta</strong> - Okta fields
                  <ul className="ml-4 list-disc">
                    <li>domain.*</li>
                    <li>client_id.*</li>
                    <li>client_secret.*</li>
                    <li>icon_url.*</li>
                    <li>callback_url.*</li>
                  </ul>
                </div>
                <div className="break-words">
                  <strong className="break-words">fields.adfs</strong> - ADFS fields
                  <ul className="ml-4 list-disc">
                    <li>meta_data_source.*</li>
                    <li>meta_data_url.*</li>
                    <li>meta_data_location_url.*</li>
                    <li>federation_meta_data_file.*</li>
                    <li>upload_button_label</li>
                  </ul>
                </div>
                <div className="break-words">
                  <strong className="break-words">fields.google-apps</strong> - Google Workspace
                  <ul className="ml-4 list-disc">
                    <li>domain.*</li>
                    <li>client_id.*</li>
                    <li>client_secret.*</li>
                    <li>icon_url.*</li>
                    <li>callback_url.*</li>
                  </ul>
                </div>
                <div className="break-words">
                  <strong className="break-words">fields.oidc</strong> - OIDC fields
                  <ul className="ml-4 list-disc">
                    <li>type.*</li>
                    <li>client_id.*</li>
                    <li>client_secret.*</li>
                    <li>discovery_url.*</li>
                  </ul>
                </div>
                <div className="break-words">
                  <strong className="break-words">fields.pingfederate</strong> - PingFederate
                  <ul className="ml-4 list-disc">
                    <li>ping_federate_baseurl.*</li>
                    <li>sign_cert.*</li>
                    <li>advanced_settings.title</li>
                    <li>advanced_settings.sign_request.*</li>
                    <li>advanced_settings.sign_request_algorithm.*</li>
                    <li>advanced_settings.sign_request_algorithm_digest.*</li>
                  </ul>
                </div>
                <div className="break-words">
                  <strong className="break-words">fields.samlp</strong> - SAML fields
                  <ul className="ml-4 list-disc">
                    <li>meta_data_source.*</li>
                    <li>meta_data_url.*</li>
                    <li>single_sign_on_login_url.*</li>
                    <li>cert.*</li>
                    <li>advanced_settings.title</li>
                    <li>advanced_settings.sign_request.*</li>
                    <li>advanced_settings.request_protocol_binding.*</li>
                    <li>advanced_settings.sign_request_algorithm.*</li>
                    <li>advanced_settings.sign_request_algorithm_digest.*</li>
                  </ul>
                </div>
                <div className="break-words">
                  <strong className="break-words">fields.waad</strong> - Azure AD fields
                  <ul className="ml-4 list-disc">
                    <li>tenant_domain.*</li>
                    <li>client_id.*</li>
                    <li>client_secret.*</li>
                    <li>icon_url.*</li>
                    <li>callback_url.*</li>
                  </ul>
                </div>
                <div>
                  <strong>notifications</strong> - API responses
                  <ul className="ml-4 list-disc">
                    <li>general_error</li>
                    <li>provider_create_success</li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<SsoProviderCreate
  createAction={{}}
  customMessages={{
    header: {
      title: 'Add New SSO Provider',
      back_button_text: 'Cancel'
    },
    provider_details: {
      title: 'Provider Information',
      fields: {
        name: {
          label: 'Connection Name',
          helper_text: 'Internal identifier for this connection'
        }
      }
    },
    provider_configure: {
      title: 'Authentication Configuration'
    },
    notifications: {
      provider_create_success: 'SSO provider created successfully!'
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
                  <strong>Variables</strong> - CSS custom properties
                  <ul className="ml-4 list-disc">
                    <li>common - Applied to all themes</li>
                    <li>light - Light theme only</li>
                    <li>dark - Dark theme only</li>
                  </ul>
                </div>
                <div>
                  <strong>Classes</strong> - Component class overrides
                  <ul className="ml-4 list-disc">
                    <li>SsoProviderCreate-header</li>
                    <li>SsoProviderCreate-wizard</li>
                    <li>ProviderSelect-root</li>
                    <li>ProviderDetails-root</li>
                    <li>ProviderConfigure-root</li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<SsoProviderCreate
  createAction={{}}
  styling={{
    variables: {
      common: {
        '--font-size-title': '1.5rem'
      }
    },
    classes: {
      'SsoProviderCreate-wizard': 'shadow-xl rounded-xl',
      'ProviderSelect-root': 'grid grid-cols-3 gap-6'
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
              <div className="text-sm text-blue-800 mb-3">
                All schema fields support: regex, errorMessage, minLength, maxLength, required
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <strong>Provider Details</strong>
                  <ul className="ml-4 list-disc">
                    <li>name</li>
                    <li>displayName</li>
                  </ul>
                </div>
                <div>
                  <strong>Okta</strong>
                  <ul className="ml-4 list-disc">
                    <li>okta.domain</li>
                    <li>okta.client_id</li>
                    <li>okta.client_secret</li>
                    <li>okta.icon_url</li>
                    <li>okta.callback_url</li>
                  </ul>
                </div>
                <div>
                  <strong>ADFS</strong>
                  <ul className="ml-4 list-disc">
                    <li>adfs.meta_data_source</li>
                    <li>adfs.meta_data_location_url</li>
                    <li>adfs.adfs_server</li>
                    <li>adfs.fedMetadataXml</li>
                  </ul>
                </div>
                <div>
                  <strong>Google Workspace</strong>
                  <ul className="ml-4 list-disc">
                    <li>google-apps.domain</li>
                    <li>google-apps.client_id</li>
                    <li>google-apps.client_secret</li>
                    <li>google-apps.icon_url</li>
                    <li>google-apps.callback_url</li>
                  </ul>
                </div>
                <div>
                  <strong>OIDC</strong>
                  <ul className="ml-4 list-disc">
                    <li>oidc.type</li>
                    <li>oidc.client_id</li>
                    <li>oidc.client_secret</li>
                    <li>oidc.discovery_url</li>
                    <li>oidc.isFrontChannel</li>
                  </ul>
                </div>
                <div>
                  <strong>PingFederate</strong>
                  <ul className="ml-4 list-disc">
                    <li>pingfederate.signatureAlgorithm</li>
                    <li>pingfederate.digestAlgorithm</li>
                    <li>pingfederate.signSAMLRequest</li>
                    <li>pingfederate.metadataUrl</li>
                    <li>pingfederate.signingCert</li>
                    <li>pingfederate.idpInitiated</li>
                    <li>pingfederate.icon_url</li>
                  </ul>
                </div>
                <div>
                  <strong>SAML</strong>
                  <ul className="ml-4 list-disc">
                    <li>samlp.meta_data_source</li>
                    <li>samlp.single_sign_on_login_url</li>
                    <li>samlp.signatureAlgorithm</li>
                    <li>samlp.digestAlgorithm</li>
                    <li>samlp.protocolBinding</li>
                    <li>samlp.signSAMLRequest</li>
                    <li>samlp.bindingMethod</li>
                    <li>samlp.metadataUrl</li>
                    <li>samlp.cert</li>
                    <li>samlp.idpInitiated</li>
                    <li>samlp.icon_url</li>
                  </ul>
                </div>
                <div>
                  <strong>Azure AD</strong>
                  <ul className="ml-4 list-disc">
                    <li>waad.domain</li>
                    <li>waad.client_id</li>
                    <li>waad.client_secret</li>
                    <li>waad.icon_url</li>
                    <li>waad.callback_url</li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<SsoProviderCreate
  createAction={{}}
  schema={{
    name: {
      minLength: 3,
      maxLength: 50,
      regex: /^[a-zA-Z0-9-_]+$/,
      errorMessage: "Name must be alphanumeric with hyphens/underscores"
    },
    displayName: {
      required: true,
      maxLength: 100
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
        <CodeBlock
          code={`import React from 'react';
import { SsoProviderCreate } from '@auth0/web-ui-components-react';
import { Auth0Provider } from '@auth0/auth0-react';
import { Auth0ComponentProvider } from '@auth0/web-ui-components-react';
import { useNavigate } from 'react-router-dom';
import { analytics } from './lib/analytics';

function CreateSsoProviderPage() {
  const navigate = useNavigate();

  const handleCreateSuccess = (provider, result) => {
    analytics.track('SSO Provider Created', {
      strategy: provider.strategy,
      name: provider.name,
    });
    navigate('/sso-providers');
  };

  const handleBackButton = () => {
    navigate('/sso-providers');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <SsoProviderCreate
        schema={{
          name: {
            required: true,
            minLength: 3,
            maxLength: 50,
            regex: /^[a-zA-Z0-9-_]+$/,
            errorMessage: "Name must be alphanumeric with hyphens and underscores only"
          },
          displayName: {
            required: true,
            maxLength: 100
          }
        }}
        createAction={{
          onBefore: (provider) => {
            return confirm(\`Create SSO provider "\${provider.display_name}"?\`);
          },
          onAfter: handleCreateSuccess
        }}
        backButton={{
          onClick: handleBackButton
        }}
        customMessages={{
          header: {
            title: 'Add New SSO Provider'
          },
          notifications: {
            provider_create_success: 'SSO provider created successfully!'
          }
        }}
        styling={{
          variables: {
            common: {
              '--color-primary': '#059669'
            }
          },
          classes: {
            'SsoProviderCreate-wizard': 'shadow-xl rounded-lg'
          }
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
    >
      <Auth0ComponentProvider
        authDetails={authDetails}
      >
        <CreateSsoProviderPage />
      </Auth0ComponentProvider>
    </Auth0Provider>
  );
}`}
          language="tsx"
          title="Complete implementation example"
        />
      </section>
      <hr />
      {/* Advanced Customization */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Advanced Customization</h2>
        <p className="text-gray-600">
          The <b>SsoProviderCreate</b> component is composed of smaller subcomponents and hooks. You
          can import them individually to build custom SSO provider creation workflows if you use
          shadcn.
        </p>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Available Subcomponents</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-sm text-blue-800 space-y-2">
              <code>ProviderSelect</code> – Strategy selection step with provider icons
              <br />
              <code>ProviderDetails</code> – Name and display name configuration step
              <br />
              <code>ProviderConfigure</code> – Strategy-specific configuration step
              <br />
              <code>ProviderConfigureFields</code> – Dynamic form fields based on strategy
              <br />
              <code>OktaProviderForm</code> – Okta-specific configuration form
              <br />
              <code>AdfsProviderForm</code> – ADFS-specific configuration form
              <br />
              <code>GoogleAppsProviderForm</code> – Google Workspace-specific configuration form
              <br />
              <code>OidcProviderForm</code> – OIDC-specific configuration form
              <br />
              <code>PingFederateProviderForm</code> – PingFederate-specific configuration form
              <br />
              <code>SamlpProviderForm</code> – SAML-specific configuration form
              <br />
              <code>WaadProviderForm</code> – Azure AD-specific configuration form
              <br />
              <code>Wizard</code> – Multi-step wizard UI
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Available Hooks</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-sm text-blue-800 space-y-2">
              <code>useSsoProviderCreate</code> – Provider creation logic and API integration
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
