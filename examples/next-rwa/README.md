# **Universal Components** demo for Next.js

A Next.js example that demonstrates Auth0 authentication using proxy mode along with Auth0 Universal Components demonstrating delegated administration.

## Jump to a section

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Adding a Universal Component](#adding-a-universal-component-to-your-app)
- [Universal Component Docs (Component-Specific Requirements)](#universal-component-docs-component-specific-requirements)
- [Troubleshooting](#troubleshooting)

## Prerequisites

1. **Node.js v20 or later** is required to run the bootstrapping process.

We recommend using [`nvm`](https://github.com/nvm-sh/nvm) to manage node versions in your development environment. Click these links to [learn how to install nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script) or [how to use nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#usage) to make sure you're using Node 20+.

2. **[`pnpm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) or a comparable package manager** installed in your development environment.

These instructions assume that you're using `pnpm`, which is automatically included as part of the Node.js installation from prerequisite 1.

3. **A new Auth0 tenant**.

**This is important!** Using a new Auth0 tenant for this sample application ensures you don't encounter any conflicts due to existing configuration in an existing tenant.

The tenant you create will be configured automatically by our bootstrapping command during the installation process. You can sign up for a free Auth0 account at [https://auth0.com/signup](https://auth0.com/signup?utm_source=github&utm_medium=thirdpartyutm_campaign=saastart). See [Create Tenants](https://auth0.com/docs/get-started/auth0-overview/create-tenants) in the Auth0 docs if you need help.

4. Continue with the **[Getting Started](#getting-started)** section.

## Getting Started

1. **Clone the repository and navigate to its folder:**

   ```bash
   git clone https://github.com/auth0/auth0-ui-components
   cd auth0-ui-components
   ```

2. **Build the components package and install dependencies:**

   ```bash
   pnpm install
   pnpm run build
   ```

3. **Navigate to the examples folder and install dependencies:**

   ```bash
   cd examples/next-rwa
   pnpm install
   ```

4. **Login to `auth0-cli` and execute the bootstrap script to setup your tenant:**

   Below `cli` command opens up a login prompt in your browser to select relevant tenant and confirm permissions.

   ```bash
   auth0 login --scopes "read:connection_profiles,create:connection_profiles,update:connection_profiles,read:user_attribute_profiles,create:user_attribute_profiles,update:user_attribute_profiles,read:client_grants,create:client_grants,update:client_grants,delete:client_grants,read:connections,create:connections,update:connections,create:organization_connections,create:organization_members,create:organization_member_roles,read:clients,create:clients,update:clients,read:client_keys,read:roles,create:roles,update:roles,read:resource_servers,create:resource_servers,update:resource_servers,update:tenant_settings"
   ```

   For a private-cloud tenant, authenticate using client-id and secret. If required, create a Machine to Machine application on your tenant authorized for Management API with relevant scopes.

   ```bash
   auth0 login --domain <tenant-domain> --client-id <client-id> --client-secret <client-secret>
   ```

   After successful login, verify your selected tenant is Active.

   ```bash
   auth0 tenants list
   ```

   > [!WARNING]  
   > The step below will modify your tenant configuration. Only execute this against a dev tenant.

   Execute the bootstrap script with the domain of your tenant.

   ```bash
   pnpm run auth0:bootstrap <your tenant domain>
   ```

   This scripts configures your tenant. If required it will also ask you to create an org admin and set password that you can use to login to the demo.

5. **Run the development server:**
   ```bash
   pnpm run dev
   ```

Open [http://localhost:5173](http://localhost:5173) to see the result.

## Adding a Universal Component to your app

In this example, we have routes defined within the side-bar at `examples/next-rwa/src/components/navigation/side-bar.tsx`.

The Domains route is served by `examples/next-rwa/src/app/domain-management/page.tsx` which currently renders an empty page.

Edit this file to uncomment `<DomainTable />` and deleted the `<p>` entry and save. Final result should look like below.

```typescript
'use client';

import { DomainTable } from '@auth0/universal-components-react/rwa';

export default function OrgManagementPage() {
  return (
    <div className="p-6 pt-8 space-y-6">
      <p>Follow Quickstart guidance on how to add Domain Management component.</p>
        <DomainTable />
    </div>
  );
}
```

Navigate to `Domains` menu items to view the Domain Management Universal Component.

## Universal Component Docs (Component-Specific Requirements)

For detailed configuration options, props, troubleshooting, and component-specific requirements, please refer to the official component documentation:

**[Auth0 Universal Components Documentation](https://auth0-ui-components.vercel.app/getting-started)**

**Important**: Each component may have specific Auth0 configuration requirements. Before using any component, please check the [Auth0 UI Components Documentation](https://auth0-ui-components.vercel.app/) for component-specific prerequisites and setup instructions.

## Troubleshooting

### Common Issues

1. **Build Errors in Monorepo Setup**
   - Make sure you run `pnpm run build` at the project root before starting the dev server
   - Ensure all dependencies are installed with `pnpm install` at the root

2. **Auth0 Configuration Issues**
   - Verify your `.env` file is in the correct location
   - Check that your Auth0 domain, client ID and configured variables are correct
   - Ensure Auth0 application settings match your local development URL

3. **Port Already in Use**
   - If port 5173 is already in use, Vite will automatically use the next available port
   - Check the terminal output for the actual port being used

4. **pnpm Command Not Found**
   - Install pnpm globally: `npm install -g pnpm`
   - Or use npx: `npx pnpm install`

### Getting Help

If you encounter any issues:

- Check the [Auth0 Documentation](https://auth0.com/docs)
- Open an issue in the project repository

---

**Note**: This setup guide assumes you're working with the latest version of the codebase. If you encounter version-specific issues, please refer to the project's main documentation or create an issue in the repository.

## License

Copyright 2025 Okta, Inc.

Distributed under the MIT License found [here](https://github.com/auth0/auth0-ui-components/blob/main/LICENSE).

**Authors**  
Okta Inc.
