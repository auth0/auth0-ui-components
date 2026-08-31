# Auth0 Universal Components - Next.js Example

A Next.js application demonstrating Auth0 Universal Components with proxy-based authentication (RWA mode). This approach keeps tokens server-side and uses `@auth0/nextjs-auth0` for secure authentication.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Using Components](#using-components)
- [Troubleshooting](#troubleshooting)

## Prerequisites

1. **Node.js v20.9.0 or later**

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
cd ../next-rwa
pnpm install
pnpm dev
```

### 5. Access the application

Open [http://localhost:5173](http://localhost:5173) in your browser. Log in with the org admin credentials created during bootstrap.

## Using Components

The provider is already configured in `src/providers/client-provider.tsx` and styles are imported in `src/app/globals.css`. To enable a component, edit the corresponding page file. For example, to enable the Domain Table, edit `src/app/domain-management/page.tsx`:

```tsx
'use client';

import { DomainTable } from '@auth0/universal-components-react';

export default function DomainManagementPage() {
  return (
    <div className="p-6 pt-8 space-y-6">
      <DomainTable />
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

- Verify your `.env.local` file exists and contains all required variables:
  - `AUTH0_SECRET`
  - `AUTH0_DOMAIN`
  - `AUTH0_CLIENT_ID`
  - `AUTH0_CLIENT_SECRET`
  - `APP_BASE_URL`
  - `NEXT_PUBLIC_AUTH0_DOMAIN`
- Check that Auth0 application settings include `http://localhost:5173/api/auth/callback` in Allowed Callback URLs

### Port already in use

Next.js will automatically use the next available port if 5173 is in use. Check the terminal output for the actual port.

### pnpm command not found

Install pnpm globally: `npm install -g pnpm`

### Auth0 CLI not authenticated

Run `auth0 tenants list` to verify your session is active. Re-authenticate with `auth0 login` if needed.

### Proxy authentication errors

Ensure your Auth0 application is configured as a "Regular Web Application" (not SPA) for the RWA mode to work correctly.

## License

Copyright 2026 Okta, Inc.

Distributed under the [Apache License 2.0](https://github.com/auth0/auth0-ui-components/blob/main/LICENSE).
