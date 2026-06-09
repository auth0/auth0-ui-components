import CodeBlock from '../components/CodeBlock';
import TabbedCodeBlock from '../components/TabbedCodeBlock';

export default function UserPasskeyMgmtDocs() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-4xl font-bold text-gray-900">UserPasskeyMgmt Component</h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            BETA
          </span>
        </div>
        <p className="text-xl text-gray-600">
          A passkey management component that lets users enroll and revoke WebAuthn passkeys on
          their account.
        </p>

        {/* Early Access callout */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-yellow-800">
            <strong>Early Access:</strong> This component is in Beta under the Okta Master
            Subscription Agreement. See{' '}
            <a
              href="https://docs.auth0.com/docs/release-stages"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-yellow-900"
            >
              Product Release Stages
            </a>{' '}
            for details. Behavior and APIs may change before General Availability.
          </p>
        </div>
      </div>

      {/* Component Preview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Component preview</h2>
        <div className="flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50 h-40 text-gray-500 text-sm">
          [Component screenshot pending]
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
                Before using the <strong>UserPasskeyMgmt</strong> component, ensure your tenant is
                configured with the My Account API, a custom domain, and the passkey-specific
                settings needed for WebAuthn to work correctly.
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
                  Passkey-Specific Requirements
                </h4>
                <ul className="space-y-2 text-blue-800 text-sm list-disc list-inside">
                  <li>
                    <strong>Enable Passkeys:</strong> In the Auth0 Dashboard, go to Security →
                    Passwordless and enable Passkeys for your database connection. See the{' '}
                    <a
                      href="https://auth0.com/docs/authenticate/database-connections/passkeys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-900"
                    >
                      Auth0 Passkeys guide →
                    </a>
                  </li>
                  <li>
                    <strong>Configure Passkey Policy:</strong> Set up your passkey policy (user
                    verification level, fallback behavior) in the Auth0 Dashboard. See{' '}
                    <a
                      href="https://auth0.com/docs/authenticate/database-connections/passkeys/configure-passkey-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-900"
                    >
                      Configure Passkey Policy →
                    </a>
                  </li>
                  <li>
                    <strong>Custom Domain (required):</strong> A custom domain must be configured in
                    the Auth0 Dashboard under Branding → Custom Domains. Passkeys are bound to a{' '}
                    <a
                      href="https://www.w3.org/TR/webauthn/#relying-party-identifier"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-900"
                    >
                      Relying Party ID
                    </a>{' '}
                    — Auth0 sets this to your custom domain (e.g. <code>acme.org</code>). Without a
                    custom domain, passkey enrollment will fail with a Relying Party error.
                  </li>
                  <li>
                    <strong>Matching origin:</strong> The Relying Party ID must equal your app's
                    domain or be a registrable parent of it. If your custom domain is{' '}
                    <code>acme.org</code>, your app must be served from <code>acme.org</code> or a
                    subdomain such as <code>app.acme.org</code>.
                  </li>
                  <li>
                    <strong>My Account API scopes:</strong> The user's token must include{' '}
                    <code>create:authentication_methods</code>,{' '}
                    <code>read:authentication_methods</code>, and{' '}
                    <code>update:authentication_methods</code> on the audience{' '}
                    <code>{'https://{domain}/api/v2/'}</code>.
                  </li>
                  <li>
                    <strong>HTTPS:</strong> WebAuthn requires a secure context. Ensure your app is
                    served over HTTPS (or <code>localhost</code> for local development).
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

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Option 2: Shadcn CLI</h3>
            <p className="text-gray-600 mb-4">
              If you're using shadcn, add the UserPasskeyMgmt block directly to your project:
            </p>
            <CodeBlock
              code="npx shadcn@latest add https://auth0-universal-components.vercel.app/r/my-account/user-passkey-management.json"
              language="bash"
              title="Add shadcn block"
            />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This installs the React component source code into{' '}
                <code>src/components/auth0/my-account/</code> along with all UI dependencies and the{' '}
                <code>@auth0/universal-components-core</code> package.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Getting Started</h2>
        <CodeBlock
          code={`import { UserPasskeyMgmt } from "@auth0/universal-components-react";

export function SecurityPage() {
  return <UserPasskeyMgmt />;
}`}
          language="tsx"
          title="Minimal implementation"
        />
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Import paths:</strong> Components are always imported from the root entry{' '}
            <code>@auth0/universal-components-react</code>, regardless of framework. Only{' '}
            <code>Auth0ComponentProvider</code> uses a framework-specific subpath: <code>/spa</code>{' '}
            for React SPAs, <code>/rwa</code> for Next.js apps. For shadcn installs, import from{' '}
            <code>@/components/auth0/my-account/user-passkey-management</code>.
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
import { UserPasskeyMgmt } from "@auth0/universal-components-react";
import { Auth0Provider } from "@auth0/auth0-react";
import { Auth0ComponentProvider } from "@auth0/universal-components-react/spa";
import { analytics } from "./lib/analytics";

function SecurityPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <UserPasskeyMgmt
        addAction={{
          onAfter: () => {
            analytics.track("Passkey Enrolled");
          },
        }}
        revokeAction={{
          onBefore: async (passkey) =>
            confirmDialog(\`Remove passkey "\${passkey.name}"?\`),
          onAfter: (passkey) => {
            analytics.track("Passkey Revoked", { passkeyId: passkey.id });
          },
        }}
        onErrorAction={(error, action) => {
          console.error(\`Passkey \${action} failed:\`, error.message);
        }}
        customMessages={{
          header: {
            title: "Passkeys",
            description: "Sign in faster and more securely without a password.",
          },
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
              code: `// app/security/passkeys/page.tsx
"use client";

import { UserPasskeyMgmt } from "@auth0/universal-components-react";
import { analytics } from "@/lib/analytics";

export default function PasskeysPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <UserPasskeyMgmt
        addAction={{
          onAfter: () => {
            analytics.track("Passkey Enrolled");
          },
        }}
        revokeAction={{
          onAfter: (passkey) => {
            analytics.track("Passkey Revoked", { passkeyId: passkey.id });
          },
        }}
        onErrorAction={(error, action) => {
          console.error(\`Passkey \${action} failed:\`, error.message);
        }}
        customMessages={{
          header: {
            title: "Passkeys",
            description: "Sign in faster and more securely without a password.",
          },
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
}`,
            },
            {
              label: 'shadcn',
              code: `import React from "react";
import { UserPasskeyMgmt } from "@/components/auth0/my-account/user-passkey-management";
import { Auth0Provider } from "@auth0/auth0-react";
import { Auth0ComponentProvider } from "@auth0/universal-components-react/spa";
import { analytics } from "./lib/analytics";

function SecurityPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <UserPasskeyMgmt
        addAction={{
          onAfter: () => {
            analytics.track("Passkey Enrolled");
          },
        }}
        revokeAction={{
          onBefore: async (passkey) =>
            confirmDialog(\`Remove passkey "\${passkey.name}"?\`),
          onAfter: (passkey) => {
            analytics.track("Passkey Revoked", { passkeyId: passkey.id });
          },
        }}
        onErrorAction={(error, action) => {
          console.error(\`Passkey \${action} failed:\`, error.message);
        }}
        customMessages={{
          header: {
            title: "Passkeys",
            description: "Sign in faster and more securely without a password.",
          },
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
          ]}
          language="tsx"
        />
      </section>

      {/* Props */}
      <section className="space-y-10">
        <h2 className="text-2xl font-semibold text-gray-900">Props</h2>

        {/* Required Props */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Required Props</h3>
          <p className="text-gray-600">
            <code>UserPasskeyMgmt</code> has no required props. It loads the current user's enrolled
            passkeys from the My Account API automatically.
          </p>
        </div>

        {/* Display Props */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Display Props</h3>
          <p className="text-gray-600">
            Display props control how the component renders without affecting its behavior.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Prop
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
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
                  <td className="px-4 py-2 text-sm text-gray-500">boolean</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">false</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Hide the page-level header (title and description). The passkey list card is
                    always shown.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Props */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Action Props</h3>
          <p className="text-gray-600">
            Action props handle user interactions. <code>addAction</code> and{' '}
            <code>revokeAction</code> follow the <code>ComponentAction</code> lifecycle-hook
            pattern, each exposing <code>disabled</code>, <code>onBefore</code>, and{' '}
            <code>onAfter</code>. Returning <code>false</code> from <code>onBefore</code> cancels
            the operation. <code>onFetch</code> and <code>onErrorAction</code> are flat callbacks.
          </p>

          {/* Action Props summary table */}
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Prop
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
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
                    addAction
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">ComponentAction&lt;void&gt;</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Lifecycle hooks for the add-passkey flow. Set <code>disabled: true</code> to
                    hide the add button.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    revokeAction
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    ComponentAction&lt;Passkey&gt;
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Lifecycle hooks for the revoke-passkey flow. Set <code>disabled: true</code> to
                    hide the revoke option.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    onFetch
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">{'() => void'}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Fired after the passkey list is successfully loaded.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    onErrorAction
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {"(error: Error, action: 'add' | 'revoke') => void"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Fired when an add or revoke action fails.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* addAction subsection */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-900">
              <code>addAction</code>: ComponentAction&lt;void&gt;
            </h4>
            <p className="text-gray-600">
              Controls the add-passkey flow. <code>onBefore</code> fires before the browser WebAuthn
              prompt is shown; return <code>false</code> to cancel (for example, to enforce a
              passkey limit). <code>onAfter</code> fires after the new passkey is saved.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
              <li>
                <code>disabled</code> — hide the "Add passkey" button.
              </li>
              <li>
                <code>onBefore()</code> — runs before the WebAuthn enrollment ceremony. Return{' '}
                <code>false</code> to cancel.
              </li>
              <li>
                <code>onAfter()</code> — runs after the passkey is successfully registered. Use this
                to refresh session state or send analytics.
              </li>
            </ul>
            <CodeBlock
              code={`<UserPasskeyMgmt
  addAction={{
    onBefore: async () => {
      if (passkeys.length >= 5) {
        toast.error("You can register a maximum of 5 passkeys.");
        return false;
      }
      return true;
    },
    onAfter: () => {
      analytics.track("Passkey Enrolled");
    },
  }}
/>`}
              language="tsx"
              title="addAction example"
            />
          </div>

          {/* revokeAction subsection */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-900">
              <code>revokeAction</code>: ComponentAction&lt;Passkey&gt;
            </h4>
            <p className="text-gray-600">
              Controls the revoke-passkey flow. The built-in confirmation modal is shown;{' '}
              <code>onBefore</code> runs after the user confirms the modal but before the API call,
              so you can still cancel at that point. <code>onAfter</code> fires after the passkey is
              deleted from the account.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
              <li>
                <code>disabled</code> — hide the revoke option from the per-passkey actions menu.
              </li>
              <li>
                <code>onBefore(passkey)</code> — runs before the revoke API call. Receives the{' '}
                <code>Passkey</code> object. Return <code>false</code> to cancel.
              </li>
              <li>
                <code>onAfter(passkey)</code> — runs after the passkey is successfully revoked.
                Receives the revoked <code>Passkey</code> object.
              </li>
            </ul>
            <CodeBlock
              code={`<UserPasskeyMgmt
  revokeAction={{
    onAfter: (passkey) => {
      auditLog.record({ action: "passkey_revoked", passkeyId: passkey.id });
    },
  }}
/>`}
              language="tsx"
              title="revokeAction example"
            />
          </div>

          {/* onFetch subsection */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-900">
              <code>onFetch</code>: () =&gt; void
            </h4>
            <p className="text-gray-600">
              Fires after the passkey list is successfully loaded on mount. Use this to show or hide
              adjacent UI that depends on whether the user has any registered passkeys.
            </p>
            <CodeBlock
              code={`<UserPasskeyMgmt
  onFetch={() => {
    setPasskeysLoaded(true);
  }}
/>`}
              language="tsx"
              title="onFetch example"
            />
          </div>

          {/* onErrorAction subsection */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-900">
              <code>onErrorAction</code>: (error: Error, action: 'add' | 'revoke') =&gt; void
            </h4>
            <p className="text-gray-600">
              Fires when an add or revoke action fails. The <code>action</code> parameter is{' '}
              <code>'add'</code> or <code>'revoke'</code>. Use this to surface errors in your own
              toast system or error logging service.
            </p>
            <CodeBlock
              code={`<UserPasskeyMgmt
  onErrorAction={(error, action) => {
    console.error(\`Passkey \${action} failed:\`, error.message);
    toast.error(\`Something went wrong while trying to \${action} your passkey.\`);
  }}
/>`}
              language="tsx"
              title="onErrorAction example"
            />
          </div>

          {/* Read-only mode note */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-900">Read-only mode</h4>
            <p className="text-gray-600">
              To render the list read-only, set <code>disabled: true</code> on both actions:
            </p>
            <CodeBlock
              code={`<UserPasskeyMgmt
  addAction={{ disabled: true }}
  revokeAction={{ disabled: true }}
/>`}
              language="tsx"
              title="Read-only mode"
            />
          </div>
        </div>

        {/* Customization Props */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Customization Props</h3>
          <p className="text-gray-600">
            Customization props let you adapt copy and styling without modifying source code.
          </p>

          {/* Customization Props summary table */}
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Prop
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
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
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Partial&lt;PasskeyMessages&gt;
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    Override default UI text and translations.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    styling
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    ComponentStyling&lt;UserPasskeyMgmtClasses&gt;
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    CSS variables and class overrides.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* customMessages subsection */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-900">
              <code>customMessages</code>: Partial&lt;PasskeyMessages&gt;
            </h4>
            <p className="text-gray-600">
              Customize all text and translations. Every field is optional and falls back to
              defaults.
            </p>
            <p className="text-gray-600">Available message groups:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
              <li>
                <strong>header</strong> — <code>title</code>, <code>description</code> (page-level
                header; hidden when <code>hideHeader</code> is <code>true</code>)
              </li>
              <li>
                <strong>Top-level card</strong> — <code>section_title</code>, <code>enabled</code>{' '}
                (badge shown when passkeys are enrolled), <code>no_passkeys</code> (empty state
                message), <code>add_passkey</code> (add button label)
              </li>
              <li>
                <strong>List items</strong> — <code>created_at</code> (use <code>{'${date}'}</code>{' '}
                as placeholder), <code>last_used</code> (use <code>{'${date}'}</code> as
                placeholder)
              </li>
              <li>
                <strong>Actions</strong> — <code>actions.revoke</code> (label in the per-passkey
                actions menu)
              </li>
              <li>
                <strong>Success toasts</strong> — <code>success.add</code>,{' '}
                <code>success.revoke</code>
              </li>
              <li>
                <strong>Revoke modal</strong> — <code>modals.revoke.title</code>,{' '}
                <code>modals.revoke.consent</code> (use <code>{'<bold>${name}</bold>'}</code> to
                bold the passkey name), <code>modals.revoke.cancel</code>,{' '}
                <code>modals.revoke.confirm</code>
              </li>
            </ul>
            <CodeBlock
              code={`<UserPasskeyMgmt
  customMessages={{
    header: {
      title: "Passkeys",
      description: "Sign in faster and more securely without a password.",
    },
    section_title: "Your passkeys",
    no_passkeys: "No passkeys registered yet.",
    add_passkey: "Add a passkey",
    created_at: "Added \${date}",
    last_used: "Last used \${date}",
    success: {
      add: "Passkey registered successfully.",
      revoke: "Passkey removed.",
    },
    modals: {
      revoke: {
        title: "Remove passkey?",
        consent: "This will permanently remove <bold>\${name}</bold>.",
        cancel: "Cancel",
        confirm: "Remove",
      },
    },
  }}
/>`}
              language="tsx"
              title="customMessages example"
            />
          </div>

          {/* styling subsection */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-900">
              <code>styling</code>: ComponentStyling&lt;UserPasskeyMgmtClasses&gt;
            </h4>
            <p className="text-gray-600">
              Customize appearance with CSS variables and class overrides. Supports light and dark
              themes.
            </p>
            <p className="text-gray-600">Variables:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
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
            <p className="text-gray-600">Class overrides:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
              <li>
                <code>UserPasskeyMgmt-root</code> — the outer card container wrapping the passkey
                list
              </li>
              <li>
                <code>UserPasskeyMgmt-item</code> — each individual passkey row card
              </li>
              <li>
                <code>PasskeyActionModal-modalContent</code> — the revoke confirmation modal content
                area
              </li>
            </ul>
            <CodeBlock
              code={`<UserPasskeyMgmt
  styling={{
    variables: {
      light: { "--color-primary": "#4f46e5" },
      dark: { "--color-primary": "#818cf8" },
    },
    classes: {
      "UserPasskeyMgmt-root": "rounded-2xl shadow-md",
      "UserPasskeyMgmt-item": "rounded-xl border border-gray-200",
      "PasskeyActionModal-modalContent": "max-w-sm",
    },
  }}
/>`}
              language="tsx"
              title="styling example"
            />
          </div>
        </div>
      </section>

      {/* TypeScript Definitions */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">TypeScript Definitions</h2>
        <CodeBlock
          code={`interface Passkey {
  id: string;
  name?: string;
  createdAt?: string;
  lastUsedAt?: string;
  deviceInfo?: string;
}

interface UserPasskeyMgmtClasses {
  "UserPasskeyMgmt-root"?: string;
  "UserPasskeyMgmt-item"?: string;
  "PasskeyActionModal-modalContent"?: string;
}

// ComponentAction provides before/after hooks and a disabled flag.
// Both hooks receive the same data type T.
interface ComponentAction<T, U = undefined> {
  disabled?: boolean;
  onBefore?: (data: T, extra?: U) => boolean | Promise<boolean>;
  onAfter?: (data: T, extra?: U) => void | Promise<void>;
}

interface UserPasskeyMgmtProps {
  hideHeader?: boolean;
  customMessages?: Partial<PasskeyMessages>;
  styling?: ComponentStyling<UserPasskeyMgmtClasses>;
  addAction?: ComponentAction<void>;
  revokeAction?: ComponentAction<Passkey>;
  onFetch?: () => void;
  onErrorAction?: (error: Error, action: "add" | "revoke") => void;
}`}
          language="typescript"
          title="Complete TypeScript definitions"
        />
      </section>

      {/* Advanced Customization */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Advanced Customization</h2>
        <p className="text-gray-600">
          <code>UserPasskeyMgmt</code> is composed of a stateless view component and a hook. Import
          them individually to build custom workflows (most useful when installed via shadcn).
        </p>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Available Components</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>
              <code>UserPasskeyMgmtView</code> — stateless view layer; bring your own data and
              handlers via <code>useUserPasskey</code>.
            </li>
            <li>
              <code>PasskeyActionModal</code> — the revoke confirmation modal. Can be rendered
              standalone if you need a custom revoke trigger separate from the passkey list.
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Available Hooks</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>
              <code>useUserPasskey</code> — full data and interaction layer: passkey list query,
              enroll mutation, revoke mutation, modal state, and all event handlers.
            </li>
          </ul>
        </div>
      </section>

      {/* Common Issues */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Common Issues</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Passkeys not available</h4>
            <p className="text-gray-700 text-sm">
              WebAuthn requires a secure origin. Ensure your app is served over HTTPS (or{' '}
              <code>localhost</code> for development). The browser must also support the Web
              Authentication API.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Enrollment fails with 400</h4>
            <p className="text-gray-700 text-sm">
              Ensure passkeys are enabled in your Auth0 Dashboard under Security → Passwordless and
              that the My Account API scopes include <code>create:authentication_methods</code> and{' '}
              <code>update:authentication_methods</code>.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Empty passkey list</h4>
            <p className="text-gray-700 text-sm">
              Verify the My Account API scope includes <code>read:authentication_methods</code>.
              Check the network tab to confirm the list API is returning passkey-typed entries.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              "The relying party ID is not a registrable domain suffix of, nor equal to the current
              domain"
            </h4>
            <p className="text-gray-700 text-sm mb-2">
              The browser enforces that the Relying Party ID must be equal to or a registrable
              domain suffix of the page's origin. This error means your app's domain doesn't match
              the RP ID Auth0 configured on your custom domain.
            </p>
            <ul className="text-gray-700 text-sm list-disc list-inside space-y-1">
              <li>
                Ensure your Auth0 custom domain (e.g. <code>acme.org</code>) matches the domain your
                app is served from, or is a parent domain of it (e.g. <code>app.acme.org</code>).
              </li>
              <li>
                If Auth0 fails to fetch the <code>.well-known/webauthn</code> resource from your
                claimed RP ID, verify that your custom domain is fully active and DNS is propagated
                in the Auth0 Dashboard under Branding → Custom Domains.
              </li>
              <li>
                Do not test passkey enrollment from a different origin (e.g. <code>localhost</code>{' '}
                or a tunnel domain that doesn't match the RP ID).
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
