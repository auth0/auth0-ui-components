import CodeBlock from '../components/CodeBlock';
import TabbedCodeBlock from '../components/TabbedCodeBlock';

export default function UserMFA() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-4xl font-bold text-gray-900">UserMFAMgmt Component</h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            BETA
          </span>
        </div>
        <p className="text-xl text-gray-600">
          A comprehensive Multi-Factor Authentication (MFA) management component for Auth0
          applications.
        </p>
        {/* Early Access notice */}
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            <strong>Early Access:</strong> This component is in Beta under the Okta Master
            Subscription Agreement. See{' '}
            <a
              href="https://docs.auth0.com/docs/release-stages"
              className="underline font-medium hover:text-amber-700"
            >
              Product Release Stages
            </a>{' '}
            for details. Behavior and APIs may change before General Availability.
          </p>
        </div>
      </div>

      {/* Component Preview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Component Preview</h2>
        <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 h-40">
          <span className="text-gray-500 text-sm">[Component screenshot pending]</span>
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
                Before using <code>UserMFAMgmt</code>, ensure your tenant is configured with the My
                Account API, the right application type (SPA, RWA/Next.js, or shadcn-built), and the
                scopes needed to list, enroll, and delete authentication factors.
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
                  MFA-Specific Requirements
                </h4>
                <ul className="space-y-2 text-blue-800 text-sm list-disc list-inside">
                  <li>
                    <strong>Enable MFA Methods:</strong> In the Auth0 Dashboard, go to Security →
                    Multi-factor Auth and enable the factor types you want users to manage (One-Time
                    Password, Push Notification via Auth0 Guardian, Phone Message, Email, Recovery
                    Code).
                  </li>
                  <li>
                    <strong>My Account API scopes:</strong> The user's token must include{' '}
                    <code>enroll:authenticators</code> and <code>remove:authenticators</code> on the
                    audience <code>{'https://{domain}/api/v2/'}</code>.
                  </li>
                  <li>
                    <strong>Step-up auth:</strong> Enrollment and deletion trigger a step-up
                    authentication challenge. Configure{' '}
                    <code>{'interactiveErrorHandler="popup"'}</code> on <code>Auth0Provider</code>{' '}
                    so Auth0 can display the prompt in a popup rather than redirecting away from the
                    page.
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
          {/* NPM / pnpm Installation */}
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
                <strong>Note:</strong> Either command also installs the{' '}
                <code>@auth0/universal-components-core</code> dependency for shared utilities and
                Auth0 integration.
              </p>
            </div>
          </div>

          {/* Shadcn Installation */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Option 2: shadcn CLI</h3>
            <p className="text-gray-600 mb-4">
              If you're using shadcn, add the UserMFAMgmt block directly to your project:
            </p>
            <CodeBlock
              code="npx shadcn@latest add https://auth0-universal-components.vercel.app/r/my-account/user-mfa-management.json"
              language="bash"
              title="Add shadcn Block"
            />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This installs the React component source code into your{' '}
                <code>src/components/auth0/my-account/</code> directory along with all UI
                dependencies and the <code>@auth0/universal-components-core</code> package.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Getting Started</h2>
        <CodeBlock
          code={`import { UserMFAMgmt } from "@auth0/universal-components-react";

export function SecurityPage() {
  return <UserMFAMgmt />;
}`}
          language="tsx"
          title="Minimal usage"
        />
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Import paths:</strong> Components are always imported from{' '}
            <code>@auth0/universal-components-react</code> regardless of framework. Only{' '}
            <code>Auth0ComponentProvider</code> uses a framework-specific subpath: <code>/spa</code>{' '}
            for React SPAs, <code>/rwa</code> for Next.js apps.
          </p>
        </div>
      </section>

      {/* Full Integration Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Full Integration Example</h2>
        <TabbedCodeBlock
          tabs={[
            {
              label: 'React (SPA)',
              code: `import React from "react";
import { UserMFAMgmt } from "@auth0/universal-components-react";
import { Auth0Provider } from "@auth0/auth0-react";
import { Auth0ComponentProvider } from "@auth0/universal-components-react/spa";
import { analytics } from "./lib/analytics";

function SecurityPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <UserMFAMgmt
        factorConfig={{
          sms: { visible: true, enabled: true },
          otp: { visible: true, enabled: true },
          "push-notification": { visible: true, enabled: true },
          email: { visible: true, enabled: true },
          "recovery-code": { visible: true, enabled: true },
          "webauthn-platform": { visible: false },
          "webauthn-roaming": { visible: false },
        }}
        onEnroll={() => {
          analytics.track("MFA Factor Enrolled");
        }}
        onDelete={() => {
          analytics.track("MFA Factor Deleted");
        }}
        onErrorAction={(error, action) => {
          console.error(\`MFA \${action} failed:\`, error.message);
        }}
        onBeforeAction={async (action, factorType) => {
          if (action === "delete") {
            return await confirmDialog(
              \`Remove your \${factorType} authenticator?\`
            );
          }
          return true;
        }}
        customMessages={{
          title: "Two-Factor Authentication",
          description: "Manage the extra verification methods used to protect your account.",
        }}
        styling={{
          variables: {
            light: { "--color-primary": "#4f46e5" },
            dark: { "--color-primary": "#818cf8" },
          },
        }}
      />
    </div>
  );
}

export default function App() {
  const domain = "YOUR_TENANT.auth0.com";
  const clientId = "YOUR_CLIENT_ID";

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: window.location.origin }}
      interactiveErrorHandler="popup"
    >
      <Auth0ComponentProvider domain={domain}>
        <SecurityPage />
      </Auth0ComponentProvider>
    </Auth0Provider>
  );
}`,
            },
            {
              label: 'Next.js',
              code: `// app/security/page.tsx
"use client";

import { UserMFAMgmt } from "@auth0/universal-components-react";
import { analytics } from "@/lib/analytics";

export default function SecurityPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <UserMFAMgmt
        factorConfig={{
          sms: { visible: true, enabled: true },
          otp: { visible: true, enabled: true },
          "push-notification": { visible: true, enabled: true },
          email: { visible: true, enabled: true },
          "recovery-code": { visible: true, enabled: true },
          "webauthn-platform": { visible: false },
          "webauthn-roaming": { visible: false },
        }}
        onEnroll={() => {
          analytics.track("MFA Factor Enrolled");
        }}
        onDelete={() => {
          analytics.track("MFA Factor Deleted");
        }}
        onErrorAction={(error, action) => {
          console.error(\`MFA \${action} failed:\`, error.message);
        }}
        customMessages={{ title: "Two-Factor Authentication" }}
        styling={{
          variables: {
            light: { "--color-primary": "#4f46e5" },
            dark: { "--color-primary": "#818cf8" },
          },
        }}
      />
    </div>
  );
}`,
            },
            {
              label: 'shadcn',
              code: `import React from "react";
import { UserMFAMgmt } from "@/components/auth0/my-account/user-mfa-management";
import { Auth0Provider } from "@auth0/auth0-react";
import { Auth0ComponentProvider } from "@auth0/universal-components-react/spa";
import { analytics } from "./lib/analytics";

function SecurityPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <UserMFAMgmt
        factorConfig={{
          sms: { visible: true, enabled: true },
          otp: { visible: true, enabled: true },
          "push-notification": { visible: true, enabled: true },
          email: { visible: true, enabled: true },
          "recovery-code": { visible: true, enabled: true },
          "webauthn-platform": { visible: false },
          "webauthn-roaming": { visible: false },
        }}
        onEnroll={() => {
          analytics.track("MFA Factor Enrolled");
        }}
        onDelete={() => {
          analytics.track("MFA Factor Deleted");
        }}
        onErrorAction={(error, action) => {
          console.error(\`MFA \${action} failed:\`, error.message);
        }}
        onBeforeAction={async (action, factorType) => {
          if (action === "delete") {
            return await confirmDialog(\`Remove your \${factorType} authenticator?\`);
          }
          return true;
        }}
        customMessages={{ title: "Two-Factor Authentication" }}
        styling={{
          variables: {
            light: { "--color-primary": "#4f46e5" },
            dark: { "--color-primary": "#818cf8" },
          },
        }}
      />
    </div>
  );
}

export default function App() {
  const domain = "YOUR_TENANT.auth0.com";
  const clientId = "YOUR_CLIENT_ID";

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: window.location.origin }}
      interactiveErrorHandler="popup"
    >
      <Auth0ComponentProvider domain={domain}>
        <SecurityPage />
      </Auth0ComponentProvider>
    </Auth0Provider>
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

        {/* Required Props */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Required Props</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700 text-sm">
              <code>UserMFAMgmt</code> has no required props. It loads the current user's enrolled
              factors from the My Account API automatically.
            </p>
          </div>
        </div>

        {/* Display Props */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Display Props</h3>
          <p className="text-gray-600">
            Display props control how the component renders without affecting its behavior.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prop
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    hideHeader
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">boolean</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">false</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Hide the component header (title and description).
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    readOnly
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">boolean</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">false</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Disable all mutation actions (enroll and delete). Factors are shown but cannot
                    be added or removed.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    showActiveOnly
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">boolean</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">false</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Show only factor types that the user has at least one active enrollment for.
                    Factor types with no enrollments are hidden.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    disableEnroll
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">boolean</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">false</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Hide the enroll button for all factor types. Users can still delete existing
                    factors.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    disableDelete
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">boolean</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">false</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Hide the delete button on all enrolled factor rows. Users can still enroll new
                    factors.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    factorConfig
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {`Partial<Record<MFAType, { visible?: boolean; enabled?: boolean }>>`}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{`{}`}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Per-factor-type visibility and enabled state. See the{' '}
                    <a href="#factorconfig" className="text-blue-600 underline">
                      factorConfig
                    </a>{' '}
                    section below.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* factorConfig subsection */}
          <div id="factorconfig" className="space-y-4 pt-2">
            <h4 className="text-lg font-semibold text-gray-900">factorConfig</h4>
            <p className="text-gray-600">
              Use <code>factorConfig</code> to show or grey-out specific factor types without
              touching the tenant configuration. Each key is a factor type string; both fields are
              optional and default to <code>true</code>.
            </p>
            <p className="text-gray-600">
              Supported factor type keys: <code>sms</code>, <code>otp</code>, <code>email</code>,{' '}
              <code>push-notification</code>, <code>webauthn-platform</code>,{' '}
              <code>webauthn-roaming</code>, <code>recovery-code</code>.
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
              <li>
                <code>visible</code> — whether the factor row appears in the list (
                <code>false</code> hides it completely).
              </li>
              <li>
                <code>enabled</code> — whether the factor row is interactive (<code>false</code>{' '}
                renders it greyed-out and non-clickable).
              </li>
            </ul>
            <CodeBlock
              code={`<UserMFAMgmt
  factorConfig={{
    sms: { visible: true, enabled: true },
    otp: { visible: true, enabled: true },
    email: { visible: true, enabled: false }, // shown but greyed-out
    "webauthn-platform": { visible: false },  // hidden entirely
  }}
/>`}
              language="tsx"
              title="factorConfig example"
            />
          </div>
        </div>

        {/* Action Props */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Action Props</h3>
          <p className="text-gray-600">
            Action props let you hook into the component's lifecycle events and guard or cancel
            operations.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prop
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    onEnroll
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">{'() => void'}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Fired after a factor is successfully enrolled.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    onDelete
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">{'() => void'}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Fired after a factor is successfully deleted.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    onFetch
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">{'() => void'}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Fired after the user's factors are successfully loaded.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    onErrorAction
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {"(error: Error, action: 'enroll' | 'delete' | 'confirm') => void"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Fired when any action fails. Use this to surface errors to your own toast or
                    logging system.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    onBeforeAction
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {
                      "(action: 'enroll' | 'delete' | 'confirm', factorType: MFAType) => boolean | Promise<boolean>"
                    }
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Fired before an action executes. Return <code>false</code> (or a Promise
                    resolving to <code>false</code>) to cancel.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* onEnroll */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-900">onEnroll</h4>
            <p className="text-gray-600">
              Fires after a factor enrollment completes successfully. Use this to refresh related UI
              (e.g., an account security score card) or send analytics.
            </p>
            <CodeBlock
              code={`<UserMFAMgmt
  onEnroll={() => {
    analytics.track("MFA Factor Enrolled");
  }}
/>`}
              language="tsx"
              title="onEnroll example"
            />
          </div>

          {/* onDelete */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-900">onDelete</h4>
            <p className="text-gray-600">
              Fires after a factor is deleted successfully. Use this to refresh any UI that reflects
              the count of enrolled factors.
            </p>
            <CodeBlock
              code={`<UserMFAMgmt
  onDelete={() => {
    analytics.track("MFA Factor Deleted");
  }}
/>`}
              language="tsx"
              title="onDelete example"
            />
          </div>

          {/* onFetch */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-900">onFetch</h4>
            <p className="text-gray-600">
              Fires after the component's initial factor list load. Useful for showing or hiding
              adjacent UI that depends on whether the user has any enrolled factors.
            </p>
            <CodeBlock
              code={`<UserMFAMgmt
  onFetch={() => {
    setMFALoaded(true);
  }}
/>`}
              language="tsx"
              title="onFetch example"
            />
          </div>

          {/* onErrorAction */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-900">onErrorAction</h4>
            <p className="text-gray-600">
              Fires when an enroll, delete, or confirm step fails. The <code>action</code> parameter
              identifies which stage errored: <code>'enroll'</code> (initiating enrollment),{' '}
              <code>'confirm'</code> (submitting the OTP or QR code), or <code>'delete'</code>.
            </p>
            <CodeBlock
              code={`<UserMFAMgmt
  onErrorAction={(error, action) => {
    console.error(\`MFA \${action} failed:\`, error.message);
    toast.error(\`Something went wrong while trying to \${action} your factor.\`);
  }}
/>`}
              language="tsx"
              title="onErrorAction example"
            />
          </div>

          {/* onBeforeAction */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-900">onBeforeAction</h4>
            <p className="text-gray-600">
              Fires before an action executes. Return <code>false</code> or a Promise that resolves
              to <code>false</code> to cancel the operation. The <code>factorType</code> parameter
              identifies which factor type is involved.
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
              <li>
                For <code>'delete'</code>: fires before the built-in confirmation dialog is shown.
                Return <code>false</code> to cancel the deletion without ever showing the dialog.
              </li>
              <li>
                For <code>'enroll'</code> / <code>'confirm'</code>: use this for pre-flight checks
                (e.g., rate limiting, policy checks).
              </li>
            </ul>
            <CodeBlock
              code={`<UserMFAMgmt
  onBeforeAction={async (action, factorType) => {
    if (action === "delete") {
      return await confirmDialog(
        \`Remove your \${factorType} authenticator? You may be locked out if this is your only factor.\`
      );
    }
    return true;
  }}
/>`}
              language="tsx"
              title="onBeforeAction example"
            />
          </div>
        </div>

        {/* Customization Props */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Customization Props</h3>
          <p className="text-gray-600">
            Customization props let you adapt copy, validation rules, and styling without modifying
            source code.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prop
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
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
                  <td className="px-4 py-2 text-sm text-gray-500">{'Partial<MFAMessages>'}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Override default UI text and translations.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    styling
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {'ComponentStyling<UserMFAMgmtClasses>'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    CSS variables and class overrides.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    schema
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {'{ email?: RegExp; phone?: RegExp }'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Custom validation patterns for email and phone number input fields.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* customMessages */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-gray-900">customMessages</h4>
            <p className="text-gray-600">
              Customize all text and translations. Every field is optional and falls back to
              defaults.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-3">Available message groups</h5>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <strong>Top-level</strong>
                  <ul className="ml-4 list-disc space-y-1 mt-2">
                    <li>
                      <code>title</code>
                    </li>
                    <li>
                      <code>description</code>
                    </li>
                    <li>
                      <code>enabled</code> — badge label on enrolled factors
                    </li>
                    <li>
                      <code>no_active_mfa</code> — empty state when <code>showActiveOnly</code> is{' '}
                      <code>true</code>
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>Actions</strong>
                  <ul className="ml-4 list-disc space-y-1 mt-2">
                    <li>
                      <code>enroll</code> — enroll button label
                    </li>
                    <li>
                      <code>delete</code> — delete button label
                    </li>
                    <li>
                      <code>enroll_factor</code> — success message
                    </li>
                    <li>
                      <code>remove_factor</code> — success message
                    </li>
                    <li>
                      <code>deleting</code> — in-progress label
                    </li>
                    <li>
                      <code>cancel</code>
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>Delete confirmation</strong>
                  <ul className="ml-4 list-disc space-y-1 mt-2">
                    <li>
                      <code>delete_mfa_title</code>
                    </li>
                    <li>
                      <code>delete_mfa_content</code>
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>Per factor type</strong>
                  <p className="mt-2">
                    Replace <code>{'{factor}'}</code> with <code>sms</code>, <code>otp</code>,{' '}
                    <code>email</code>, <code>push-notification</code>,{' '}
                    <code>webauthn-platform</code>, <code>webauthn-roaming</code>,{' '}
                    <code>recovery-code</code>:
                  </p>
                  <ul className="ml-4 list-disc space-y-1 mt-2">
                    <li>
                      <code>{'{factor}.title'}</code>
                    </li>
                    <li>
                      <code>{'{factor}.description'}</code>
                    </li>
                    <li>
                      <code>{'{factor}.button-text'}</code>
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>Errors</strong>
                  <ul className="ml-4 list-disc space-y-1 mt-2">
                    <li>
                      <code>errors.factors_loading_error</code>
                    </li>
                    <li>
                      <code>errors.delete_factor</code>
                    </li>
                    <li>
                      <code>errors.failed</code>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <CodeBlock
              code={`<UserMFAMgmt
  customMessages={{
    title: "Two-Factor Authentication",
    description: "Add extra layers of security to protect your account.",
    no_active_mfa: "You haven't enrolled any authentication methods yet.",
    enroll: "Add method",
    delete_mfa_title: "Remove authentication method?",
    delete_mfa_content:
      "You will no longer be able to use this method to verify your identity.",
    sms: {
      title: "Text message (SMS)",
      description: "Receive a one-time code via text message.",
    },
    otp: {
      title: "Authenticator app",
      description: "Use Google Authenticator, Authy, or any TOTP app.",
    },
    errors: {
      factors_loading_error: "Unable to load your security methods.",
    },
  }}
/>`}
              language="tsx"
              title="customMessages example"
            />
          </div>

          {/* styling */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-gray-900">styling</h4>
            <p className="text-gray-600">
              Customize appearance with CSS variables and class overrides. Supports light/dark
              themes.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-4 text-sm text-blue-800">
                <div>
                  <strong>CSS Variables (styling.variables)</strong>
                  <ul className="ml-4 list-disc space-y-1 mt-2">
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
                  <strong>Class overrides (styling.classes)</strong>
                  <ul className="ml-4 list-disc space-y-1 mt-2">
                    <li>
                      <code>UserMFAMgmt-card</code> — the outer card wrapping the factor list
                    </li>
                    <li>
                      <code>UserMFASetupForm-dialogContent</code> — the enrollment multi-step dialog
                      content area
                    </li>
                    <li>
                      <code>DeleteFactorConfirmation-dialogContent</code> — the delete confirmation
                      dialog content area
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <CodeBlock
              code={`<UserMFAMgmt
  styling={{
    variables: {
      light: { "--color-primary": "#4f46e5" },
      dark: { "--color-primary": "#818cf8" },
    },
    classes: {
      "UserMFAMgmt-card": "rounded-2xl shadow-md border-2",
      "UserMFASetupForm-dialogContent": "max-w-lg",
      "DeleteFactorConfirmation-dialogContent": "max-w-sm",
    },
  }}
/>`}
              language="tsx"
              title="styling example"
            />
          </div>

          {/* schema */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-gray-900">schema</h4>
            <p className="text-gray-600">
              Override the built-in regex patterns used to validate user input during enrollment.
              Both fields are optional; unset fields keep their default patterns.
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
              <li>
                <code>email</code> — validates the email address entered during email-OTP enrollment
                (default: standard RFC-5322-style pattern).
              </li>
              <li>
                <code>phone</code> — validates the phone number entered during SMS enrollment
                (default: accepts international E.164 format).
              </li>
            </ul>
            <CodeBlock
              code={`<UserMFAMgmt
  schema={{
    // Restrict to company domain only
    email: /^[a-zA-Z0-9._%+-]+@acme\\.com$/,
    // US numbers only
    phone: /^\\+1[2-9]\\d{2}[2-9]\\d{6}$/,
  }}
/>`}
              language="tsx"
              title="schema example"
            />
          </div>
        </div>
      </section>

      {/* TypeScript Definitions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">TypeScript Definitions</h2>
        <p className="text-gray-600">
          Complete TypeScript interface definitions for all prop types:
        </p>
        <CodeBlock
          code={`type MFAType =
  | "sms"
  | "otp"
  | "email"
  | "push-notification"
  | "webauthn-platform"
  | "webauthn-roaming"
  | "recovery-code";

interface FactorConfigOptions {
  visible?: boolean;
  enabled?: boolean;
}

interface UserMFAMgmtClasses {
  "UserMFAMgmt-card"?: string;
  "UserMFASetupForm-dialogContent"?: string;
  "DeleteFactorConfirmation-dialogContent"?: string;
}

interface UserMFAMgmtProps {
  hideHeader?: boolean;
  showActiveOnly?: boolean;
  disableEnroll?: boolean;
  disableDelete?: boolean;
  readOnly?: boolean;
  factorConfig?: Partial<Record<MFAType, FactorConfigOptions>>;
  customMessages?: Partial<MFAMessages>;
  styling?: ComponentStyling<UserMFAMgmtClasses>;
  schema?: { email?: RegExp; phone?: RegExp };
  onEnroll?: () => void;
  onDelete?: () => void;
  onFetch?: () => void;
  onErrorAction?: (error: Error, action: "enroll" | "delete" | "confirm") => void;
  onBeforeAction?: (
    action: "enroll" | "delete" | "confirm",
    factorType: MFAType
  ) => boolean | Promise<boolean>;
}`}
          language="typescript"
          title="Complete TypeScript definitions"
        />
      </section>

      {/* Advanced Customization */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Advanced Customization</h2>
        <p className="text-gray-600">
          <code>UserMFAMgmt</code> is composed of a stateless view component and a hook. Import them
          individually when installed via shadcn to build custom workflows.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Components</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-1">UserMFAMgmtView</h4>
                <p className="text-sm text-gray-700">
                  Stateless view layer. Bring your own data and handlers via <code>useUserMFA</code>
                  .
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-1">UserMFASetupForm</h4>
                <p className="text-sm text-gray-700">
                  Multi-step enrollment dialog. Handles the full enrollment flow: contact entry
                  (phone/email), OTP verification, QR-code scanning (for TOTP and Push), and
                  recovery-code display.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-1">DeleteFactorConfirmation</h4>
                <p className="text-sm text-gray-700">
                  Confirmation dialog shown before a factor is deleted.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-1">FactorsList</h4>
                <p className="text-sm text-gray-700">
                  Renders the list of active enrollments within a factor-type row, with
                  per-enrollment delete buttons.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Hooks</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-1">useUserMFA</h4>
              <p className="text-sm text-gray-700">
                Full data and interaction layer: factor query, enrollment mutation, delete mutation,
                OTP confirmation, dialog state, and all event handlers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
