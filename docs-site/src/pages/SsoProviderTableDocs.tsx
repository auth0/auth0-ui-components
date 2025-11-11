import CodeBlock from '../components/CodeBlock';

export default function SsoProviderTableDocs() {
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
          <h1 className="text-4xl font-bold text-gray-900">SsoProviderTable Component</h1>
          <p className="text-xl text-gray-600">
            Display and manage SSO identity providers with a comprehensive table interface including
            create, edit, delete, enable/disable, and remove from organization capabilities.
          </p>
        </div>
      </div>
      {/* Component Preview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Component Preview</h2>
        <div className="max-w-none flex justify-center">
          <img
            src="/img/my-org/idp-management/sso-provider-table.png"
            alt="SsoProviderTable"
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
                Before using the <b>SsoProviderTable</b> component, ensure your tenant is configured
                with the proper APIs, applications, and permissions.
              </p>
              <p className="text-blue-800">
                <strong>Setup guide:</strong>{' '}
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
              If you're using Shadcn, you can add the SsoProviderTable block directly to your
              project. You'll still need to install the core package separately:
            </p>
            <div className="space-y-3">
              <CodeBlock
                code="npm install @auth0/web-ui-components-core"
                language="bash"
                title="1. Install Core Package"
              />
              <CodeBlock
                code="npx shadcn@latest add https://auth0-ui-components.vercel.app/r/my-org/sso-provider-table.json"
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
          code={`import { SsoProviderTable } from '@auth0/web-ui-components-react';
// For shadcn users:
// import { SsoProviderTable } from '@/auth0-ui-components/blocks/my-org/idp-management/sso-provider-table';
import { useNavigate } from 'react-router-dom';

export function ProvidersPage() {
  const navigate = useNavigate();

  return (
    <div>
      <SsoProviderTable
        createAction={{
          onAfter: () => navigate('/providers/create')
        }}
        editAction={{
          onAfter: (provider) => navigate(\`/providers/\${provider.id}\`)
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
                  schema
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  SsoProviderTableSchema
                </td>
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
                  Partial&lt;SsoProviderTableMessages&gt;
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
                  ComponentStyling&lt;SsoProviderTableClasses&gt;
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
                  readOnly
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  boolean
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">false</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Whether the component is in read-only mode
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
                  Whether to hide the component header
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  createAction
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  ComponentAction&lt;void&gt;
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for create provider action including onBefore and onAfter hooks
                  (required)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  editAction
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  ComponentAction&lt;IdentityProvider&gt;
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for edit provider action including onBefore and onAfter hooks
                  (required)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  deleteAction
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  ComponentAction&lt;IdentityProvider&gt;
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for delete provider action including onBefore and onAfter hooks
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  deleteFromOrgAction
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  ComponentAction&lt;IdentityProvider&gt;
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for remove provider from organization action including onBefore and
                  onAfter hooks
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  enableProviderAction
                </td>
                <td
                  className="px-4 py-2 text-sm text-gray-500"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  ComponentAction&lt;IdentityProvider&gt;
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for enable/disable provider action including onBefore and onAfter
                  hooks
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
interface SsoProviderTableProps {
  schema?: SsoProviderTableSchema;
  customMessages?: Partial<SsoProviderTableMessages>;
  styling?: ComponentStyling<SsoProviderTableClasses>;
  readOnly?: boolean;
  hideHeader?: boolean;
  createAction: ComponentAction<void>;
  editAction: ComponentAction<IdentityProvider>;
  deleteAction?: ComponentAction<IdentityProvider>;
  deleteFromOrgAction?: ComponentAction<IdentityProvider>;
  enableProviderAction?: ComponentAction<IdentityProvider>;
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
              Handle provider table events with lifecycle callbacks. All action properties are
              optional except for createAction and editAction:
            </p>

            {/* Available Action Options */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Available Action Properties</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <strong>createAction</strong> - Create provider navigation
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>disabled?: boolean</code> - Disable create button
                    </li>
                    <li>
                      <code>onBefore?: () → boolean | Promise&lt;boolean&gt;</code>
                    </li>
                    <li>
                      <code>onAfter?: () → void | Promise&lt;void&gt;</code>
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>editAction</strong> - Edit provider navigation
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>disabled?: boolean</code> - Disable edit button
                    </li>
                    <li>
                      <code>
                        onBefore?: (provider: IdentityProvider) → boolean | Promise&lt;boolean&gt;
                      </code>
                    </li>
                    <li>
                      <code>
                        onAfter?: (provider: IdentityProvider) → void | Promise&lt;void&gt;
                      </code>
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>deleteAction</strong> - Delete provider lifecycle
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>disabled?: boolean</code> - Disable delete button
                    </li>
                    <li>
                      <code>
                        onBefore?: (provider: IdentityProvider) → boolean | Promise&lt;boolean&gt;
                      </code>
                    </li>
                    <li>
                      <code>
                        onAfter?: (provider: IdentityProvider) → void | Promise&lt;void&gt;
                      </code>
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>deleteFromOrgAction</strong> - Remove from org lifecycle
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>disabled?: boolean</code> - Disable remove button
                    </li>
                    <li>
                      <code>
                        onBefore?: (provider: IdentityProvider) → boolean | Promise&lt;boolean&gt;
                      </code>
                    </li>
                    <li>
                      <code>
                        onAfter?: (provider: IdentityProvider) → void | Promise&lt;void&gt;
                      </code>
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>enableProviderAction</strong> - Enable/disable provider
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>disabled?: boolean</code> - Disable toggle
                    </li>
                    <li>
                      <code>
                        onBefore?: (provider: IdentityProvider) → boolean | Promise&lt;boolean&gt;
                      </code>
                    </li>
                    <li>
                      <code>
                        onAfter?: (provider: IdentityProvider) → void | Promise&lt;void&gt;
                      </code>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-700">
                <strong>Note:</strong> <code>onBefore</code> hooks can return <code>false</code> to
                cancel the action
              </div>
            </div>

            <CodeBlock
              code={`<SsoProviderTable
  createAction={{
    onAfter: () => navigate('/providers/create')
  }}
  editAction={{
    onAfter: (provider) => navigate(\`/providers/\${provider.id}\`)
  }}
  deleteAction={{
    onBefore: (provider) => confirm(\`Delete "\${provider.name}"?\`)
  }}
  deleteFromOrgAction={{
    onAfter: (provider) => {
      analytics.track('Provider Removed From Org', {
        providerId: provider.id,
      });
    }
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
                    <li>description</li>
                    <li>create_button_text</li>
                  </ul>
                </div>
                <div>
                  <strong>table</strong> - Table configuration
                  <ul className="ml-4 list-disc">
                    <li>empty_message</li>
                    <li>columns.name</li>
                    <li>columns.identity_provider</li>
                    <li>columns.display_name</li>
                    <li>actions.edit_button_text</li>
                    <li>actions.delete_button_text</li>
                    <li>actions.remove_button_text</li>
                  </ul>
                </div>
                <div>
                  <strong>create_consent_modal</strong> - Create consent modal
                  <ul className="ml-4 list-disc">
                    <li>title</li>
                    <li>description</li>
                    <li>actions.cancel_button_text</li>
                    <li>actions.process_button_text</li>
                  </ul>
                </div>
                <div>
                  <strong>delete_modal</strong> - Delete provider modal
                  <ul className="ml-4 list-disc">
                    <li>title</li>
                    <li>description</li>
                    <li>delete_button_label</li>
                    <li>modal.title</li>
                    <li>modal.description</li>
                    <li>modal.content.description</li>
                    <li>modal.content.field.label</li>
                    <li>modal.content.field.placeholder</li>
                    <li>modal.actions.cancel_button_label</li>
                    <li>modal.actions.delete_button_label</li>
                  </ul>
                </div>
                <div>
                  <strong>remove_modal</strong> - Remove from org modal
                  <ul className="ml-4 list-disc">
                    <li>title</li>
                    <li>description</li>
                    <li>model_content.description</li>
                    <li>model_content.field.label</li>
                    <li>model_content.field.placeholder</li>
                    <li>actions.cancel_button_text</li>
                    <li>actions.remove_button_text</li>
                  </ul>
                </div>
                <div>
                  <strong>notifications</strong> - API responses and errors
                  <ul className="ml-4 list-disc">
                    <li>general_error</li>
                    <li>fetch_providers_error</li>
                    <li>fetch_domains_error</li>
                    <li>domain_create.success</li>
                    <li>domain_create.error</li>
                    <li>domain_create.on_before</li>
                    <li>domain_verify.success</li>
                    <li>domain_verify.error</li>
                    <li>domain_verify.on_before</li>
                    <li>domain_verify.verification_failed</li>
                    <li>domain_delete.success</li>
                    <li>domain_delete.error</li>
                    <li>domain_associate_provider.success</li>
                    <li>domain_associate_provider.error</li>
                    <li>domain_associate_provider.on_before</li>
                    <li>domain_delete_provider.success</li>
                    <li>domain_delete_provider.error</li>
                    <li>domain_delete_provider.on_before</li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<SsoProviderTable
  createAction={{
    onAfter: () => navigate('/providers/create')
  }}
  editAction={{
    onAfter: (provider) => navigate(\`/providers/\${provider.id}\`)
  }}
  customMessages={{
    header: {
      title: 'SSO Providers',
      description: 'Manage your organization identity providers',
      create_button_text: 'Add Provider'
    },
    table: {
      empty_message: 'No providers configured yet',
      columns: {
        name: 'Provider Name',
        display_name: 'Display Name'
      },
      actions: {
        edit_button_text: 'Configure'
      }
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
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>SsoProviderTable-header?: string</code> - Header container
                    </li>
                    <li>
                      <code>SsoProviderTable-table?: string</code> - Table container
                    </li>
                    <li>
                      <code>SsoProviderTable-deleteProviderModal?: string</code> - Delete modal
                    </li>
                    <li>
                      <code>SsoProviderTable-deleteProviderFromOrgModal?: string</code> - Remove
                      modal
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<SsoProviderTable
  createAction={{
    onAfter: () => navigate('/providers/create')
  }}
  editAction={{
    onAfter: (provider) => navigate(\`/providers/\${provider.id}\`)
  }}
  styling={{
    variables: {
      common: {
        '--font-size-title': '1.5rem'
      },
      light: {
        '--color-primary': '#2563eb',
        '--color-background': '#ffffff'
      }
    },
    classes: {
      'SsoProviderTable-header': 'shadow-lg rounded-xl',
      'SsoProviderTable-table': 'border-2 border-gray-100'
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
              Configure validation rules for modal forms. All schema fields are optional and
              override defaults:
            </p>

            {/* Available Schema Fields */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Available Schema Fields</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div>
                  <strong>schema.delete.providerName</strong> - Delete confirmation validation
                  <ul className="ml-4 list-disc text-xs mt-1">
                    <li>
                      <code>required?: boolean</code> - Whether provider name confirmation is
                      required
                    </li>
                    <li>
                      <code>errorMessage?: string</code> - Custom error message
                    </li>
                    <li>
                      <code>exactMatch?: string</code> - Exact string to match for confirmation
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>schema.remove.providerName</strong> - Remove from Org confirmation
                  validation
                  <ul className="ml-4 list-disc text-xs mt-1">
                    <li>
                      <code>required?: boolean</code> - Whether provider name confirmation is
                      required
                    </li>
                    <li>
                      <code>errorMessage?: string</code> - Custom error message
                    </li>
                    <li>
                      <code>exactMatch?: string</code> - Exact string to match for confirmation
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<SsoProviderTable
  createAction={{
    onAfter: () => navigate('/providers/create')
  }}
  editAction={{
    onAfter: (provider) => navigate(\`/providers/\${provider.id}\`)
  }}
  schema={{
    delete: {
      providerName: {
        required: true,
        errorMessage: "You must type the provider name to confirm deletion"
      }
    },
    remove: {
      providerName: {
        required: true,
        errorMessage: "You must type the provider name to confirm removal"
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
        <CodeBlock
          code={`import React from 'react';
import { SsoProviderTable } from '@auth0/web-ui-components-react';
import { Auth0Provider } from '@auth0/auth0-react';
import { Auth0ComponentProvider } from '@auth0/web-ui-components-react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import * as analytics from './analytics'; // Your analytics service

function ProvidersListPage() {
  const navigate = useNavigate();

  return (
    <div className='max-w-6xl mx-auto p-6'>
      <SsoProviderTable
        schema={{
          delete: {
            providerName: {
              required: true,
              errorMessage: "Please type the provider name to confirm"
            }
          }
        }}
        createAction={{
          onBefore: () => {
            console.log('Navigating to create provider');
            return true;
          },
          onAfter: () => {
            navigate('/providers/create');
          }
        }}
        editAction={{
          onAfter: (provider) => {
            navigate(\`/providers/\${provider.id}\`);
          }
        }}
        deleteAction={{
          onBefore: (provider) => {
            return confirm(\`Are you sure you want to delete "\${provider.name}"?\`);
          },
          onAfter: (provider) => {
            analytics.track('Provider Deleted', {
              providerId: provider.id,
              strategy: provider.strategy
            });
          }
        }}
        deleteFromOrgAction={{
          onBefore: (provider) => {
            return confirm(\`Remove "\${provider.name}" from organization?\`);
          },
          onAfter: (provider) => {
            analytics.track('Provider Removed From Org', {
              providerId: provider.id
            });
          }
        }}
        customMessages={{
          header: {
            title: 'SSO Providers',
            create_button_text: 'Add Provider'
          },
          table: {
            empty_message: 'No providers configured yet',
            actions: {
              edit_button_text: 'Configure'
            }
          }
        }}
        styling={{
          variables: {
            common: {
              '--font-size-label': '12px'
            },
            light: {
              '--color-primary': '#2563eb',
              '--color-background': '#ffffff'
            },
            dark: {
              '--color-primary': '#3b82f6',
              '--color-background': '#1f2937'
            }
          },
          classes: {
            'SsoProviderTable-header': 'shadow-lg rounded-xl',
            'SsoProviderTable-table': 'border border-gray-200'
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
    >
      <Auth0ComponentProvider authDetails={authDetails}>
        <ProvidersListPage />
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
          The <b>SsoProviderTable</b> component is composed of smaller subcomponents and hooks. You
          can import them individually to build custom provider management workflows if you use
          shadcn.
        </p>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Available Subcomponents</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-sm text-blue-800 space-y-2">
              <code>SsoProviderTableActionsColumn</code> – Action buttons for each provider row
              (edit, delete, remove, enable/disable)
              <br />
              <code>SsoProviderDeleteModal</code> – Confirmation modal for provider deletion
              <br />
              <code>SsoProviderRemoveFromOrgModal</code> – Confirmation modal for removing provider
              from organization
              <br />
              <code>DataTable</code> – Generic data table component with sorting and filtering
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Available Hooks</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-sm text-blue-800 space-y-2">
              <code>useSsoProviderTable</code> – Data fetching, table state management, and CRUD
              operations (fetch providers, delete, remove from org, enable/disable)
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
