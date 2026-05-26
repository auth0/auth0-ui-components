import CodeBlock from '../components/CodeBlock';
import TabbedCodeBlock from '../components/TabbedCodeBlock';

export default function MemberDetailDocs() {
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
          <h1 className="text-4xl font-bold text-gray-900">OrganizationMemberDetail Component</h1>
          <p className="text-xl text-gray-600">
            View and manage an individual organization member — user profile, assigned roles, and
            removal — in a two-tab layout with full lifecycle controls.
          </p>
        </div>
      </div>

      {/* Component Preview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Component Preview</h2>
        <div className="max-w-none flex justify-center">
          <img
            src="/img/my-organization/member-management/member-detail.png"
            alt="OrganizationMemberDetail"
            width={700}
            height={500}
          />
        </div>
        <div className="max-w-none flex justify-center">
          <img
            src="/img/my-organization/member-management/member-detail-roles.png"
            alt="OrganizationMemberDetail Roles Tab"
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
                Before using the <b>OrganizationMemberDetail</b> component, ensure your tenant is
                configured with the proper APIs, applications, and permissions.
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

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Option 2: Shadcn CLI</h3>
            <p className="text-gray-600 mb-4">
              If you're using Shadcn, you can add the OrganizationMemberDetail block directly to
              your project:
            </p>
            <CodeBlock
              code="npx shadcn@latest add @auth0/organization-member-detail"
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
import { OrganizationMemberDetail } from '@auth0/universal-components-react';

// For shadcn users:
// import { OrganizationMemberDetail } from '@/components/auth0/my-organization/organization-member-detail';

export function MemberDetailPage({ userId }: { userId: string }) {
  return (
    <OrganizationMemberDetail
      userId={userId}
      onBack={() => history.back()}
    />
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
              {/* Required */}
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Required
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  userId <span className="text-red-500">*</span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">string</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">—</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Auth0 user ID of the member to display (e.g. <code>auth0|64abc...</code>)
                </td>
              </tr>
              {/* Display */}
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Display
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  onBack
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">{'() => void'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">—</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Called when the user clicks the back button in the header
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  readOnly
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">boolean</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">false</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Disables role management and member removal actions
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
              {/* Action */}
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Action
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  removeFromOrgAction
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">ComponentAction&lt;string&gt;</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">—</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Lifecycle hooks for member removal (input is the userId)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  assignRolesAction
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  ComponentAction&lt;{'{ userId: string; roleIds: string[] }'}&gt;
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">—</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Lifecycle hooks for role assignment
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  removeRolesAction
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  ComponentAction&lt;{'{ userId: string; roleIds: string[] }'}&gt;
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">—</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Lifecycle hooks for role removal
                </td>
              </tr>
              {/* Customization */}
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Customization
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  customMessages
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Partial&lt;OrganizationMemberDetailMessages&gt;
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{'{}'}</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Override any default UI text or translations
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
                  CSS variables and class overrides
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500">
          <span className="text-red-500">*</span> Required
        </p>

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
              code={`interface OrganizationMemberDetailProps {
  userId: string;                     // required
  onBack?: () => void;
  readOnly?: boolean;
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  styling?: ComponentStyling;
  removeFromOrgAction?: ComponentAction<string>;
  assignRolesAction?: ComponentAction<{ userId: string; roleIds: string[] }>;
  removeRolesAction?: ComponentAction<{ userId: string; roleIds: string[] }>;
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
      </section>

      <hr />

      {/* Advanced Configuration */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Advanced Configuration</h2>
        <div className="space-y-8">
          {/* Actions */}
          <div>
            <h3 className="text-lg font-medium mb-4">Actions</h3>
            <p className="text-gray-600 mb-4">
              Intercept member and role lifecycle events with <code>onBefore</code> and{' '}
              <code>onAfter</code> hooks. <code>onBefore</code> can return <code>false</code> to
              cancel the operation.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Available Action Properties</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
                <div>
                  <strong>removeFromOrgAction</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>
                      <code>disabled</code> — hide remove button
                    </li>
                    <li>
                      <code>onBefore(userId)</code> — confirm before removing
                    </li>
                    <li>
                      <code>onAfter(userId)</code> — navigate away or refresh
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>assignRolesAction</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>
                      <code>disabled</code> — hide assign button
                    </li>
                    <li>
                      <code>onBefore({'{userId, roleIds}'})</code> — validate selection
                    </li>
                    <li>
                      <code>onAfter({'{userId, roleIds}'})</code> — audit log
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>removeRolesAction</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>
                      <code>disabled</code> — hide remove role buttons
                    </li>
                    <li>
                      <code>onBefore({'{userId, roleIds}'})</code> — confirm
                    </li>
                    <li>
                      <code>onAfter({'{userId, roleIds}'})</code> — audit log
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<OrganizationMemberDetail
  userId={userId}
  onBack={() => router.push('/members')}
  removeFromOrgAction={{
    onBefore: async (removedUserId) => {
      // Return false to cancel
      return await confirmDialog(\`Remove this member from the organization?\`);
    },
    onAfter: () => {
      router.push('/members');
    },
  }}
  assignRolesAction={{
    onAfter: ({ userId, roleIds }) => {
      auditLog.record({ action: 'roles_assigned', userId, roleIds });
    },
  }}
  removeRolesAction={{
    onAfter: ({ userId, roleIds }) => {
      auditLog.record({ action: 'roles_removed', userId, roleIds });
    },
  }}
/>`}
              language="tsx"
              title="Action hook usage"
            />

            <div className="mt-6 space-y-6">
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">removeFromOrgAction</h4>
                <p className="text-gray-600 mb-3 text-sm">
                  Called when a member is removed from the organization. Use <code>onBefore</code>{' '}
                  to show a confirmation dialog; the userId string is passed to both hooks.
                </p>
                <CodeBlock
                  code={`<OrganizationMemberDetail
  userId={userId}
  removeFromOrgAction={{
    onBefore: async (removedUserId) => {
      // Return false to cancel the removal
      return await confirmDialog(\`Remove member \${removedUserId} from the organization?\`);
    },
    onAfter: (removedUserId) => {
      router.push('/members');
      auditLog.record({ action: 'member_removed', userId: removedUserId });
    },
  }}
/>`}
                  language="tsx"
                  title="removeFromOrgAction"
                />
              </div>

              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">assignRolesAction</h4>
                <p className="text-gray-600 mb-3 text-sm">
                  Called after one or more roles are assigned to the member. Receives an object with{' '}
                  <code>userId</code> and <code>roleIds</code> (array of assigned role IDs).
                </p>
                <CodeBlock
                  code={`<OrganizationMemberDetail
  userId={userId}
  assignRolesAction={{
    onAfter: ({ userId: memberId, roleIds }) => {
      auditLog.record({ action: 'roles_assigned', userId: memberId, roleIds });
    },
  }}
/>`}
                  language="tsx"
                  title="assignRolesAction"
                />
              </div>

              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">removeRolesAction</h4>
                <p className="text-gray-600 mb-3 text-sm">
                  Called after one or more roles are removed from the member. Receives an object
                  with <code>userId</code> and <code>roleIds</code> (array of removed role IDs).
                </p>
                <CodeBlock
                  code={`<OrganizationMemberDetail
  userId={userId}
  removeRolesAction={{
    onBefore: ({ roleIds }) => {
      // Return false to cancel
      return roleIds.length > 0;
    },
    onAfter: ({ userId: memberId, roleIds }) => {
      auditLog.record({ action: 'roles_removed', userId: memberId, roleIds });
    },
  }}
/>`}
                  language="tsx"
                  title="removeRolesAction"
                />
              </div>
            </div>
          </div>

          {/* Custom Messages */}
          <div>
            <h3 className="text-lg font-medium mb-4">Custom Messages</h3>
            <p className="text-gray-600 mb-4">
              Override any default text. All fields are optional and fall back to built-in defaults.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Available Messages</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
                <div>
                  <strong>member.detail</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>back_button</li>
                    <li>tabs.details</li>
                    <li>tabs.roles</li>
                  </ul>
                </div>
                <div>
                  <strong>member.detail.user_details</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>title</li>
                    <li>name / email</li>
                    <li>phone_number / provider</li>
                    <li>created_at / last_login</li>
                  </ul>
                </div>
                <div>
                  <strong>member.detail.actions.remove_from_org</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>title / description / button</li>
                    <li>modal.title / modal.description</li>
                    <li>modal.cancel_button / modal.confirm_button</li>
                    <li>success</li>
                  </ul>
                </div>
                <div>
                  <strong>member.detail.roles</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>title / description</li>
                    <li>assign_button</li>
                    <li>table.name / table.description</li>
                    <li>table.empty_message</li>
                    <li>table.remove_button_label</li>
                  </ul>
                </div>
                <div>
                  <strong>member.detail.roles.assign_modal</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>title / description</li>
                    <li>roles_label / roles_placeholder</li>
                    <li>submit_button / cancel_button</li>
                    <li>no_roles_available</li>
                  </ul>
                </div>
                <div>
                  <strong>member.detail.error</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>fetch_failed</li>
                    <li>fetch_roles_failed</li>
                    <li>remove_from_org_failed</li>
                    <li>assign_role_failed</li>
                    <li>remove_role_failed</li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<OrganizationMemberDetail
  userId={userId}
  customMessages={{
    member: {
      detail: {
        back_button: 'Back to Members',
        tabs: { details: 'Profile', roles: 'Permissions' },
        roles: {
          assign_button: 'Add Permission',
          table: { empty_message: 'No permissions assigned yet.' },
        },
        actions: {
          remove_from_org: {
            title: 'Remove from Organization',
            button: 'Remove',
            modal: {
              title: 'Remove Member',
              confirm_button: 'Yes, Remove',
            },
          },
        },
      },
    },
  }}
/>`}
              language="tsx"
              title="Custom messages example"
            />
          </div>

          {/* Custom Styling */}
          <div>
            <h3 className="text-lg font-medium mb-4">Custom Styling</h3>
            <p className="text-gray-600 mb-4">
              Customize appearance with CSS variables and class overrides. Supports light/dark mode.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Available Class Overrides</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <strong>variables</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>
                      <code>common</code> — applied to both themes
                    </li>
                    <li>
                      <code>light</code> — light mode only
                    </li>
                    <li>
                      <code>dark</code> — dark mode only
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>classes</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>
                      <code>OrganizationMemberDetail-root</code>
                    </li>
                    <li>
                      <code>OrganizationMemberDetail-header</code>
                    </li>
                    <li>
                      <code>OrganizationMemberDetail-tabs</code>
                    </li>
                    <li>
                      <code>OrganizationMemberDetail-detailsTab</code>
                    </li>
                    <li>
                      <code>OrganizationMemberDetail-rolesTab</code>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<OrganizationMemberDetail
  userId={userId}
  styling={{
    variables: {
      light: { '--color-primary': '#4f46e5' },
      dark: { '--color-primary': '#818cf8' },
    },
    classes: {
      'OrganizationMemberDetail-root': 'max-w-3xl mx-auto',
      'OrganizationMemberDetail-header': 'mb-6',
      'OrganizationMemberDetail-rolesTab': 'mt-4',
    },
  }}
/>`}
              language="tsx"
              title="Styling example"
            />
          </div>
        </div>
      </section>

      {/* Complete Integration Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Complete Integration Example</h2>
        <CodeBlock
          code={`import { OrganizationMemberDetail } from '@auth0/universal-components-react';
import { useNavigate, useParams } from 'react-router-dom';

export function MemberDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  return (
    <OrganizationMemberDetail
      userId={userId!}
      onBack={() => navigate('/members')}
      removeFromOrgAction={{
        onAfter: () => navigate('/members'),
      }}
      assignRolesAction={{
        onAfter: ({ roleIds }) => {
          console.log(\`Assigned \${roleIds.length} role(s)\`);
        },
      }}
      removeRolesAction={{
        onAfter: ({ roleIds }) => {
          console.log(\`Removed \${roleIds.length} role(s)\`);
        },
      }}
      customMessages={{
        member: {
          detail: {
            back_button: 'Back to Members',
            roles: { assign_button: 'Assign Roles' },
          },
        },
      }}
      styling={{
        variables: {
          light: { '--color-primary': '#4f46e5' },
          dark: { '--color-primary': '#818cf8' },
        },
      }}
    />
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
          The <b>OrganizationMemberDetail</b> component is composed of smaller subcomponents and
          hooks. You can import them individually to build custom workflows.
        </p>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Available Subcomponents</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-sm text-blue-800 space-y-2">
              <code>OrganizationMemberEditDetailsTab</code> — User profile card + remove-from-org
              danger zone
              <br />
              <code>OrganizationMemberEditRolesTab</code> — Role table with assign and remove
              controls
              <br />
              <code>OrganizationMemberAssignRolesModal</code> — Role selector modal
              <br />
              <code>OrganizationMemberRemoveRoleModal</code> — Single-role removal confirmation
              <br />
              <code>MemberRemoveFromOrgModal</code> — Member removal confirmation modal
              <br />
              <code>OrganizationMemberDetailView</code> — Stateless view layer (bring your own data
              via <code>useOrganizationMemberDetail</code>)
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Available Hooks</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-sm text-blue-800 space-y-2">
              <code>useOrganizationMemberDetail</code> — Full data + interaction layer: member
              query, role queries, modal state, and all event handlers
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
