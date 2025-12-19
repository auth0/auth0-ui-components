import CodeBlock from '../components/CodeBlock';

export default function MyOrgIntroduction() {
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
          <h1 className="text-4xl font-bold text-gray-900">My Organization Components</h1>
          <p className="text-xl text-gray-600">
            React components for building organization management interfaces with Auth0's My
            Organization API.
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
                  OrgDetailsEdit{' '}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3">
                    Available
                  </span>
                </h3>
                <p className="text-gray-600 mb-4">
                  Edit organization settings including name, display name, branding colors, and logo
                  with built-in validation and API integration.
                </p>
              </div>
              <a
                href="/my-org/org-details-edit"
                className="ml-4 inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors"
              >
                View Docs →
              </a>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  SsoProviderTable{' '}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3">
                    Available
                  </span>
                </h3>
                <p className="text-gray-600 mb-4">
                  Display and manage SSO identity providers with a comprehensive table interface
                  including create, edit, delete, enable/disable, and remove from organization
                  capabilities.
                </p>
              </div>
              <a
                href="/my-org/sso-provider-table"
                className="ml-4 inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors"
              >
                View Docs →
              </a>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  SsoProviderCreate{' '}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3">
                    Available
                  </span>
                </h3>
                <p className="text-gray-600 mb-4">
                  Multi-step wizard for creating SSO providers with provider selection, details
                  configuration, and authentication setup for Okta, ADFS, SAML, OIDC, Google
                  Workspace, Azure AD, and PingFederate.
                </p>
              </div>
              <a
                href="/my-org/sso-provider-create"
                className="ml-4 inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors"
              >
                View Docs →
              </a>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  SsoProviderEdit{' '}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3">
                    Available
                  </span>
                </h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive SSO provider management with tabbed interface for configuring
                  authentication settings, enabling provisioning with SCIM tokens, and managing
                  domain associations.
                </p>
              </div>
              <a
                href="/my-org/sso-provider-edit"
                className="ml-4 inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors"
              >
                View Docs →
              </a>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  DomainTable{' '}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3">
                    Available
                  </span>
                </h3>
                <p className="text-gray-600 mb-4">
                  Manage organization domains with create, verify, delete, and identity provider
                  association capabilities in a unified table interface.
                </p>
              </div>
              <a
                href="/my-org/domain-table"
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
          Before using any My Organization components, you need to configure your Auth0 tenant with
          the proper APIs, applications, and permissions. Follow these steps to set up your
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
                <h4 className="font-semibold text-blue-800">Enable Feature Flags</h4>
              </div>
              <div className="ml-9">
                <p className="text-blue-700 text-sm mb-2">
                  Contact support to enable the needed feature flags for your tenant:
                </p>
                <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> These feature flags are required and must be enabled by
                    Auth0 support before proceeding with the setup.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <div className="flex items-center mb-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">
                  2
                </div>
                <h4 className="font-semibold text-blue-800">Enable My Organization API</h4>
              </div>
              <div className="ml-9">
                <p className="text-blue-700 text-sm mb-2">
                  Go to <strong>APIs → My Organization API</strong> and make sure it's enabled.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <div className="flex items-center mb-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">
                  3
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
                  </div>
                  <div className="text-xs text-gray-600">• Set Login Experience:</div>
                  <div className="ml-4 space-y-1">
                    <div className="text-xs text-gray-600">- Business users</div>
                    <div className="text-xs text-gray-600">
                      - Prompt for Organization (optional)
                    </div>
                  </div>
                </div>
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> This example uses a Single Page Application, but you can
                    also configure a Regular Web Application (RWA) following similar steps.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div>
              <div className="flex items-center mb-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">
                  4
                </div>
                <h4 className="font-semibold text-blue-800">Setup Database & User</h4>
              </div>
              <div className="ml-9">
                <div className="bg-white rounded-lg p-3 space-y-2">
                  <div className="text-xs text-gray-600">• Create a Database connection</div>
                  <div className="text-xs text-gray-600">
                    • In Applications tab, enable your new SPA app
                  </div>
                  <div className="text-xs text-gray-600">
                    • Create a user in this database (for testing purposes)
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div>
              <div className="flex items-center mb-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">
                  5
                </div>
                <h4 className="font-semibold text-blue-800">Setup Role</h4>
              </div>
              <div className="ml-9">
                <div className="bg-white rounded-lg p-3 space-y-2">
                  <div className="text-xs text-gray-600">
                    • Create a role or use existing (e.g. "Org Admin")
                  </div>
                  <div className="text-xs text-gray-600">• Add required permissions:</div>
                  <div className="ml-4 space-y-1">
                    <div className="text-xs text-gray-600">- read:my_org:details</div>
                    <div className="text-xs text-gray-600">- update:my_org:details</div>
                    <div className="text-xs text-gray-600">- create:my_org:identity_providers</div>
                    <div className="text-xs text-gray-600">- read:my_org:identity_providers</div>
                    <div className="text-xs text-gray-600">- update:my_org:identity_providers</div>
                    <div className="text-xs text-gray-600">- delete:my_org:identity_providers</div>
                    <div className="text-xs text-gray-600">
                      - update:my_org:identity_providers_detach
                    </div>
                    <div className="text-xs text-gray-600">
                      - create:my_org:identity_providers_domains
                    </div>
                    <div className="text-xs text-gray-600">
                      - delete:my_org:identity_providers_domains
                    </div>
                    <div className="text-xs text-gray-600">- read:my_org:domains</div>
                    <div className="text-xs text-gray-600">- delete:my_org:domains</div>
                    <div className="text-xs text-gray-600">- create:my_org:domains</div>
                    <div className="text-xs text-gray-600">- update:my_org:domains</div>
                    <div className="text-xs text-gray-600">
                      - read:my_org:identity_providers_scim_tokens
                    </div>
                    <div className="text-xs text-gray-600">
                      - create:my_org:identity_providers_scim_tokens
                    </div>
                    <div className="text-xs text-gray-600">
                      - delete:my_org:identity_providers_scim_tokens
                    </div>
                    <div className="text-xs text-gray-600">
                      - create::my_org:identity_providers_provisioning
                    </div>
                    <div className="text-xs text-gray-600">
                      - read::my_org:identity_providers_provisioning
                    </div>
                    <div className="text-xs text-gray-600">
                      - delete::my_org:identity_providers_provisioning
                    </div>
                    <div className="text-xs text-gray-600">- read:my_org:configuration</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div>
              <div className="flex items-center mb-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">
                  6
                </div>
                <h4 className="font-semibold text-blue-800">Create Organization</h4>
              </div>
              <div className="ml-9">
                <p className="text-blue-700 text-sm mb-2">
                  Go to <strong>Organizations → Create Organization</strong>:
                </p>
                <div className="bg-white rounded-lg p-3 space-y-2">
                  <div className="text-xs text-gray-600">
                    • In Members: Add your user and assign the role
                  </div>
                  <div className="text-xs text-gray-600">
                    • In Connections: Enable your database
                  </div>
                </div>
              </div>
            </div>

            {/* Step 7 */}
            <div>
              <div className="flex items-center mb-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">
                  7
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
  "scope": [
    "read:my_org:details",
    "update:my_org:details",
    "create:my_org:identity_providers",
    "read:my_org:identity_providers",
    "update:my_org:identity_providers",
    "delete:my_org:identity_providers",
    "update:my_org:identity_providers_detach",
    "create:my_org:identity_providers_domains",
    "delete:my_org:identity_providers_domains",
    "read:my_org:domains",
    "delete:my_org:domains",
    "create:my_org:domains",
    "update:my_org:domains",
    "read:my_org:identity_providers_scim_tokens",
    "create:my_org:identity_providers_scim_tokens",
    "delete:my_org:identity_providers_scim_tokens",
    "create:my_org:identity_providers_provisioning",
    "read:my_org:identity_providers_provisioning",
    "delete:my_org:identity_providers_provisioning",
    "read:my_org:configuration"
  ],
  "client_id": "{{auth0_client_id}}", // use your app client_id
  "audience": "https://{{auth0_domain}}/my-org/", // use your domain
  "subject_type": "user"
}`}
                    language="json"
                    title="Client Grant Creation"
                  />
                </div>
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> You need a Management API token to make this request. For
                    example, you can get one from{' '}
                    <strong>Applications → APIs → Auth0 Management API → API Explorer</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 8 */}
            <div>
              <div className="flex items-center mb-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">
                  8
                </div>
                <h4 className="font-semibold text-blue-800">Configure Environment Variables</h4>
              </div>
              <div className="ml-9">
                <p className="text-blue-700 text-sm mb-2">
                  Create a <code>.env</code> file in your project with your Auth0 configuration. The
                  exact variables depend on your application type.
                </p>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Example for Single Page Applications (Vite/React):
                  </p>
                  <CodeBlock
                    code={`VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-spa-client-id`}
                    language="bash"
                    title=".env"
                  />
                </div>
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Environment variable configurations vary by framework and
                    setup. Check the <code className="bg-blue-100 px-1 rounded">examples/</code>{' '}
                    directory in the repository for specific implementation examples.
                  </p>
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
                <li>• User must be authenticated and member of an organization</li>
                <li>• Components automatically load organization data from current user context</li>
                <li>• All components share the same base setup requirements</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Start Building */}
      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold text-gray-900">Start Building</h2>
        <p className="text-lg text-gray-600 mb-6">
          Ready to add My Org components to your application? Choose your path:
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-xl">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Organization Management</h3>
              <p className="text-white/90 mb-4">
                Edit organization settings, branding, and configuration details.
              </p>
              <a
                href="/my-org/org-details-edit"
                className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium transition-colors"
              >
                Explore OrgDetailsEdit
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
              <h3 className="text-xl font-semibold mb-2">Explore All Components</h3>
              <p className="text-white/90 mb-4">
                Check the My Organization section in the sidebar to discover all available
                components for organization management, domain control, and more.
              </p>
              <a
                href="/my-org"
                className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium transition-colors"
              >
                Browse Components
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
        </div>
      </section>
    </div>
  );
}
