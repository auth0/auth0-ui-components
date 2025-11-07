import CodeBlock from '../components/CodeBlock';

export default function MyAccountIntroduction() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-700/10 rounded-xl"></div>
        <div
          className="relative space-y-4 p-6 border-l-4 border-gradient-to-b from-blue-600 to-purple-600"
          style={{ borderImage: 'linear-gradient(to bottom, rgb(37 99 235), rgb(147 51 234)) 1' }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full"></div>
            <span className="text-sm font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full flex items-center">
              <svg
                className="w-3 h-3 text-blue-600 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              My Account
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
              BETA
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">My Account Components</h1>
          <p className="text-xl text-gray-600">
            React components for building user account management interfaces with Auth0's My Account
            features.
          </p>
        </div>
      </div>

      {/* Available Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Available Components</h2>
        <div className="grid gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  UserMFAMgmt{' '}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3">
                    Available
                  </span>
                </h3>
                <p className="text-gray-600 mb-4">
                  A comprehensive Multi-Factor Authentication (MFA) management component that allows
                  users to view, enroll, and delete MFA factors including phone, OTP, email, and
                  push notifications.
                </p>
              </div>
              <a
                href="/my-account/user-mfa-management"
                className="ml-4 inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors"
              >
                View Docs →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Prerequisites */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Setup Requirements</h2>
        <p className="text-gray-600 mb-6">
          Before using any My Account components, you need to configure your Auth0 tenant with the
          proper applications, MFA settings, and permissions. Follow these steps to set up your
          environment:
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Auth0 Dashboard Configuration</h3>

          <div className="space-y-6">
            {/* Step 1 */}
            <div>
              <div className="flex items-center mb-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">
                  1
                </div>
                <h4 className="font-semibold text-blue-800">Enable My Account API</h4>
              </div>
              <div className="ml-9">
                <p className="text-blue-700 text-sm mb-2">
                  Go to <strong>APIs → Auth0 My Account API</strong> and make sure it's enabled.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <div className="flex items-center mb-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">
                  2
                </div>
                <h4 className="font-semibold text-blue-800">Create SPA Application</h4>
              </div>
              <div className="ml-9">
                <p className="text-blue-700 text-sm mb-2">
                  Go to <strong>Applications → Create Application</strong>:
                </p>
                <div className="bg-white rounded-lg p-3 space-y-2">
                  <div className="text-xs text-gray-600">
                    • Choose "Single Page Web Applications"
                  </div>
                  <div className="text-xs text-gray-600">
                    • For development mode, add <code>http://localhost:5173</code> to:
                  </div>
                  <div className="ml-4 space-y-1">
                    <div className="text-xs text-gray-600">- Allowed Callback URLs</div>
                    <div className="text-xs text-gray-600">- Allowed Logout URLs</div>
                    <div className="text-xs text-gray-600">- Allowed Web Origins</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <div className="flex items-center mb-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">
                  3
                </div>
                <h4 className="font-semibold text-blue-800">Setup Database & User</h4>
              </div>
              <div className="ml-9">
                <div className="bg-white rounded-lg p-3 space-y-2">
                  <div className="text-xs text-gray-600">• Create a Database connection</div>
                  <div className="text-xs text-gray-600">
                    • In Applications tab, enable your new SPA app
                  </div>
                  <div className="text-xs text-gray-600">• Create a test user in this database</div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div>
              <div className="flex items-center mb-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">
                  4
                </div>
                <h4 className="font-semibold text-blue-800">Create Client Grant</h4>
              </div>
              <div className="ml-9">
                <p className="text-blue-700 text-sm mb-2">
                  Create a client grant for the user & client pair to solve access control:
                </p>
                <div className="bg-white rounded-lg p-3">
                  <CodeBlock
                    code={`POST https://{{auth0_domain}}/api/v2/client-grants
{
  "client_id": "{{auth0_client_id}}", // use your app client_id
  "audience": "https://{{auth0_domain}}/me/", // use your domain
  "scope": [
    "read:me:authentication_methods",
    "delete:me:authentication_methods",
    "update:me:authentication_methods",
    "read:me:factors",
    "create:me:authentication_methods"
  ],
  "subject_type": "user"
}`}
                    language="json"
                    title="Client Grant Creation"
                  />
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div>
              <div className="flex items-center mb-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">
                  5
                </div>
                <h4 className="font-semibold text-blue-800">Environment Variables</h4>
              </div>
              <div className="ml-9">
                <p className="text-blue-700 text-sm mb-2">
                  Create a <code>.env</code> file in your project:
                </p>
                <div className="bg-white rounded-lg p-3">
                  <CodeBlock
                    code={`VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-spa-client-id`}
                    language="bash"
                    title=".env"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Quick Notes</h4>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li>• User must be authenticated before using these components</li>
                <li>
                  • MFA configuration may take a few minutes to propagate across Auth0's systems
                </li>
                <li>• Test MFA enrollment in a development environment before production</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Start Building */}
      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold text-gray-900">Start Building</h2>
        <p className="text-lg text-gray-600 mb-6">
          Ready to add My Account components to your application? Choose your path:
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl">
            <div className="relative z-10">
              <div className="mb-3 flex items-center">
                <svg
                  className="w-8 h-8 text-white/90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">MFA Management</h3>
              <p className="text-white/90 mb-4">
                Enable users to manage their multi-factor authentication settings and secure their
                accounts.
              </p>
              <a
                href="/my-account/user-mfa-management"
                className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium transition-colors"
              >
                Explore UserMFAMgmt
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-4 -translate-x-4"></div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-600 via-gray-600 to-zinc-700 p-6 text-white shadow-xl">
            <div className="relative z-10">
              <div className="mb-3">
                <svg
                  className="w-8 h-8 text-white/90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">More Components Coming</h3>
              <p className="text-white/90 mb-4">
                Additional account management features like profile editing, password changes, and
                more will be added soon.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg font-medium text-white/70">
                Coming Soon
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-4 -translate-x-4"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
