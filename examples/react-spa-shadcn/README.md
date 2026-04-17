# Auth0 Universal Components - React SPA (shadcn) Example

A React single-page application demonstrating Auth0 Universal Components with shadcn installation. This approach gives you full source code ownership for maximum customization.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Adding Components with shadcn](#adding-components-with-shadcn)
- [Using Components](#using-components)
- [Troubleshooting](#troubleshooting)

## Prerequisites

1. **Node.js v20 or later**

   We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node versions. See [how to install nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script) or [how to use nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#usage).

2. **pnpm**

   Install globally with npm:

   ```bash
   npm install -g pnpm
   ```

   Or see [pnpm.io/installation](https://pnpm.io/installation) for other installation methods.

3. **Auth0 CLI**

   Required for the bootstrap script that configures your tenant. Install from [auth0.com/docs/deploy-monitor/auth0-cli](https://auth0.com/docs/deploy-monitor/auth0-cli).

4. **An Auth0 tenant**

   Sign up for a free Auth0 account at [auth0.com/signup](https://auth0.com/signup) if you don't have one. See [Create Tenants](https://auth0.com/docs/get-started/auth0-overview/create-tenants) if you need help. You can use an existing tenant — the bootstrap script will only add what's missing without modifying your existing configuration.

## Getting Started

### 1. Clone and install dependencies

```bash
git clone https://github.com/auth0/auth0-ui-components
cd auth0-ui-components
pnpm install
pnpm build
```

### 2. Install bootstrap script dependencies

```bash
cd examples/scripts
pnpm install
```

### 3. Configure your Auth0 tenant

Run the bootstrap script to handle Auth0 CLI authentication and configure your tenant with the necessary APIs, applications, roles, and organization. See the [bootstrap script README](../scripts/README.md) for detailed usage, required CLI scopes, and what it configures.

```bash
pnpm run auth0:bootstrap <your-tenant-domain>
```

Alternatively, you can follow the [manual configuration guide](https://auth0.com/docs/get-started/universal-components/my-organization/build-delegated-admin#create-application) and create a `.env.local` file with your tenant credentials.

> [!IMPORTANT]
> **Private-cloud tenants** are not supported by the bootstrap script. Follow the [manual configuration guide](https://auth0.com/docs/get-started/universal-components/my-organization/build-delegated-admin#create-application) to set up your tenant.

### 4. Start the development server

```bash
cd ../react-spa-shadcn
pnpm install
pnpm dev
```

### 5. Access the application

Open [http://localhost:5173](http://localhost:5173) in your browser. Log in with the org admin credentials created during bootstrap.

## Adding Components with shadcn

Use the shadcn CLI to add components from the Auth0 registry. For example, to add the Organization Details component:

```bash
npx shadcn@latest add https://ui.auth0.com/r/my-organization/organization-details-edit.json
```

This installs the component source code to your `components/auth0/` directory. See the [full list of available components](https://auth0.com/docs/get-started/universal-components/my-organization/build-delegated-admin#available-components) in the documentation.

## Using Components

The provider is already configured in `src/App.tsx` and styles are included with the shadcn-installed source code. Components are imported from the local `components/auth0/` directory. For example:

```tsx
import { OrganizationDetailsEdit } from '@/components/auth0/my-organization/organization-details-edit';

function OrganizationSettingsPage() {
  return (
    <div>
      <h1>Organization Settings</h1>
      <OrganizationDetailsEdit />
    </div>
  );
}
```

For component-specific configuration requirements, see the [Auth0 Universal Components documentation](https://auth0.com/docs/get-started/universal-components/universal-components-overview).

## Troubleshooting

### Build errors

- Run `pnpm build` at the project root before starting the dev server
- Ensure all dependencies are installed with `pnpm install` at the root

### Auth0 configuration issues

- Verify your `.env.local` file exists and contains the correct values
- Check that Auth0 application settings include `http://localhost:5173` in Allowed Callback URLs

### Port already in use

Vite will automatically use the next available port if 5173 is in use. Check the terminal output for the actual port.

### pnpm command not found

Install pnpm globally: `npm install -g pnpm`

### Auth0 CLI not authenticated

Run `auth0 tenants list` to verify your session is active. Re-authenticate with `auth0 login` if needed.

### shadcn certificate issues

If you encounter TLS certificate errors when installing components:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npx shadcn@latest add https://ui.auth0.com/r/my-organization/organization-details-edit.json
```

## License

Copyright 2026 Okta, Inc.

Distributed under the [Apache License 2.0](https://github.com/auth0/auth0-ui-components/blob/main/LICENSE).
