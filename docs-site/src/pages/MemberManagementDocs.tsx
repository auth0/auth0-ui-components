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

      {/* Early Access Notice */}
      <section className="space-y-2">
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-5">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
              />
            </svg>
            <div className="text-sm text-amber-900">
              <p className="font-semibold mb-1">Beta</p>
              <p>
                This Auth0 Universal Component is in Beta. By using it, you agree to the applicable
                Free Trial terms in Okta's Master Subscription Agreement. To learn more, read{' '}
                <a
                  href="https://docs.auth0.com/docs/release-stages"
                  className="underline font-medium"
                  target="_blank"
                  rel="noreferrer"
                >
                  Product Release Stages
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Component Preview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Component Preview</h2>
        <div className="max-w-none flex justify-center">
          <img
            src="/img/my-organization/member-management/members-tab.png"
            alt="OrganizationMemberManagement — Members tab"
            width={900}
            height={478}
          />
        </div>
        <div className="max-w-none flex justify-center">
          <img
            src="/img/my-organization/member-management/invitations-tab.png"
            alt="OrganizationMemberManagement — Invitations tab"
            width={900}
            height={478}
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
                <strong>Note:</strong> One install covers both React (SPA) and Next.js (RWA).
                Components are always imported from the root entry{' '}
                <code>@auth0/universal-components-react</code>; only{' '}
                <code>Auth0ComponentProvider</code> uses a framework-specific subpath:
              </p>
              <ul className="text-sm text-blue-800 list-disc ml-6 mt-2 space-y-1">
                <li>
                  React (Vite, CRA, React Router) →{' '}
                  <code>{`import { Auth0ComponentProvider } from '@auth0/universal-components-react/spa';`}</code>
                </li>
                <li>
                  Next.js (App Router or Pages Router) →{' '}
                  <code>{`import { Auth0ComponentProvider } from '@auth0/universal-components-react/rwa';`}</code>
                </li>
              </ul>
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
        <p className="text-gray-600">
          The component has no required props — it loads the current organization's members and
          pending invitations from the My Organization API automatically.
        </p>
        <TabbedCodeBlock
          tabs={[
            {
              label: 'React (SPA)',
              code: `import { OrganizationMemberManagement } from '@auth0/universal-components-react';

export function MembersPage() {
  return <OrganizationMemberManagement />;
}`,
            },
            {
              label: 'Next.js (RWA)',
              code: `// app/members/page.tsx
'use client';

import { OrganizationMemberManagement } from '@auth0/universal-components-react';

export default function MembersPage() {
  return <OrganizationMemberManagement />;
}`,
            },
            {
              label: 'shadcn',
              code: `import { OrganizationMemberManagement } from '@/components/auth0/my-organization/organization-member-management';

export function MembersPage() {
  return <OrganizationMemberManagement />;
}`,
            },
          ]}
          language="tsx"
        />
      </section>

      {/* Props */}
      <section className="space-y-10">
        <h2 className="text-2xl font-semibold text-gray-900">Props</h2>

        {/* Required props */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Required props</h3>
          <p className="text-gray-600">
            <b>OrganizationMemberManagement</b> has no required props. It loads the current
            organization's members and pending invitations from the My Organization API
            automatically.
          </p>
        </div>

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
                    <code>ComponentAction&lt;ViewMemberDetailsParams&gt;</code>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Lifecycle hooks for viewing member details. Input includes <code>userId</code>{' '}
                    and optional <code>tab</code> ('details' | 'roles'). Use <code>onAfter</code> to
                    navigate to the member detail page.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    removeFromOrganizationAction
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

          {/* Per-action deep dives */}
          <div className="space-y-10 pt-4">
            {/* createInvitationAction */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">createInvitationAction</h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Type:</strong>{' '}
                <code>ComponentAction&lt;CreateInvitationInput, MemberInvitation&gt;</code>
              </p>
              <p className="text-gray-600 mb-3">
                Controls the invitation-creation flow. Fires when an admin submits the "Invite
                member" modal. Use <code>onBefore</code> to validate the invitee list (for example,
                against a blocklist) and <code>onAfter</code> to track analytics or refetch
                dependent data.
              </p>
              <p className="text-sm font-medium text-gray-700 mb-1">Properties:</p>
              <ul className="text-sm text-gray-600 list-disc ml-5 mb-3 space-y-1">
                <li>
                  <code>disabled</code> — hide the "Invite member" button entirely.
                </li>
                <li>
                  <code>onBefore(input)</code> — runs before the invitation is sent. Return{' '}
                  <code>false</code> to cancel. <code>input.invitees</code> is the array of invitees
                  being created (one per row in the modal).
                </li>
                <li>
                  <code>onAfter(input, createdInvitation)</code> — runs after the invitation is
                  successfully created. Receives both the original input and the created invitation
                  record.
                </li>
              </ul>
              <p className="text-sm font-medium text-gray-700 mb-1">Common Patterns:</p>
              <CodeBlock
                code={`// Track analytics after the invite is sent
createInvitationAction={{
  onAfter: (input) => {
    analytics.track('Invitation Sent', {
      email: input.invitees[0].email,
    });
  },
}}

// Validate against a blocklist before sending
createInvitationAction={{
  onBefore: async (input) => {
    return !blocklist.includes(input.invitees[0].email);
  },
}}

// Refetch the org's seat counter after the invite lands
createInvitationAction={{
  onAfter: () => refetchSeatUsage(),
}}`}
                language="tsx"
                title="createInvitationAction"
              />
            </div>

            {/* revokeInvitationAction */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">revokeInvitationAction</h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Type:</strong> <code>ComponentAction&lt;MemberInvitation&gt;</code>
              </p>
              <p className="text-gray-600 mb-3">
                Controls the invitation-revoke flow. Fires when an admin revokes a pending
                invitation from the invitation list. Receives the invitation record being revoked.
              </p>
              <p className="text-sm font-medium text-gray-700 mb-1">Properties:</p>
              <ul className="text-sm text-gray-600 list-disc ml-5 mb-3 space-y-1">
                <li>
                  <code>disabled</code> — hide the revoke option in the invitation row menu.
                </li>
                <li>
                  <code>onBefore(invitation)</code> — confirm before revoking. Return{' '}
                  <code>false</code> to cancel.
                </li>
                <li>
                  <code>onAfter(invitation)</code> — runs after the invitation is revoked. Use this
                  to refresh state outside the component.
                </li>
              </ul>
              <p className="text-sm font-medium text-gray-700 mb-1">Common Patterns:</p>
              <CodeBlock
                code={`// Refresh the seat counter after revoke
revokeInvitationAction={{
  onAfter: () => refetchSeatUsage(),
}}

// Confirm before revoke
revokeInvitationAction={{
  onBefore: (invitation) => confirm(
    \`Revoke invitation for \${invitation.invitee.email}?\`
  ),
}}`}
                language="tsx"
                title="revokeInvitationAction"
              />
            </div>

            {/* resendInvitationAction */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">resendInvitationAction</h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Type:</strong>{' '}
                <code>ComponentAction&lt;MemberInvitation, MemberInvitation&gt;</code>
              </p>
              <p className="text-gray-600 mb-3">
                Controls the revoke-and-resend flow. The component revokes the original invitation
                and creates a new one with the same details. <code>onAfter</code> receives both the
                old and new invitations.
              </p>
              <p className="text-sm font-medium text-gray-700 mb-1">Properties:</p>
              <ul className="text-sm text-gray-600 list-disc ml-5 mb-3 space-y-1">
                <li>
                  <code>disabled</code> — hide the resend option in the invitation row menu.
                </li>
                <li>
                  <code>onBefore(invitation)</code> — confirm before resending. Return{' '}
                  <code>false</code> to cancel.
                </li>
                <li>
                  <code>onAfter(originalInvitation, newInvitation)</code> — runs after the new
                  invitation is sent.
                </li>
              </ul>
              <p className="text-sm font-medium text-gray-700 mb-1">Common Patterns:</p>
              <CodeBlock
                code={`// Toast on success
resendInvitationAction={{
  onAfter: (_, newInvitation) => {
    toast.success(\`Invitation resent to \${newInvitation.invitee.email}\`);
  },
}}

// Track analytics
resendInvitationAction={{
  onAfter: (original) => {
    analytics.track('Invitation Resent', { email: original.invitee.email });
  },
}}`}
                language="tsx"
                title="resendInvitationAction"
              />
            </div>

            {/* viewMemberDetailsAction */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">
                viewMemberDetailsAction
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Type:</strong> <code>ComponentAction&lt;ViewMemberDetailsParams&gt;</code>
              </p>
              <p className="text-gray-600 mb-3">
                Fires when an admin requests the per-member detail view from the member list.
                Receives a <code>ViewMemberDetailsParams</code> object containing the{' '}
                <code>userId</code> and an optional <code>tab</code> ('details' | 'roles'). The
                standard wiring is to navigate to the route that renders{' '}
                <code>OrganizationMemberDetail</code>. When clicking "+More" on a member's roles,
                the <code>tab</code> is set to 'roles' to deep-link directly to the Roles tab.
              </p>
              <p className="text-sm font-medium text-gray-700 mb-1">Properties:</p>
              <ul className="text-sm text-gray-600 list-disc ml-5 mb-3 space-y-1">
                <li>
                  <code>disabled</code> — hide the "View details" entry in the row's actions menu.
                </li>
                <li>
                  <code>onAfter({'{ userId, tab }'})</code> — runs after the user requests the
                  detail view. Use <code>tab</code> to deep-link to a specific tab.
                </li>
              </ul>
              <p className="text-sm font-medium text-gray-700 mb-1">Common Patterns:</p>
              <CodeBlock
                code={`// React Router (SPA) — navigate with optional tab query param
viewMemberDetailsAction={{
  onAfter: ({ userId, tab }) => {
    const url = tab ? \`/members/\${userId}?tab=\${tab}\` : \`/members/\${userId}\`;
    navigate(url);
  },
}}

// Next.js App Router — navigate with optional tab query param
viewMemberDetailsAction={{
  onAfter: ({ userId, tab }) => {
    const url = tab ? \`/members/\${userId}?tab=\${tab}\` : \`/members/\${userId}\`;
    router.push(url);
  },
}}

// Track analytics in addition to navigation
viewMemberDetailsAction={{
  onAfter: ({ userId, tab }) => {
    analytics.track('Member Details Viewed', { userId, tab });
    navigate(\`/members/\${userId}\${tab ? \`?tab=\${tab}\` : ''}\`);
  },
}}`}
                language="tsx"
                title="viewMemberDetailsAction"
              />
            </div>

            {/* removeFromOrganizationAction */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">
                removeFromOrganizationAction
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Type:</strong> <code>ComponentAction&lt;string&gt;</code>
              </p>
              <p className="text-gray-600 mb-3">
                Controls the remove-from-organization flow on a specific member row. Both lifecycle
                hooks receive the <code>userId</code> string directly. This action triggers a
                step-up auth challenge — make sure your <code>Auth0Provider</code> is configured
                with <code>interactiveErrorHandler="popup"</code>.
              </p>
              <p className="text-sm font-medium text-gray-700 mb-1">Properties:</p>
              <ul className="text-sm text-gray-600 list-disc ml-5 mb-3 space-y-1">
                <li>
                  <code>disabled</code> — hide the remove option in the row menu.
                </li>
                <li>
                  <code>onBefore(userId)</code> — confirm before removing. Return <code>false</code>{' '}
                  to cancel.
                </li>
                <li>
                  <code>onAfter(userId)</code> — runs after the member is removed. Use this to
                  refresh seat usage or write to an audit log.
                </li>
              </ul>
              <p className="text-sm font-medium text-gray-700 mb-1">Common Patterns:</p>
              <CodeBlock
                code={`// Confirm before removing
removeFromOrganizationAction={{
  onBefore: async (userId) =>
    confirmDialog(\`Remove member \${userId} from the organization?\`),
}}

// Audit log on success
removeFromOrganizationAction={{
  onAfter: (userId) => {
    auditLog.record({ action: 'member_removed', userId });
  },
}}

// Refresh dependent data
removeFromOrganizationAction={{
  onAfter: () => refetchMemberList(),
}}`}
                language="tsx"
                title="removeFromOrganizationAction"
              />
            </div>

            {/* assignRolesAction */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">assignRolesAction</h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Type:</strong>{' '}
                <code>ComponentAction&lt;{'{ userId: string; roleIds: string[] }'}&gt;</code>
              </p>
              <p className="text-gray-600 mb-3">
                Fires after an admin assigns one or more roles to a member from the row's role
                modal. Both lifecycle hooks receive an object with the <code>userId</code> and the
                array of <code>roleIds</code> being assigned.
              </p>
              <p className="text-sm font-medium text-gray-700 mb-1">Properties:</p>
              <ul className="text-sm text-gray-600 list-disc ml-5 mb-3 space-y-1">
                <li>
                  <code>disabled</code> — hide the assign-roles option.
                </li>
                <li>
                  <code>onBefore({'{ userId, roleIds }'})</code> — validate the selection. Return{' '}
                  <code>false</code> to cancel.
                </li>
                <li>
                  <code>onAfter({'{ userId, roleIds }'})</code> — runs after the roles are assigned.
                  Use this to write to an audit log or refresh role badges.
                </li>
              </ul>
              <p className="text-sm font-medium text-gray-700 mb-1">Common Patterns:</p>
              <CodeBlock
                code={`// Audit log
assignRolesAction={{
  onAfter: ({ userId, roleIds }) => {
    auditLog.record({ action: 'roles_assigned', userId, roleIds });
  },
}}

// Validate selection (e.g. forbid combining mutually-exclusive roles)
assignRolesAction={{
  onBefore: ({ roleIds }) => {
    if (roleIds.includes('admin') && roleIds.includes('viewer')) {
      toast.error('Admin and Viewer cannot be assigned together');
      return false;
    }
    return true;
  },
}}`}
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

          {/* Per-prop deep dives */}
          <div className="space-y-10 pt-4">
            {/* customMessages */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">customMessages</h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Type:</strong>{' '}
                <code>Partial&lt;OrganizationMemberManagementMessages&gt;</code>
              </p>
              <p className="text-gray-600 mb-3">
                Customize all text and translations rendered by the component. Every field is
                optional and falls back to the built-in default. Use this prop to localize the
                component or to align microcopy with your product voice.
              </p>
              <details className="border border-gray-200 rounded-lg overflow-hidden mb-3">
                <summary className="cursor-pointer bg-gray-50 hover:bg-gray-100 px-4 py-3 text-sm font-medium text-gray-900 transition-colors">
                  Available Messages
                </summary>
                <div className="p-4 bg-white border-t border-gray-200 text-sm text-gray-700 grid md:grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <strong>header</strong>
                    <ul className="ml-4 list-disc mt-1 text-gray-600">
                      <li>title, description</li>
                    </ul>
                  </div>
                  <div>
                    <strong>tabs</strong>
                    <ul className="ml-4 list-disc mt-1 text-gray-600">
                      <li>members, invitations</li>
                    </ul>
                  </div>
                  <div>
                    <strong>member.table</strong>
                    <ul className="ml-4 list-disc mt-1 text-gray-600">
                      <li>columns.name / roles / last_login</li>
                      <li>empty_message, search_placeholder</li>
                      <li>filter_by_role, all_roles</li>
                      <li>more_roles, view_all_roles</li>
                    </ul>
                  </div>
                  <div>
                    <strong>member.actions</strong>
                    <ul className="ml-4 list-disc mt-1 text-gray-600">
                      <li>assign_roles, remove_from_organization, view_details</li>
                    </ul>
                  </div>
                  <div>
                    <strong>member.assign_roles</strong>
                    <ul className="ml-4 list-disc mt-1 text-gray-600">
                      <li>title, description</li>
                      <li>roles_label, roles_placeholder</li>
                      <li>submit_button, cancel_button</li>
                    </ul>
                  </div>
                  <div>
                    <strong>member.remove_from_organization</strong>
                    <ul className="ml-4 list-disc mt-1 text-gray-600">
                      <li>title, description</li>
                      <li>confirm_button, cancel_button</li>
                    </ul>
                  </div>
                  <div>
                    <strong>invitation.table</strong>
                    <ul className="ml-4 list-disc mt-1 text-gray-600">
                      <li>columns.email / status / inviter</li>
                      <li>columns.created_at / expires_at / roles</li>
                      <li>empty_message, search_placeholder</li>
                      <li>filter_by_role, all_roles</li>
                      <li>status_pending, status_expired</li>
                    </ul>
                  </div>
                  <div>
                    <strong>invitation.create</strong>
                    <ul className="ml-4 list-disc mt-1 text-gray-600">
                      <li>title, description</li>
                      <li>email_label, email_placeholder</li>
                      <li>roles_label, provider_label</li>
                      <li>submit_button, cancel_button</li>
                    </ul>
                  </div>
                  <div>
                    <strong>invitation.details</strong>
                    <ul className="ml-4 list-disc mt-1 text-gray-600">
                      <li>title, email_label, status_label</li>
                      <li>roles_label, provider_label</li>
                      <li>copy_url_button, revoke_button, resend_button</li>
                    </ul>
                  </div>
                  <div>
                    <strong>invitation.error / success</strong>
                    <ul className="ml-4 list-disc mt-1 text-gray-600">
                      <li>error.fetch_failed, create_failed, revoke_failed</li>
                      <li>success.url_copied, invitation_resent</li>
                    </ul>
                  </div>
                </div>
              </details>
              <p className="text-sm font-medium text-gray-700 mb-1">Example:</p>
              <CodeBlock
                code={`<OrganizationMemberManagement
  customMessages={{
    header: {
      title: 'Team Members',
      description: 'Manage who has access to your organization',
    },
    tabs: { members: 'Members', invitations: 'Pending Invites' },
    member: {
      table: {
        empty_message: 'No members yet.',
        search_placeholder: 'Search by name or email...',
      },
      actions: { assign_roles: 'Assign Roles', remove_from_organization: 'Remove' },
    },
    invitation: {
      table: { empty_message: 'No pending invitations.' },
      create: { title: 'Invite a team member', submit_button: 'Send Invite' },
    },
  }}
/>`}
                language="tsx"
                title="customMessages"
              />
            </div>

            {/* styling */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">styling</h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Type:</strong> <code>ComponentStyling</code>
              </p>
              <p className="text-gray-600 mb-3">
                Customize appearance with CSS variables and class overrides. Variables are
                theme-aware (separate <code>light</code>, <code>dark</code>, and <code>common</code>{' '}
                scopes); class overrides target named slots inside the component tree so you can
                attach Tailwind utilities or your own design-system classes without forking the
                source.
              </p>
              <details className="border border-gray-200 rounded-lg overflow-hidden mb-3">
                <summary className="cursor-pointer bg-gray-50 hover:bg-gray-100 px-4 py-3 text-sm font-medium text-gray-900 transition-colors">
                  Available Styling Options
                </summary>
                <div className="p-4 bg-white border-t border-gray-200 text-sm text-gray-700 grid md:grid-cols-2 gap-6">
                  <div>
                    <strong>Variables</strong> — CSS custom properties
                    <ul className="ml-4 list-disc mt-1 text-gray-600">
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
                    <strong>Classes</strong> — Component class overrides
                    <ul className="ml-4 list-disc mt-1 text-gray-600">
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
                        <code>OrganizationMemberTab-table</code>
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
              </details>
              <p className="text-sm font-medium text-gray-700 mb-1">Example:</p>
              <CodeBlock
                code={`<OrganizationMemberManagement
  styling={{
    variables: {
      common: { '--font-size-title': '1.5rem' },
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
                title="styling"
              />
            </div>
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
  viewMemberDetailsAction?: ComponentAction<ViewMemberDetailsParams>;
  assignRolesAction?: ComponentAction<{ userId: string; roleIds: string[] }>;
  removeFromOrganizationAction?: ComponentAction<string>;
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

      {/* Complete Integration Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Complete Integration Example</h2>
        <p className="text-gray-600">
          The component requires an <code>Auth0Provider</code> and an{' '}
          <code>Auth0ComponentProvider</code> in the React tree. Set{' '}
          <code>interactiveErrorHandler="popup"</code> on <code>Auth0Provider</code> so that step-up
          auth challenges (triggered by sensitive mutations such as removing a member or assigning
          roles) can be resolved without losing page state.
        </p>
        <CodeBlock
          code={`import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OrganizationMemberManagement } from '@auth0/universal-components-react';
import { Auth0Provider } from '@auth0/auth0-react';
import { Auth0ComponentProvider } from '@auth0/universal-components-react/spa';
import { analytics } from './lib/analytics';
import { auditLog } from './lib/audit-log';

function MembersPage() {
  const navigate = useNavigate();

  return (
    <OrganizationMemberManagement
      createInvitationAction={{
        onBefore: async (input) => !blocklist.includes(input.invitees[0].email),
        onAfter: (input) => {
          analytics.track('Invitation Sent', { email: input.invitees[0].email });
        },
      }}
      revokeInvitationAction={{
        onAfter: () => refetchMemberCount(),
      }}
      viewMemberDetailsAction={{
        onAfter: ({ userId, tab }) => navigate(\`/members/\${userId}\${tab ? \`?tab=\${tab}\` : ''}\`),
      }}
      removeFromOrganizationAction={{
        onBefore: async (userId) =>
          confirmDialog(\`Remove member \${userId} from the organization?\`),
        onAfter: (userId) => {
          auditLog.record({ action: 'member_removed', userId });
        },
      }}
      assignRolesAction={{
        onAfter: ({ userId, roleIds }) => {
          auditLog.record({ action: 'roles_assigned', userId, roleIds });
        },
      }}
      customMessages={{
        header: { title: 'Team Members' },
        tabs: { invitations: 'Pending Invites' },
      }}
      styling={{
        variables: {
          light: { '--color-primary': '#4f46e5' },
          dark: { '--color-primary': '#818cf8' },
        },
      }}
    />
  );
}

export default function App() {
  const domain = 'YOUR_TENANT.auth0.com';
  const clientId = 'YOUR_CLIENT_ID';

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: window.location.origin }}
      interactiveErrorHandler="popup" // resolves step-up auth via popup
    >
      <Auth0ComponentProvider domain={domain}>
        <MembersPage />
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
