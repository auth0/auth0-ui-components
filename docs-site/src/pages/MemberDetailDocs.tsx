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
            src="/img/my-organization/member-management/member-details-tab.png"
            alt="OrganizationMemberDetail — Details tab"
            width={900}
            height={478}
          />
        </div>
        <div className="max-w-none flex justify-center">
          <img
            src="/img/my-organization/member-management/member-roles-tab.png"
            alt="OrganizationMemberDetail — Roles tab"
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
        <p className="text-gray-600">
          Pass a <code>userId</code> from your route to the component. Wire <code>onBack</code> to
          your router so the back button returns to the member list.
        </p>
        <TabbedCodeBlock
          tabs={[
            {
              label: 'React (SPA)',
              code: `import { OrganizationMemberDetail } from '@auth0/universal-components-react';
import { useNavigate, useParams } from 'react-router-dom';

export function MemberDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  return (
    <OrganizationMemberDetail
      userId={userId!}
      onBack={() => navigate('/members')}
    />
  );
}`,
            },
            {
              label: 'Next.js (RWA)',
              code: `// app/members/[userId]/page.tsx
'use client';

import { OrganizationMemberDetail } from '@auth0/universal-components-react';
import { useRouter, useParams } from 'next/navigation';

export default function MemberDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();

  return (
    <OrganizationMemberDetail
      userId={userId}
      onBack={() => router.push('/members')}
    />
  );
}`,
            },
            {
              label: 'shadcn',
              code: `import { OrganizationMemberDetail } from '@/components/auth0/my-organization/organization-member-detail';
import { useNavigate, useParams } from 'react-router-dom';

export function MemberDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  return (
    <OrganizationMemberDetail
      userId={userId!}
      onBack={() => navigate('/members')}
    />
  );
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
                    userId <span className="text-red-500">*</span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code>string</code>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Auth0 user ID of the member to display (e.g. <code>auth0|64abc...</code>)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
                    readOnly
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code>boolean</code>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Disables role management and member removal actions. Default: <code>false</code>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    hideHeader
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code>boolean</code>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Hides the component header. Default: <code>false</code>
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
            operations. Use lifecycle hooks (<code>onBefore</code>, <code>onAfter</code>) to
            integrate with your application's routing and analytics.
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
                    onBack
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code>{'() => void'}</code>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Called when the user clicks the back button in the header. Wire to your router.
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
                    Lifecycle hooks for member removal. Input is the <code>userId</code>.
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
                    Lifecycle hooks for role assignment.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    removeRolesAction
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    <code>ComponentAction&lt;{'{ userId: string; roleIds: string[] }'}&gt;</code>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Lifecycle hooks for role removal.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Per-action deep dives */}
          <div className="space-y-10 pt-4">
            {/* onBack */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">onBack</h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Type:</strong> <code>{'() => void'}</code>
              </p>
              <p className="text-gray-600 mb-3">
                Fires when the user clicks the back button in the header. The component does not
                navigate on its own — wire this callback to your router so it returns to the
                member-list route (typically the page that rendered{' '}
                <code>OrganizationMemberManagement</code>).
              </p>
              <p className="text-sm font-medium text-gray-700 mb-1">Common Patterns:</p>
              <CodeBlock
                code={`// React Router (SPA)
<OrganizationMemberDetail
  userId={userId}
  onBack={() => navigate('/members')}
/>

// Next.js (RWA)
<OrganizationMemberDetail
  userId={userId}
  onBack={() => router.push('/members')}
/>

// Pop the history stack instead of navigating to a fixed URL
<OrganizationMemberDetail
  userId={userId}
  onBack={() => history.back()}
/>`}
                language="tsx"
                title="onBack"
              />
            </div>

            {/* removeFromOrgAction */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">removeFromOrgAction</h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Type:</strong> <code>ComponentAction&lt;string&gt;</code>
              </p>
              <p className="text-gray-600 mb-3">
                Controls the remove-from-organization flow on the member's profile tab. Both
                lifecycle hooks receive the <code>userId</code> string directly. This action
                triggers a step-up auth challenge — make sure your <code>Auth0Provider</code> is
                configured with <code>interactiveErrorHandler="popup"</code>.
              </p>
              <p className="text-sm font-medium text-gray-700 mb-1">Properties:</p>
              <ul className="text-sm text-gray-600 list-disc ml-5 mb-3 space-y-1">
                <li>
                  <code>disabled</code> — hide the remove button.
                </li>
                <li>
                  <code>onBefore(userId)</code> — confirm before removing. Return <code>false</code>{' '}
                  to cancel.
                </li>
                <li>
                  <code>onAfter(userId)</code> — runs after the member is removed. Use this to
                  navigate away or write to an audit log.
                </li>
              </ul>
              <p className="text-sm font-medium text-gray-700 mb-1">Common Patterns:</p>
              <CodeBlock
                code={`// Confirm before removing, then navigate back to the list
removeFromOrgAction={{
  onBefore: async () =>
    confirmDialog('Remove this member from the organization?'),
  onAfter: () => navigate('/members'),
}}

// Audit log on success
removeFromOrgAction={{
  onAfter: (userId) => {
    auditLog.record({ action: 'member_removed', userId });
  },
}}`}
                language="tsx"
                title="removeFromOrgAction"
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
                Fires after one or more roles are assigned to the member from the roles tab. Both
                lifecycle hooks receive an object with the <code>userId</code> and the array of
                <code>roleIds</code> being assigned.
              </p>
              <p className="text-sm font-medium text-gray-700 mb-1">Properties:</p>
              <ul className="text-sm text-gray-600 list-disc ml-5 mb-3 space-y-1">
                <li>
                  <code>disabled</code> — hide the assign-roles button.
                </li>
                <li>
                  <code>onBefore({'{ userId, roleIds }'})</code> — validate the selection. Return{' '}
                  <code>false</code> to cancel.
                </li>
                <li>
                  <code>onAfter({'{ userId, roleIds }'})</code> — runs after the roles are assigned.
                </li>
              </ul>
              <p className="text-sm font-medium text-gray-700 mb-1">Common Patterns:</p>
              <CodeBlock
                code={`// Audit log
assignRolesAction={{
  onAfter: ({ userId: memberId, roleIds }) => {
    auditLog.record({ action: 'roles_assigned', userId: memberId, roleIds });
  },
}}

// Track analytics
assignRolesAction={{
  onAfter: ({ roleIds }) => {
    analytics.track('Roles Assigned', { count: roleIds.length });
  },
}}`}
                language="tsx"
                title="assignRolesAction"
              />
            </div>

            {/* removeRolesAction */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">removeRolesAction</h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Type:</strong>{' '}
                <code>ComponentAction&lt;{'{ userId: string; roleIds: string[] }'}&gt;</code>
              </p>
              <p className="text-gray-600 mb-3">
                Fires after one or more roles are removed from the member's role table. Both
                lifecycle hooks receive an object with the <code>userId</code> and the array of
                <code>roleIds</code> being removed.
              </p>
              <p className="text-sm font-medium text-gray-700 mb-1">Properties:</p>
              <ul className="text-sm text-gray-600 list-disc ml-5 mb-3 space-y-1">
                <li>
                  <code>disabled</code> — hide the remove-role buttons in the role table.
                </li>
                <li>
                  <code>onBefore({'{ userId, roleIds }'})</code> — confirm before removing. Return{' '}
                  <code>false</code> to cancel.
                </li>
                <li>
                  <code>onAfter({'{ userId, roleIds }'})</code> — runs after the roles are removed.
                </li>
              </ul>
              <p className="text-sm font-medium text-gray-700 mb-1">Common Patterns:</p>
              <CodeBlock
                code={`// Confirm before removing
removeRolesAction={{
  onBefore: async ({ roleIds }) =>
    confirmDialog(\`Remove \${roleIds.length} role(s) from this member?\`),
  onAfter: ({ userId: memberId, roleIds }) => {
    auditLog.record({ action: 'roles_removed', userId: memberId, roleIds });
  },
}}`}
                language="tsx"
                title="removeRolesAction"
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
                    <code>Partial&lt;OrganizationMemberDetailMessages&gt;</code>
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
                <strong>Type:</strong> <code>Partial&lt;OrganizationMemberDetailMessages&gt;</code>
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
                    <strong>member.detail</strong>
                    <ul className="ml-4 list-disc mt-1 text-gray-600">
                      <li>back_button</li>
                      <li>tabs.details, tabs.roles</li>
                    </ul>
                  </div>
                  <div>
                    <strong>member.detail.user_details</strong>
                    <ul className="ml-4 list-disc mt-1 text-gray-600">
                      <li>title</li>
                      <li>name, email</li>
                      <li>phone_number, provider</li>
                      <li>created_at, last_login</li>
                    </ul>
                  </div>
                  <div>
                    <strong>member.detail.actions.remove_from_org</strong>
                    <ul className="ml-4 list-disc mt-1 text-gray-600">
                      <li>title, description, button</li>
                      <li>modal.title, modal.description</li>
                      <li>modal.cancel_button, modal.confirm_button</li>
                      <li>success</li>
                    </ul>
                  </div>
                  <div>
                    <strong>member.detail.roles</strong>
                    <ul className="ml-4 list-disc mt-1 text-gray-600">
                      <li>title, description</li>
                      <li>assign_button</li>
                      <li>table.name, table.description</li>
                      <li>table.empty_message</li>
                      <li>table.remove_button_label</li>
                    </ul>
                  </div>
                  <div>
                    <strong>member.detail.roles.assign_modal</strong>
                    <ul className="ml-4 list-disc mt-1 text-gray-600">
                      <li>title, description</li>
                      <li>roles_label, roles_placeholder</li>
                      <li>submit_button, cancel_button</li>
                      <li>no_roles_available</li>
                    </ul>
                  </div>
                  <div>
                    <strong>member.detail.error</strong>
                    <ul className="ml-4 list-disc mt-1 text-gray-600">
                      <li>fetch_failed, fetch_roles_failed</li>
                      <li>remove_from_org_failed</li>
                      <li>assign_role_failed, remove_role_failed</li>
                    </ul>
                  </div>
                </div>
              </details>
              <p className="text-sm font-medium text-gray-700 mb-1">Example:</p>
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
              </details>
              <p className="text-sm font-medium text-gray-700 mb-1">Example:</p>
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

      {/* Complete Integration Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Complete Integration Example</h2>
        <p className="text-gray-600">
          The component requires an <code>Auth0Provider</code> and an{' '}
          <code>Auth0ComponentProvider</code> in the React tree. Set{' '}
          <code>interactiveErrorHandler="popup"</code> on <code>Auth0Provider</code> so step-up auth
          challenges (triggered by removing the member or mutating roles) can be resolved without
          losing page state.
        </p>
        <CodeBlock
          code={`import React from 'react';
import { OrganizationMemberDetail } from '@auth0/universal-components-react';
import { Auth0Provider } from '@auth0/auth0-react';
import { Auth0ComponentProvider } from '@auth0/universal-components-react/spa';
import { useNavigate, useParams } from 'react-router-dom';
import { auditLog } from './lib/audit-log';

function MemberDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  return (
    <OrganizationMemberDetail
      userId={userId!}
      onBack={() => navigate('/members')}
      removeFromOrgAction={{
        onBefore: async () => confirmDialog('Remove this member from the organization?'),
        onAfter: () => navigate('/members'),
      }}
      assignRolesAction={{
        onAfter: ({ userId: memberId, roleIds }) => {
          auditLog.record({ action: 'roles_assigned', userId: memberId, roleIds });
        },
      }}
      removeRolesAction={{
        onAfter: ({ userId: memberId, roleIds }) => {
          auditLog.record({ action: 'roles_removed', userId: memberId, roleIds });
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
}

export default function App() {
  const domain = 'YOUR_TENANT.auth0.com';
  const clientId = 'YOUR_CLIENT_ID';

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: window.location.origin }}
      interactiveErrorHandler="popup"
    >
      <Auth0ComponentProvider domain={domain}>
        <MemberDetailPage />
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
