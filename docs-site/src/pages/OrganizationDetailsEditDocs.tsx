import CodeBlock from '../components/CodeBlock';
import TabbedCodeBlock from '../components/TabbedCodeBlock';

export default function OrganizationDetailsEdit() {
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
          <h1 className="text-4xl font-bold text-gray-900">OrganizationDetailsEdit Component</h1>
          <p className="text-xl text-gray-600">
            Edit organization details including name, display name, branding colors, and logo with
            built-in validation and API integration.
          </p>
        </div>
      </div>

      {/* Component Preview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Component Preview</h2>
        <div className="max-w-none flex justify-center">
          <img
            src="/img/my-organization/organization-management/organization-details-edit.png"
            alt="OrganizationDetailsEdit"
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
                Before using the <b>OrganizationDetailsEdit</b> component, ensure your tenant is
                configured with the proper APIs, applications, and permissions.
              </p>
              <p className="text-blue-800 mb-4">
                <strong>Complete setup guide:</strong>{' '}
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
              If you're using Shadcn, you can add the OrganizationDetailsEdit block directly to your
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
                code="npx shadcn@latest add https://auth0-universal-components.vercel.app/r/my-organization/organization-details-edit.json"
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
import { OrganizationDetailsEdit } from '@auth0/universal-components-react/spa';

// For Next.js/RWA applications:
// import { OrganizationDetailsEdit } from '@auth0/universal-components-react/rwa';

// For shadcn users:
// import { OrganizationDetailsEdit } from '@/auth0-ui-components/blocks/my-organization/organization-management/organization-details-edit';

export function OrganizationSettingsPage() {
  return (
    <div>
      <OrganizationDetailsEdit />
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
                <td className="px-4 py-2 text-sm text-gray-500">OrganizationDetailsEditSchemas</td>
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
                  Partial&lt;OrganizationDetailsEditMessages&gt;
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
                <td className="px-4 py-2 text-sm text-gray-500">
                  ComponentStyling&lt;OrganizationEditClasses&gt;
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
                  saveAction
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  ComponentAction&lt;OrganizationPrivate&gt;
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for save action including onBefore and onAfter hooks
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  cancelAction
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  ComponentAction&lt;OrganizationPrivate&gt;
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for cancel action including onBefore and onAfter hooks
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  backButton
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">OrganizationEditBackButton</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Configuration for back button including icon and onClick handler
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
interface OrganizationDetailsEditProps {
  schema?: OrganizationDetailsEditSchemas;
  customMessages?: Partial<OrganizationDetailsEditMessages>;
  styling?: ComponentStyling<OrganizationDetailsEditClasses>;
  readOnly?: boolean;
  hideHeader?: boolean;
  saveAction?: ComponentAction<OrganizationPrivate>;
  cancelAction?: ComponentAction<OrganizationPrivate>;
  backButton?: {
    icon?: LucideIcon;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  };
}

// Action interface
interface ComponentAction<T> {
  disabled?: boolean;
  onBefore?: (data: T) => boolean | Promise<boolean>;
  onAfter?: (data: T) => void | Promise<void>;
}`}
              language="typescript"
              title="Complete TypeScript definitions"
            />
          </div>
        </details>
      </section>

      <hr />

      {/* Advanced Configuration */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Advanced Configuration</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Actions</h3>
            <p className="text-gray-600 mb-4">
              Handle form events with lifecycle callbacks. All action properties are optional:
            </p>

            {/* Available Action Options */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Available Action Properties</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <strong>saveAction</strong> - Save form lifecycle
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>disabled?: boolean</code> - Disable save button
                    </li>
                    <li>
                      <code>
                        onBefore?: (organization: Organization) → boolean | Promise&lt;boolean&gt;
                      </code>
                    </li>
                    <li>
                      <code>
                        onAfter?: (organization: Organization) → void | Promise&lt;void&gt;
                      </code>
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>cancelAction</strong> - Discard form data
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>disabled?: boolean</code> - Disable discard button
                    </li>
                    <li>
                      <code>
                        onBefore?: (organization: Organization) → boolean | Promise&lt;boolean&gt;
                      </code>
                    </li>
                    <li>
                      <code>
                        onAfter?: (organization: Organization) → void | Promise&lt;void&gt;
                      </code>
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>backButton</strong> - Header back button
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>icon?: LucideIcon</code> - Icon component
                    </li>
                    <li>
                      <code>onClick: (e: MouseEvent) → void</code> - Required handler
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
              code={`<OrganizationDetailsEdit
  saveAction={{
    onBefore: (organization) => {
      // Add your custom validation or confirmation logic here
      return confirm('Save changes to ' + organization.display_name + '?');
    },
    onAfter: (organization) => {
      // Track organization update event or redirect
      analytics.track('Organization Updated', {
        organizationId: organization.id,
      });
      navigate('/organizations');
    }
  }}
  backButton={{
    onClick: () => navigate('/organizations')
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
                  <strong>details.sections.settings</strong> - Settings section
                  <ul className="ml-4 list-disc">
                    <li>title</li>
                    <li>fields.name.label</li>
                    <li>fields.name.placeholder</li>
                    <li>fields.name.helper_text</li>
                    <li>fields.display_name.* (same)</li>
                  </ul>
                </div>
                <div>
                  <strong>details.sections.branding</strong> - Branding section
                  <ul className="ml-4 list-disc">
                    <li>title</li>
                    <li>fields.logo.label</li>
                    <li>fields.logo.helper_text</li>
                    <li>fields.primary_color.* (same)</li>
                    <li>fields.page_background_color.*</li>
                  </ul>
                </div>
                <div>
                  <strong>details</strong> - Form actions
                  <ul className="ml-4 list-disc">
                    <li>submit_button_label</li>
                    <li>cancel_button_label</li>
                    <li>unsaved_changes_text</li>
                  </ul>
                </div>
                <div>
                  <strong>root level</strong> - API responses
                  <ul className="ml-4 list-disc">
                    <li>save_organization_changes_message</li>
                    <li>organization_changes_error_message</li>
                    <li>organization_changes_error_message_generic</li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<OrganizationDetailsEdit
  customMessages={{
    header: {
      title: 'Configure {organizationName}',
      back_button_text: 'Back to Dashboard'
    },
    details: {
      sections: {
        settings: {
          title: 'Company Information',
          fields: {
            display_name: {
              label: 'Company Name',
              helper_text: 'This will be shown to your users'
            }
          }
        }
      },
      submit_button_label: 'Update Organization'
    },
    save_organization_changes_message: 'Company settings updated successfully!'
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
                      <code>OrganizationDetails_Card?: string</code> - Main card container
                    </li>
                    <li>
                      <code>OrganizationDetails_FormActions?: string</code> - Button container
                    </li>
                    <li>
                      <code>OrganizationDetails_SettingsDetails?: string</code> - Settings section
                    </li>
                    <li>
                      <code>OrganizationDetails_BrandingDetails?: string</code> - Branding section
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<OrganizationDetailsEdit
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
      OrganizationDetails_Card: 'shadow-xl rounded-xl border-2',
      OrganizationDetails_FormActions: 'flex gap-4 pt-8'
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
                <strong>Note:</strong> All fields are nested under <code>details</code> property
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <strong>details.name</strong> - Organization name validation
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>required?: boolean</code> (default: true)
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
                  <strong>details.displayName</strong> - Display name validation
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>required?: boolean</code> (default: true)
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
                  <strong>details.color</strong> - Branding color validation
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>regex?: RegExp</code> (default: hex color)
                    </li>
                    <li>
                      <code>errorMessage?: string</code>
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>details.logoURL</strong> - Logo URL validation
                  <ul className="ml-4 list-disc">
                    <li>
                      <code>regex?: RegExp</code>
                    </li>
                    <li>
                      <code>errorMessage?: string</code>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<OrganizationDetailsEdit
  schema={{
    details: {
      name: {
        minLength: 3,
        maxLength: 50,
        regex: /^[a-zA-Z0-9-_]+$/,
        errorMessage: "Name must be alphanumeric with hyphens/underscores"
      },
      logoURL: {
        regex: /^https:\\/\\/.+\\.(jpg|jpeg|png|svg)$/i,
        errorMessage: "Must be a valid HTTPS image URL"
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
import { OrganizationDetailsEdit } from '@auth0/universal-components-react/spa';
import { Auth0Provider } from '@auth0/auth0-react';
import { Auth0ComponentProvider } from '@auth0/universal-components-react/spa';
import { useNavigate } from 'react-router-dom';

function OrganizationEditPage() {
  const navigate = useNavigate();

  const handleSaveSuccess = (organization) => {
    console.log('Organization updated:', organization);
    navigate('/organizations');
  };

  const handleCancel = () => {
    navigate('/organizations');
  };

  const handleBackButton = () => {
    navigate('/organizations');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <OrganizationDetailsEdit
        schema={{
          details: {
            name: {
              required: true,
              minLength: 3,
              maxLength: 50,
              regex: /^[a-zA-Z0-9-_]+$/,
              errorMessage: "Name must be alphanumeric with hyphens and underscores only"
            },
            displayName: {
              required: true,
              minLength: 1,
              maxLength: 100
            }
          }
        }}
        saveAction={{
          onBefore: (organization) => {
            return confirm(\`Save changes to \${organization.display_name || organization.name}?\`);
          },
          onAfter: handleSaveSuccess
        }}
        cancelAction={{
          onAfter: handleCancel
        }}
        backButton={{
          onClick: handleBackButton
        }}
        customMessages={{
          header: {
            title: 'Edit Organization: {organizationName}'
          },
          save_organization_changes_message: 'Organization details updated successfully!',
          organization_changes_error_message: 'Failed to update organization. Please try again.'
        }}
        styling={{
          variables: {
            common: {
              '--color-primary': '#059669'
            }
          },
          classes: {
            'OrganizationDetailsEdit-card': 'shadow-xl rounded-lg'
          }
        }}
      />
    </div>
  );
}

export default function App() {
  const authDetails = {
    domain: "your-domain.auth0.com",
  };
  return (
    <Auth0Provider
      domain={authDetails.domain}
      clientId="your-client-id"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <Auth0ComponentProvider authDetails={authDetails}>
        <OrganizationEditPage />
      </Auth0ComponentProvider>
    </Auth0Provider>
  );
}`}
          language="tsx"
          title="Complete implementation example (SPA)"
        />
      </section>

      <hr />

      {/* Advanced Customization */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Advanced Customization</h2>
        <p className="text-gray-600">
          The <b>OrganizationDetailsEdit</b> component is composed of smaller subcomponents and
          hooks. You can import them individually to build custom organization editing workflows if
          you use shadcn.
        </p>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Available Subcomponents</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-sm text-blue-800 space-y-2">
              <code>OrganizationDetails</code> – Main organization form with settings and branding
              <br />
              <code>SettingsDetails</code> – Name and display name fields
              <br />
              <code>BrandingDetails</code> – Logo and color customization fields
              <br />
              <code>OrganizationDelete</code> – Organization deletion UI (future)
              <br />
              <code>OrganizationDeleteModal</code> – Confirmation modal for deletion (future)
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Available Hooks</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-sm text-blue-800 space-y-2">
              <code>useOrganizationDetailsEdit</code> – Data fetching, form management, and API
              updates
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
