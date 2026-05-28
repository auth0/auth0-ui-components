import CodeBlock from '../components/CodeBlock';
import TabbedCodeBlock from '../components/TabbedCodeBlock';

export default function MemberManagementDocs() {
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
          <h1 className="text-4xl font-bold text-gray-900">
            OrganizationMemberManagement Component
          </h1>
          <p className="text-xl text-gray-600">
            Manage organization members and invitations in a tabbed interface — view the member
            list, invite new members, and manage pending invitations with full lifecycle controls.
          </p>
        </div>
      </div>

      {/* Component Preview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Component Preview</h2>
        {/* TODO: add screenshot at /img/my-organization/member-management/member-management.png */}
        <div className="max-w-none flex justify-center">
          <img
            src="/img/my-organization/member-management/member-management.png"
            alt="OrganizationMemberManagement"
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
                Before using the <b>OrganizationMemberManagement</b> component, ensure your tenant
                is configured with the proper APIs, applications, and permissions.
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
              If you're using Shadcn, you can add the OrganizationMemberManagement block directly to
              your project:
            </p>
            <CodeBlock
              code="npx shadcn@latest add @auth0/organization-member-management"
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
import { OrganizationMemberManagement } from '@auth0/universal-components-react';

// For shadcn users:
// import { OrganizationMemberManagement } from '@/components/auth0/my-organization/organization-member-management';

export function MembersPage() {
  return (
    <div>
      <OrganizationMemberManagement />
    </div>
  );
}`}
          language="tsx"
          title="Basic implementation"
        />
      </section>

      {/* Props */}
      <section className="space-y-10">
        <h2 className="text-2xl font-semibold text-gray-900">Props</h2>

        {/* Display props */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Display props</h3>
          <p className="text-gray-600">
            Display props control how the component renders without affecting its behavior. Use
            these to hide sections or enable read-only mode.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Prop
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    hideHeader
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code>boolean</code>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Hides the component header section. Default: <code>false</code>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    readOnly
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code>boolean</code>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Disables all mutation actions (invite, revoke, resend). Default:{' '}
                    <code>false</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action props */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Action props</h3>
          <p className="text-gray-600">
            Action props handle user interactions and define what happens when users perform member
            and invitation operations. Use lifecycle hooks (<code>onBefore</code>,{' '}
            <code>onAfter</code>) to integrate with your application's routing and analytics.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Prop
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    createInvitationAction
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code>ComponentAction&lt;CreateInvitationInput, MemberInvitation&gt;</code>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Lifecycle hooks for invitation creation.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    revokeInvitationAction
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code>ComponentAction&lt;MemberInvitation&gt;</code>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Lifecycle hooks for invitation revocation.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    resendInvitationAction
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code>ComponentAction&lt;MemberInvitation, MemberInvitation&gt;</code>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Lifecycle hooks for revoke-and-resend.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    viewMemberDetailsAction
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code>ComponentAction&lt;string&gt;</code>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Lifecycle hooks for viewing member details. Input is the userId. Use{' '}
                    <code>onAfter</code> to navigate to the member detail page.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    removeFromOrgAction
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code>ComponentAction&lt;string&gt;</code>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Lifecycle hooks for member removal. Input is the userId.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    assignRolesAction
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code>ComponentAction&lt;{'{ userId: string; roleIds: string[] }'}&gt;</code>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Lifecycle hooks for role assignment to members.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Per-action examples */}
          <div className="space-y-6 pt-2">
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-2">createInvitationAction</h4>
              <CodeBlock
                code={`<OrganizationMemberManagement
  createInvitationAction={{
    onBefore: async (input) => {
      // Return false to cancel — e.g. validate against a blocklist
      return !blocklist.includes(input.invitees[0].email);
    },
    onAfter: (input, createdInvitation) => {
      analytics.track('Invitation Sent', { email: input.invitees[0].email });
    },
  }}
/>`}
                language="tsx"
                title="createInvitationAction"
              />
            </div>

            <div>
              <h4 className="text-base font-medium text-gray-900 mb-2">revokeInvitationAction</h4>
              <CodeBlock
                code={`<OrganizationMemberManagement
  revokeInvitationAction={{
    onAfter: () => refetchMemberCount(),
  }}
/>`}
                language="tsx"
                title="revokeInvitationAction"
              />
            </div>

            <div>
              <h4 className="text-base font-medium text-gray-900 mb-2">resendInvitationAction</h4>
              <CodeBlock
                code={`<OrganizationMemberManagement
  resendInvitationAction={{
    onAfter: (invitation) => {
      toast.success(\`Invitation resent to \${invitation.invitee.email}\`);
    },
  }}
/>`}
                language="tsx"
                title="resendInvitationAction"
              />
            </div>

            <div>
              <h4 className="text-base font-medium text-gray-900 mb-2">viewMemberDetailsAction</h4>
              <CodeBlock
                code={`<OrganizationMemberManagement
  viewMemberDetailsAction={{
    onAfter: (userId) => {
      // Navigate to the OrganizationMemberDetail page
      navigate(\`/members/\${userId}\`);
    },
  }}
/>`}
                language="tsx"
                title="viewMemberDetailsAction"
              />
            </div>

            <div>
              <h4 className="text-base font-medium text-gray-900 mb-2">removeFromOrgAction</h4>
              <CodeBlock
                code={`<OrganizationMemberManagement
  removeFromOrgAction={{
    onBefore: async (userId) => {
      return await confirm(\`Remove member \${userId} from the organization?\`);
    },
    onAfter: () => navigate('/members'),
  }}
/>`}
                language="tsx"
                title="removeFromOrgAction"
              />
            </div>

            <div>
              <h4 className="text-base font-medium text-gray-900 mb-2">assignRolesAction</h4>
              <CodeBlock
                code={`<OrganizationMemberManagement
  assignRolesAction={{
    onAfter: ({ userId, roleIds }) => {
      auditLog.record({ action: 'roles_assigned', userId, roleIds });
    },
  }}
/>`}
                language="tsx"
                title="assignRolesAction"
              />
            </div>
          </div>
        </div>

        {/* Customization props */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Customization props</h3>
          <p className="text-gray-600">
            Customization props let you override default text and apply CSS variables or class names
            to match your application's design system.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Prop
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    customMessages
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code>Partial&lt;OrganizationMemberManagementMessages&gt;</code>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Override any default UI text or translations. Default: <code>{'{}'}</code>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    styling
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code>ComponentStyling</code>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    CSS variables and class overrides. Default:{' '}
                    <code>{'{ variables: {}, classes: {} }'}</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
              code={`interface OrganizationMemberManagementProps {
  hideHeader?: boolean;
  readOnly?: boolean;
  customMessages?: Partial<OrganizationMemberManagementMessages>;
  styling?: ComponentStyling;
  createInvitationAction?: ComponentAction<CreateInvitationInput, MemberInvitation>;
  revokeInvitationAction?: ComponentAction<MemberInvitation>;
  resendInvitationAction?: ComponentAction<MemberInvitation, MemberInvitation>;
  viewMemberDetailsAction?: ComponentAction<string>;
  assignRolesAction?: ComponentAction<{ userId: string; roleIds: string[] }>;
  removeFromOrgAction?: ComponentAction<string>;
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
              Intercept invitation lifecycle events with <code>onBefore</code> and{' '}
              <code>onAfter</code> hooks. All action properties are optional. <code>onBefore</code>{' '}
              can return <code>false</code> to cancel the operation.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Available Action Properties</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
                <div>
                  <strong>createInvitationAction</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>
                      <code>disabled</code> — hide invite button
                    </li>
                    <li>
                      <code>onBefore</code> — validate input
                    </li>
                    <li>
                      <code>onAfter</code> — react to new invitation
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>revokeInvitationAction</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>
                      <code>disabled</code> — hide revoke option
                    </li>
                    <li>
                      <code>onBefore</code> — confirm before revoke
                    </li>
                    <li>
                      <code>onAfter</code> — react after revoke
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>resendInvitationAction</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>
                      <code>disabled</code> — hide resend option
                    </li>
                    <li>
                      <code>onBefore</code> — confirm before resend
                    </li>
                    <li>
                      <code>onAfter</code> — react after resend
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>viewMemberDetailsAction</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>
                      <code>disabled</code> — hide view details button
                    </li>
                    <li>
                      <code>onAfter(userId)</code> — analytics or side effects after navigation
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>removeFromOrgAction</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>
                      <code>disabled</code> — hide remove button
                    </li>
                    <li>
                      <code>onBefore(userId)</code> — confirm before removal
                    </li>
                    <li>
                      <code>onAfter(userId)</code> — redirect or refresh
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
              </div>
            </div>

            <CodeBlock
              code={`<OrganizationMemberManagement
  createInvitationAction={{
    onBefore: async (input) => {
      // Return false to cancel
      return !blocklist.includes(input.invitees[0].email);
    },
    onAfter: (input, createdInvitation) => {
      analytics.track('Invitation Sent', { email: input.invitees[0].email });
    },
  }}
  revokeInvitationAction={{
    onAfter: () => refetchMemberCount(),
  }}
  resendInvitationAction={{
    onAfter: (invitation) => {
      toast.success(\`Invitation resent to \${invitation.invitee.email}\`);
    },
  }}
  viewMemberDetailsAction={{
    onAfter: (userId) => {
      analytics.track('Member Details Viewed', { userId });
    },
  }}
  removeFromOrgAction={{
    onBefore: async (userId) => {
      return await confirmDialog(\`Remove member \${userId} from the organization?\`);
    },
    onAfter: (userId) => {
      auditLog.record({ action: 'member_removed', userId });
    },
  }}
  assignRolesAction={{
    onAfter: ({ userId, roleIds }) => {
      auditLog.record({ action: 'roles_assigned', userId, roleIds });
    },
  }}
/>`}
              language="tsx"
              title="Action hook usage"
            />
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
                  <strong>header</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>title</li>
                    <li>description</li>
                  </ul>
                </div>
                <div>
                  <strong>tabs</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>members</li>
                    <li>invitations</li>
                  </ul>
                </div>
                <div>
                  <strong>invitation.table</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>columns.email / status / inviter</li>
                    <li>columns.created_at / expires_at / roles</li>
                    <li>empty_message</li>
                    <li>search_placeholder</li>
                    <li>filter_by_role / all_roles</li>
                    <li>status_pending / status_expired</li>
                  </ul>
                </div>
                <div>
                  <strong>invitation.create</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>title / description</li>
                    <li>email_label / email_placeholder</li>
                    <li>roles_label / provider_label</li>
                    <li>submit_button / cancel_button</li>
                  </ul>
                </div>
                <div>
                  <strong>invitation.details</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>title</li>
                    <li>email_label / status_label</li>
                    <li>roles_label / provider_label</li>
                    <li>copy_url_button</li>
                    <li>revoke_button / resend_button</li>
                  </ul>
                </div>
                <div>
                  <strong>invitation.error / success</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>error.fetch_failed</li>
                    <li>error.create_failed</li>
                    <li>error.revoke_failed</li>
                    <li>success.url_copied</li>
                    <li>success.invitation_resent</li>
                  </ul>
                </div>
                <div>
                  <strong>member.table</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>columns.name / roles / last_login</li>
                    <li>empty_message</li>
                    <li>search_placeholder</li>
                    <li>filter_by_role / all_roles</li>
                  </ul>
                </div>
                <div>
                  <strong>member.actions</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>assign_roles / remove_from_org</li>
                  </ul>
                </div>
                <div>
                  <strong>member.assign_roles</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>title / description</li>
                    <li>roles_label / roles_placeholder</li>
                    <li>submit_button / cancel_button</li>
                  </ul>
                </div>
                <div>
                  <strong>member.remove_from_org</strong>
                  <ul className="ml-4 list-disc mt-1">
                    <li>title / description</li>
                    <li>confirm_button / cancel_button</li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<OrganizationMemberManagement
  customMessages={{
    header: {
      title: 'Team Members',
      description: 'Manage who has access to your organization',
    },
    tabs: {
      members: 'Members',
      invitations: 'Pending Invites',
    },
    member: {
      table: {
        empty_message: 'No members yet.',
        search_placeholder: 'Search by name or email...',
        filter_by_role: 'Filter by Role',
      },
      actions: {
        assign_roles: 'Assign Roles',
        remove_from_org: 'Remove',
      },
      assign_roles: {
        title: 'Assign Roles',
        submit_button: 'Assign',
      },
      remove_from_org: {
        title: 'Remove from Organization',
        confirm_button: 'Yes, Remove',
      },
    },
    invitation: {
      table: {
        empty_message: 'No pending invitations.',
        search_placeholder: 'Search by email...',
      },
      create: {
        title: 'Invite a team member',
        submit_button: 'Send Invite',
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
                      <code>OrganizationMemberManagement-root</code>
                    </li>
                    <li>
                      <code>OrganizationMemberManagement-header</code>
                    </li>
                    <li>
                      <code>OrganizationMemberManagement-tabs</code>
                    </li>
                    <li>
                      <code>OrganizationInvitationTab-table</code>
                    </li>
                    <li>
                      <code>OrganizationInvitationTab-createModal</code>
                    </li>
                    <li>
                      <code>OrganizationInvitationTab-detailsModal</code>
                    </li>
                    <li>
                      <code>OrganizationInvitationTab-revokeModal</code>
                    </li>
                    <li>
                      <code>OrganizationInvitationTab-revokeResendModal</code>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <CodeBlock
              code={`<OrganizationMemberManagement
  styling={{
    variables: {
      light: { '--color-primary': '#4f46e5' },
      dark: { '--color-primary': '#818cf8' },
    },
    classes: {
      'OrganizationMemberManagement-root': 'rounded-xl border shadow-sm',
      'OrganizationMemberManagement-header': 'mb-4',
      'OrganizationInvitationTab-table': 'mt-4',
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
          code={`import { OrganizationMemberManagement } from '@auth0/universal-components-react';

export function MembersPage() {
  return (
    <OrganizationMemberManagement
      createInvitationAction={{
        onBefore: async (input) => {
          // Validate before submitting to Auth0
          return !blocklist.includes(input.email);
        },
        onAfter: (invitation) => {
          analytics.track('Invitation Sent', { email: invitation.invitee.email });
        },
      }}
      revokeInvitationAction={{
        onAfter: () => refetchMemberCount(),
      }}
      customMessages={{
        header: { title: 'Team Members' },
        tabs: { invitations: 'Pending Invites' },
        invitation: {
          table: { empty_message: 'No pending invitations.' },
          create: { submit_button: 'Send Invite' },
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
          The <b>OrganizationMemberManagement</b> component is composed of smaller subcomponents and
          hooks. You can import them individually to build custom workflows.
        </p>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Available Subcomponents</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-sm text-blue-800 space-y-2">
              <strong>Member Tab:</strong>
              <br />
              <code>OrganizationMemberTable</code> — Member list with sorting, filtering, role
              badges, and actions menu
              <br />
              <code>OrganizationMemberAssignRolesModal</code> — Modal for assigning roles to members
              <br />
              <code>OrganizationMemberRemoveFromOrgModal</code> — Confirmation modal for member
              removal
              <br />
              <br />
              <strong>Invitation Tab:</strong>
              <br />
              <code>OrganizationInvitationTable</code> — Invitation list with sorting, filtering,
              and pagination
              <br />
              <code>OrganizationInvitationCreateModal</code> — Modal for sending new invitations
              <br />
              <code>OrganizationInvitationDetailsModal</code> — Drawer showing full invitation
              details with copy URL / resend / revoke
              <br />
              <code>OrganizationInvitationRevokeModal</code> — Confirmation modal for revoke and
              revoke-and-resend
              <br />
              <br />
              <strong>View Layer:</strong>
              <br />
              <code>OrganizationMemberManagementView</code> — Stateless view layer (bring your own
              data via <code>useOrganizationMemberManagement</code>)
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Available Hooks</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-sm text-blue-800 space-y-2">
              <code>useOrganizationMemberManagement</code> — Full data + interaction layer: tab
              state, invitation queries, modal state, and all event handlers
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
