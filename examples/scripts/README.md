# Auth0 Tenant Bootstrap Script

An interactive CLI script that configures your Auth0 tenant with everything needed to run the Universal Components example applications. The script discovers existing resources, builds a change plan, and only creates what's missing.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Usage](#usage)
- [What It Configures](#what-it-configures)
- [Auth0 CLI Scopes](#auth0-cli-scopes)
- [Generated Environment Variables](#generated-environment-variables)
- [Private-Cloud Tenants](#private-cloud-tenants)
- [Manual Configuration](#manual-configuration)

## Prerequisites

1. **Node.js v20 or later**

2. **Auth0 CLI** — Install from [auth0.com/docs/deploy-monitor/auth0-cli](https://auth0.com/docs/deploy-monitor/auth0-cli).

3. **An Auth0 tenant** — Sign up at [auth0.com/signup](https://auth0.com/signup) if you don't have one. You can use an existing tenant — the script will only add what's missing without modifying your existing configuration.

## Usage

### 1. Install dependencies

```bash
cd examples/scripts
pnpm install
```

### 2. Run the bootstrap script

```bash
pnpm run auth0:bootstrap <your-tenant-domain>
```

The tenant domain argument is required (e.g., `my-tenant.us.auth0.com`).

### 3. Follow the interactive prompts

The script will guide you through:

1. **Auth0 CLI authentication** — Automatically checks your CLI session and prompts you to log in if needed, requesting the [required scopes](#auth0-cli-scopes).
2. **Tenant validation** — Confirms the provided domain matches your active CLI tenant. If there's a mismatch, offers to switch or re-authenticate.
3. **Feature selection** — Choose which features to configure:
   - Full Example App Experience (My Organization + My Account)
   - Organization Management Only (My Organization)
   - User Self-Service Only (My Account)
4. **Example type selection** — Choose which example app to bootstrap:
   - Next.js (Regular Web Application)
   - React SPA with shadcn
   - React SPA with npm
5. **Resource discovery** — Scans your tenant for existing resources and builds a change plan.
6. **Change plan review** — Displays a summary of resources to create, update, or skip.
7. **Confirmation** — Prompts for your approval before applying any changes.
8. **Apply changes** — Creates and configures the required Auth0 resources.
9. **Environment file generation** — Writes a `.env.local` (or `.env`) file to the selected example directory.

## What It Configures

The script creates and configures the following Auth0 resources based on your feature selection:

### Core Resources (always created)

| Resource                   | Details                                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Application**            | SPA or Regular Web Application configured for `http://localhost:5173` with refresh token rotation and organization settings |
| **Database Connection**    | `Universal-Components-Demo` connection enabled for the application                                                          |
| **Connection Profile**     | `Universal-Components-Profile` with SCIM and Universal Logout enabled                                                       |
| **User Attribute Profile** | Attribute mappings for the application                                                                                      |
| **Tenant Settings**        | Friendly name, identifier-first login prompt                                                                                |

### My Organization Resources (if enabled)

| Resource                | Details                                                   |
| ----------------------- | --------------------------------------------------------- |
| **My Organization API** | Resource server at `https://{domain}/my-org/`             |
| **Client Grant**        | Application authorized for all My Organization API scopes |
| **Admin Role**          | `admin` role with all My Organization API permissions     |
| **Organization**        | `demo-org` with database connection enabled               |
| **Organization Member** | Test user created and assigned the admin role             |

### My Account Resources (if enabled)

| Resource           | Details                                                           |
| ------------------ | ----------------------------------------------------------------- |
| **My Account API** | Resource server at `https://{domain}/me/`                         |
| **Client Grant**   | Application authorized for My Account API scopes (MFA enrollment) |

## Auth0 CLI Scopes

The bootstrap script requires the following Auth0 CLI scopes. These are automatically requested when the script triggers a login:

```
read:connection_profiles
create:connection_profiles
update:connection_profiles
read:user_attribute_profiles
create:user_attribute_profiles
update:user_attribute_profiles
read:client_grants
create:client_grants
update:client_grants
delete:client_grants
read:connections
create:connections
update:connections
create:organization_connections
create:organization_members
create:organization_member_roles
read:clients
create:clients
update:clients
read:client_keys
read:roles
create:roles
update:roles
read:resource_servers
create:resource_servers
update:resource_servers
update:tenant_settings
```

If you need to manually authenticate the Auth0 CLI with these scopes:

```bash
auth0 login --scopes "read:connection_profiles,create:connection_profiles,update:connection_profiles,read:user_attribute_profiles,create:user_attribute_profiles,update:user_attribute_profiles,read:client_grants,create:client_grants,update:client_grants,delete:client_grants,read:connections,create:connections,update:connections,create:organization_connections,create:organization_members,create:organization_member_roles,read:clients,create:clients,update:clients,read:client_keys,read:roles,create:roles,update:roles,read:resource_servers,create:resource_servers,update:resource_servers,update:tenant_settings"
```

## Generated Environment Variables

The script generates an environment file in the selected example directory.

### Next.js (`examples/next-rwa/.env.local`)

| Variable                        | Description                                    |
| ------------------------------- | ---------------------------------------------- |
| `AUTH0_SECRET`                  | Randomly generated 32-byte hex secret          |
| `APP_BASE_URL`                  | Application base URL (`http://localhost:5173`) |
| `AUTH0_DOMAIN`                  | Auth0 tenant domain                            |
| `AUTH0_CLIENT_ID`               | Application client ID                          |
| `AUTH0_CLIENT_SECRET`           | Application client secret                      |
| `AUTH0_SCOPE`                   | Space-separated OAuth scopes                   |
| `NEXT_PUBLIC_AUTH0_DOMAIN`      | Auth0 domain (client-side)                     |
| `NEXT_PUBLIC_ENABLE_MY_ACCOUNT` | My Account feature toggle                      |

### React SPA (`examples/react-spa-npm/.env` or `examples/react-spa-shadcn/.env.local`)

| Variable               | Description           |
| ---------------------- | --------------------- |
| `VITE_AUTH0_DOMAIN`    | Auth0 tenant domain   |
| `VITE_AUTH0_CLIENT_ID` | Application client ID |

## Private-Cloud Tenants

> [!IMPORTANT]
> The bootstrap script does not support private-cloud tenants. Follow the [manual configuration](#manual-configuration) steps below or the [official documentation](https://auth0.com/docs/get-started/universal-components/my-organization/build-delegated-admin#create-application) to set up your tenant.

## Manual Configuration

If you prefer to configure your tenant manually, or if you are on a private-cloud tenant, follow these steps.

### 1. Create an Application

1. Navigate to [**Auth0 Dashboard > Applications > Applications**](https://manage.auth0.com/#/applications) and select **Create Application**.
2. Choose **Single Page Web Applications** for React SPAs, or **Regular Web Application** for Next.js.
3. In the **Settings** tab, add `http://localhost:5173` to:
   - Allowed Callback URLs (use `http://localhost:5173/auth/callback` for Next.js)
   - Allowed Logout URLs
4. Under **Login Experience**, select:
   - Business users
   - (Optional) Prompt for Organization

### 2. Enable the My Organization API

1. Navigate to [**Auth0 Dashboard > Applications > APIs**](https://manage.auth0.com/#/applications).
2. Select **My Organization API** and ensure it is enabled for your tenant.

### 3. Configure Application Access

1. Navigate to the **Application Access** tab of the My Organization API.
2. Select **Edit** for your application and configure:
   - **Connection Profile**: Select or create a profile with connection attribute mappings.
   - **User Attribute Profile**: Select or create a profile with user attribute mappings.
   - **Supported Identity Providers**: Enable providers your customers can use.
   - **Connection Deletion Behavior**: Choose **Allow** or **Allow if Empty**.
   - **User Access Authorization**: Choose **Unauthorized**, **Authorized**, or **All**.
   - **Client Credential Access Authorization**: Choose **Unauthorized**, **Authorized**, or **All**.
3. Select **Save**.

### 4. Set Up a Database Connection and User

1. Navigate to [**Auth0 Dashboard > Authentication > Database**](https://manage.auth0.com/#/connections/database) and create a database connection.
2. In the connection's **Applications** tab, enable your application.
3. Create a test user in this database for initial testing.

### 5. Set Up a Role

1. Navigate to **Auth0 Dashboard > User Management > Roles** and create a role (e.g., "Organization Admin").
2. Add the following My Organization API scopes to the role:

<details>
<summary>Required My Organization API scopes</summary>

```
read:my_org:details
update:my_org:details
create:my_org:identity_providers
read:my_org:identity_providers
update:my_org:identity_providers
delete:my_org:identity_providers
update:my_org:identity_providers_detach
create:my_org:identity_providers_domains
delete:my_org:identity_providers_domains
read:my_org:domains
delete:my_org:domains
create:my_org:domains
update:my_org:domains
read:my_org:identity_providers_scim_tokens
create:my_org:identity_providers_scim_tokens
delete:my_org:identity_providers_scim_tokens
create:my_org:identity_providers_provisioning
read:my_org:identity_providers_provisioning
delete:my_org:identity_providers_provisioning
read:my_org:configuration
read:my_org:member_invitations
delete:my_org:member_invitations
create:my_org:member_invitations
read:my_org:member_roles
delete:my_org:member_roles
create:my_org:member_roles
read:my_org:members
delete:my_org:memberships
read:my_org:permissions
read:my_org:user_stores
```

</details>

> [!NOTE]
> The user's token will only include permissions that exist in both their assigned role and the User Access Authorization settings configured in step 3.

### 6. Create an Organization

1. Navigate to [**Auth0 Dashboard > Organizations**](https://manage.auth0.com/#/organizations) and create an organization.
2. In **Members**: Add your test user and assign the "Organization Admin" role.
3. In **Connections**: Enable your database connection.

### 7. Configure Environment Variables

Create the environment file in your example directory:

**React SPA** (`.env` or `.env.local`):

```bash
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-spa-client-id
```

**Next.js** (`.env.local`):

```bash
AUTH0_SECRET=use-a-long-random-secret-value
APP_BASE_URL=http://localhost:5173
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_SCOPE=openid profile email offline_access
NEXT_PUBLIC_AUTH0_DOMAIN=your-domain.auth0.com
NEXT_PUBLIC_ENABLE_MY_ACCOUNT=true
```

For the full guide, see the [Build a Delegated Admin](https://auth0.com/docs/get-started/universal-components/my-organization/build-delegated-admin#create-application) documentation.
