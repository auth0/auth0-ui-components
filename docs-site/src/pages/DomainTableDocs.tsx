import CodeBlock from '../components/CodeBlock';
import TabbedCodeBlock from '../components/TabbedCodeBlock';

export default function DomainTableDocs() {
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
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-3">
                BETA
              </span>
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">DomainTable Component</h1>
          <p className="text-xl text-gray-600">
            Manage verified and pending organization domains: create, verify, associate with
            identity providers, and remove — all in a unified table interface.
          </p>
        </div>
      </div>
      {/* Component Preview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Component Preview</h2>
        <div className="max-w-none flex justify-center">
          <img
            src="/img/my-organization/domain-management/domain-table.png"
            alt="DomainTable"
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
                Before using the <b>DomainTable</b> component, ensure your tenant is configured with
                the proper APIs, applications, and permissions.
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
              If you're using Shadcn, you can add the DomainTable block directly to your project.
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
                code="npx shadcn@latest add https://auth0-universal-components.vercel.app/r/my-organization/domain-table.json"
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
import { DomainTable } from '@auth0/universal-components-react/spa';

// For Next.js/RWA applications:          
// import { DomainTable } from '@auth0/universal-components-react/rwa';

// For shadcn users:
// import { DomainTable } from '@/auth0-ui-components/blocks/my-organization/domain-management/domain-table'; 

export function DomainsPage() {
  return (
    <div>
      <DomainTable />
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
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  Prop
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
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
                  schema
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">DomainTableSchema</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Validation schema for form fields including regex patterns and error messages
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  customMessages
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Partial&lt;DomainTableMainMessages&gt;
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
                <td className="px-4 py-2 text-sm text-gray-500">ComponentStyling</td>
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
                  createAction
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">ComponentAction&lt;Domain&gt;</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for create action including onBefore and onAfter hooks
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  verifyAction
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">ComponentAction&lt;Domain&gt;</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for verify action including onBefore and onAfter hooks
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  deleteAction
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">ComponentAction&lt;Domain&gt;</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for delete action including onBefore and onAfter hooks
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  associateToProviderAction
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  ComponentAction&lt;Domain, IdentityProvider&gt;
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for associateToProvider action including onBefore and onAfter hooks
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  deleteFromProviderAction
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  ComponentAction&lt;Domain, IdentityProvider&gt;
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for deleteFromProvider action including onBefore and onAfter hooks
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  onOpenProvider
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  (provider: IdentityProvider) ⇒ void
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Handle to open a provider from the configure domain modal
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  onCreateProvider
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">() ⇒ void</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Handle to open provider creation flow from the configure domain modal
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
interface DomainTableProps {
  createAction?: ComponentAction<Domain>;
  verifyAction?: ComponentAction<Domain>;
  deleteAction?: ComponentAction<Domain>;
  associateToProviderAction?: ComponentAction<Domain, IdentityProvider>;
  deleteFromProviderAction?: ComponentAction<Domain, IdentityProvider>;
  onOpenProvider?: (provider: IdentityProvider) => void;
  onCreateProvider?: () => void;
  readOnly?: boolean;
  hideHeader?: boolean;
  schema?: DomainTableSchema;
  customMessages?: Partial<DomainTableMainMessages>;
  styling?: ComponentStyling;
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
              Handle domain events with lifecycle callbacks. All action properties are optional:
            </p>

            {/* Available Action Options */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Available Action Properties</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <strong>createAction</strong> - Domain creation lifecycle
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>disabled</code> - Disable create button
                    </li>
                    <li>
                      <code>onBefore</code> - Validate before creating domain
                    </li>
                    <li>
                      <code>onAfter</code> - React after domain creation
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>verifyAction</strong> - Domain verification lifecycle
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>disabled</code> - Disable verify button
                    </li>
                    <li>
                      <code>onBefore</code> - Confirm before verification
                    </li>
                    <li>
                      <code>onAfter</code> - React after verification
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>deleteAction</strong> - Domain deletion lifecycle
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>disabled</code> - Disable delete button
                    </li>
                    <li>
                      <code>onBefore</code> - Confirm before deletion
                    </li>
                    <li>
                      <code>onAfter</code> - React after deletion
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>associateToProviderAction</strong> - Provider association
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>disabled</code> - Disable associate action
                    </li>
                    <li>
                      <code>onBefore</code> - Validate before association
                    </li>
                    <li>
                      <code>onAfter</code> - React after association
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>deleteFromProviderAction</strong> - Provider disassociation
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>disabled</code> - Disable disassociate action
                    </li>
                    <li>
                      <code>onBefore</code> - Confirm before removal
                    </li>
                    <li>
                      <code>onAfter</code> - React after removal
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
              code={`<DomainTable
  createAction={{
    onBefore: (domain) => domain.domain.length >= 3,
    onAfter: (domain) => analytics.track('Domain Created', { domain: domain.domain })
  }}
  verifyAction={{
    onBefore: (domain) => confirm('Verify ' + domain.domain + '?'),
    onAfter: (domain) => console.log('Verified domain', domain.domain)
  }}
  deleteAction={{
    onBefore: (domain) => confirm('Delete ' + domain.domain + '?'),
    onAfter: (domain) => toast.success('Domain deleted')
  }}
  associateToProviderAction={{
    onBefore: (domain, provider) => !!provider.id,
    onAfter: (domain, provider) => console.log('Associated', domain.domain, '->', provider.name)
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
                  <strong>table</strong> - Table display
                  <ul className="ml-4 list-disc">
                    <li>empty_message</li>
                    <li>columns.domain</li>
                    <li>columns.status</li>
                    <li>actions.configure_button_text</li>
                    <li>actions.view_button_text</li>
                    <li>actions.verify_button_text</li>
                    <li>actions.delete_button_text</li>
                  </ul>
                </div>
                <div>
                  <strong>create.modal</strong> - Create domain modal
                  <ul className="ml-4 list-disc">
                    <li>title</li>
                    <li>field.label</li>
                    <li>field.placeholder</li>
                    <li>field.error</li>
                    <li>actions.cancel_button_text</li>
                    <li>actions.create_button_text</li>
                  </ul>
                </div>
                <div>
                  <strong>verify.modal</strong> - Verify domain modal
                  <ul className="ml-4 list-disc">
                    <li>title</li>
                    <li>txt_record_name.label</li>
                    <li>txt_record_name.description</li>
                    <li>txt_record_content.label</li>
                    <li>txt_record_content.description</li>
                    <li>verification_status.label</li>
                    <li>verification_status.description</li>
                    <li>verification_status.pending</li>
                    <li>actions.verify_button_text</li>
                    <li>actions.delete_button_text</li>
                    <li>actions.done_button_text</li>
                    <li>errors.verification_failed</li>
                  </ul>
                </div>
                <div>
                  <strong>delete.modal</strong> - Delete confirmation
                  <ul className="ml-4 list-disc">
                    <li>title</li>
                    <li>description.pending</li>
                    <li>description.verified</li>
                    <li>actions.cancel_button_text</li>
                    <li>actions.create_button_text</li>
                  </ul>
                </div>
                <div>
                  <strong>configure.modal</strong> - Provider configuration
                  <ul className="ml-4 list-disc">
                    <li>title</li>
                    <li>description</li>
                    <li>table.empty_message</li>
                    <li>table.columns.name</li>
                    <li>table.columns.provider</li>
                    <li>table.actions.add_provider_button_text</li>
                    <li>table.actions.view_provider_button_text</li>
                    <li>actions.close_button_text</li>
                  </ul>
                </div>
                <div>
                  <strong>notifications</strong> - API requests
                  <ul className="ml-4 list-disc">
                    <li>fetch_providers_error</li>
                    <li>fetch_domains_error</li>
                    <li>domain_create_success</li>
                    <li>domain_create_error</li>
                    <li>domain_verify_success</li>
                    <li>domain_verify_error</li>
                    <li>domain_verify_verification_failed</li>
                    <li>domain_delete_success</li>
                    <li>domain_delete_error</li>
                    <li>domain_associate_provider_success</li>
                    <li>domain_associate_provider_error</li>
                    <li>domain_delete_provider_success</li>
                    <li>domain_delete_provider_error</li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<DomainTable
  customMessages={{
    header: {
      title: 'Manage Domains',
      description: 'Configure and verify organization domains',
      create_button_text: 'Add Domain'
    },
    table: {
      empty_message: 'No domains yet. Add one to begin.'
    },
    notifications: {
      domain_create: { success: 'Domain created!' },
      domain_verify: { success: 'Domain verified!' },
      domain_delete: { success: 'Domain removed.' }
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
                      <code>common</code> - Common variables for all themes
                    </li>
                    <li>
                      <code>light</code> - Light mode only variables
                    </li>
                    <li>
                      <code>dark</code> - Dark mode only variables
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>classes</strong> - CSS class overrides
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>DomainTable-header</code> - Header section container
                    </li>
                    <li>
                      <code>DomainTable-table</code> - Main table container
                    </li>
                    <li>
                      <code>DomainTable-createModal</code> - Create domain modal
                    </li>
                    <li>
                      <code>DomainTable-configureModal</code> - Configure providers modal
                    </li>
                    <li>
                      <code>DomainTable-deleteModal</code> - Delete confirmation modal
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<DomainTable
  styling={{
    variables: {
      common: { '--font-size-title': '1rem' },
      light: { '--color-primary': '#4f46e5' },
    },
    classes: {
      'DomainTable-header': 'mb-6',
      'DomainTable-table': 'rounded-lg shadow-sm',
      'DomainTable-createModal': 'max-w-md',
    }
  }}
/>`}
              language="tsx"
              title="Styling example"
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
                <strong>Note:</strong> All fields are nested under <code>create</code> property
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <strong>create.domainUrl</strong> - Domain URL validation
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>regex</code> - Custom regex pattern for domain validation
                    </li>
                    <li>
                      <code>errorMessage</code> - Custom error message when validation fails
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<DomainTable
  schema={{
    create: {
      domain: {
        // Matches subdomain or root domains like example.com, app.example.io
        regex: /^[a-z0-9.-]+\\.[a-z]{2,}$/,
        errorMessage: 'Enter a valid domain (example.com)'
      }
    }
  }}
/>`}
              language="tsx"
              title="Schema override"
            />
          </div>
        </div>
      </section>
      {/* Integration Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Complete Integration Example</h2>
        <CodeBlock
          code={`import React from 'react';
import { DomainTable } from '@auth0/universal-components-react/rwa';
// For SPA mode:
// import { DomainTable } from '@auth0/universal-components-react/spa';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Auth0ProxyProvider } from '@auth0/universal-components-react/rwa';
import { useRouter } from 'next/navigation';

function DomainsManagementPage() {
  const navigate = useNavigate();

  const handleDomainCreated = (domain) => {
    console.log('Domain created:', domain);
  };

  const handleDomainVerified = (domain) => {
    console.log('Domain verified:', domain.domain);
  };

  const handleDomainDeleted = (domain) => {
    console.log('Domain deleted:', domain.domain);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <DomainTable
        schema={{
          create: {
            domain: {
              regex: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,}$/i,
              errorMessage: 'Please enter a valid domain (e.g., example.com or subdomain.example.com)'
            }
          },
        }}
        createAction={{
          onBefore: (domain) => {
            if (!domain.domain.includes('.')) {
              alert('Please enter a valid domain with a TLD');
              return false;
            }
            return true;
          },
          onAfter: handleDomainCreated
        }}
        onOpenProvider={(provider) => {
          navigate(\`/providers/\${provider.id}\`);
        }}
        onCreateProvider={() => {
          navigate('/providers/create');
        }}
        customMessages={{
          header: {
            title: 'Domain Management',
            description: 'Add and verify domains for your organization',
            create_button_text: 'Add New Domain'
          },
          notifications: {
            domain_create: {
              success: 'Domain added successfully! Check your DNS settings to verify.',
              error: 'Failed to add domain. Please try again.'
            },
            domain_verify: {
              success: 'Domain verified successfully!',
              error: 'Domain verification failed. Please check your DNS records.'
            },
            domain_delete: {
              success: 'Domain removed from your organization.',
              error: 'Failed to remove domain.'
            }
          },
        }}
        styling={{
          variables: {
            common: {
              '--font-size-label': '12px'
            },
            light: {
              '--color-primary': '#0066cc',
              '--color-background': '#ffffff'
            },
            dark: {
              '--color-primary': '#4da3ff',
              '--color-background': '#1a1a1a'
            }
          },
          classes: {
            'DomainTable-header': 'shadow-lg rounded-xl border-b-2 border-blue-100',
            'DomainTable-table': 'min-w-full divide-y divide-gray-200',
            'DomainTable-createButton': 'bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg'
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
        <DomainsManagementPage />
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
          The <b>DomainTable</b> component is composed of smaller subcomponents and hooks. You can
          import them individually to build custom domain workflows.
        </p>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Available Subcomponents</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-sm text-blue-800 space-y-2">
              <code>DomainCreateModal</code> – Modal for creating a domain
              <br />
              <code>DomainVerifyModal</code> – Modal for verification flow
              <br />
              <code>DomainDeleteModal</code> – Confirmation modal for deletion
              <br />
              <code>DomainConfigureProvidersModal</code> – Manage provider associations
              <br />
              <code>DomainTableActionsColumn</code> – Action buttons renderer per domain row
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Available Hooks</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-sm text-blue-800 space-y-2">
              <code>useDomainTable</code> – Data + API layer (fetch, create, verify, delete,
              associate)
              <br />
              <code>useDomainTableLogic</code> – UI interaction state + handlers (modals,
              notifications)
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
