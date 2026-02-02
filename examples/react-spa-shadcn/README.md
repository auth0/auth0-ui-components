# **Universal Components** demo for React (shadcn)

A React (shadcn) example that demonstrates Auth0 authentication using a SPA along with Auth0 Universal Components demonstrating delegated administration.

## Jump to a section

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Adding a Universal Component with Shadcn](#adding-a-universal-component-with-shadcn)
- [Universal Component Docs (Component-Specific Requirements)](#universal-component-docs-component-specific-requirements)
- [Troubleshooting](#troubleshooting)

## Prerequisites

1. **Node.js v20 or later** is required to run the bootstrapping process.

We recommend using [`nvm`](https://github.com/nvm-sh/nvm) to manage node versions in your development environment. Click these links to [learn how to install nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script) or [how to use nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#usage) to make sure you're using Node 20+.

2. **[`pnpm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) or a comparable package manager** installed in your development environment.

These instructions assume that you're using `pnpm`, which is automatically included as part of the Node.js installation from prerequisite 1.

3. **A new Auth0 tenant**.

**This is important!** Using a new Auth0 tenant for this sample application ensures you don't encounter any conflicts due to existing configuration in an existing tenant. You can sign up for a free Auth0 account at [https://auth0.com/signup](https://auth0.com/signup?utm_source=github&utm_medium=thirdpartyutm_campaign=universal-components). See [Create Tenants](https://auth0.com/docs/get-started/auth0-overview/create-tenants) in the Auth0 docs if you need help.

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

3. **Navigate to `examples/scripts` and install bootstrap dependencies:**

   ```bash
   cd examples/scripts
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

5. **Navigate to examples folder, install dependencies:**

   ```bash
   cd ../react-spa-shadcn
   pnpm install
   pnpm run dev
   ```

6. **Access the Application:**

   Once the development server is running, you can access the application at:

   **http://localhost:5173**

   The application should now be running with Auth0 authentication integrated.

## Adding a Universal Component with Shadcn

### Step 1: Setup Shadcn UI

If you haven't already set up Shadcn UI in your project, run the following command to initialize it:

```sh
npx shadcn@latest init
```

You'll be prompted to configure your project. Choose the following options:

- **Which style would you like to use?** → Default
- **Which color would you like to use as base color?** → Slate (or your preferred color)
- **Would you like to use CSS variables for colors?** → Yes
- **Where is your global CSS file?** → src/index.css (or your main CSS file)
- **Would you like to use CSS variables for colors?** → Yes
- **Where is your tailwind.config.js located?** → tailwind.config.js
- **Configure the import alias for components?** → src/components
- **Configure the import alias for utils?** → src/lib/utils

This will:

- Install required dependencies
- Add a `components.json` file to your project
- Configure your `tailwind.config.js`
- Create a `src/lib/utils.ts` file with utility functions
- Set up the proper directory structure for components

### Step 2: Install a Component (e.g. OrganizationDetailsEdit Component)

Use the ShadCN CLI to add the OrganizationDetailsEdit component:

```sh
npx shadcn@latest add https://ui.auth0.com/r/my-organization/organization-details-edit.json
```

This will install the `OrganizationDetailsEdit` component in your `blocks/` directory.

**[Check docs](https://ui.auth0.com/) to view all available components.**

**Note:** If you encounter certificate issues, use this workaround:

```sh
NODE_TLS_REJECT_UNAUTHORIZED=0 npx shadcn@latest add https://ui.auth0.com/r/my-organization/organization-details-edit.json
```

### Step 3: Configure the Auth0 Component Provider

Update your main App component (`src/App.tsx`) to include the Auth0 Component provider:

```tsx
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route, BrowserRouter } from '@/components/RouterCompat';
import Index from './pages/Index';
import OrganizationManagement from './pages/OrganizationManagement';
import { Auth0Provider } from '@auth0/auth0-react';
import { useTranslation } from 'react-i18next';
import { config } from './config/env';
// ========== Importing Component Provider (choose the right folder path) ==========
import { Auth0ComponentProvider } from '@/providers/spa-provider';

const queryClient = new QueryClient();

const App = () => {
  const { i18n } = useTranslation();
  const defaultAuthDetails = {
    clientId: config.auth0.clientId,
    domain: config.auth0.domain,
  };
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Auth0Provider
            domain={config.auth0.domain}
            clientId={config.auth0.clientId}
            authorizationParams={{ redirect_uri: window.location.origin }}
          >
            {/* Wrapping routes with Auth0ComponentProvider*/}
            <Auth0ComponentProvider
              authDetails={defaultAuthDetails}
              i18n={{ currentLanguage: i18n.language }}
            >
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/organization-management" element={<OrganizationManagement />} />
              </Routes>
            </Auth0ComponentProvider>
          </Auth0Provider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
```

### Step 4: Using a Component (e.g. OrganizationDetailsEdit Component)

Here's how to integrate the OrganizationDetailsEdit component in your organization management page (`src/pages/OrganizationManagement.tsx`):

```tsx
import Header from '@/components/Header';
import { useTranslation } from 'react-i18next';
// ========== Importing OrganizationDetailsEdit (choose the right folder path) ==========
import { OrganizationDetailsEdit } from '@/blocks/my-organization/organization-management/organization-details-edit';

const OrganizationManagement = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">
          {t('organization-management.title')}
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            {t('organization-management.subtitle')}
          </h2>
          <p className="text-gray-600 mb-4">{t('organization-management.description')}</p>
          {/* ========== Adding the component ========== */}
          <OrganizationDetailsEdit />
        </div>
      </div>
    </div>
  );
};

export default OrganizationManagement;
```

## Universal Component Docs (Component-Specific Requirements)

For detailed configuration options, props, troubleshooting, and component-specific requirements, please refer to the official component documentation:

**[Auth0 Universal Components Documentation](https://ui.auth0.com/getting-started)**

**Important**: Each component may have specific Auth0 configuration requirements. Before using any component, please check the [Auth0 UI Components Documentation](https://ui.auth0.com/) for component-specific prerequisites and setup instructions.

## Troubleshooting

### Common Issues

1. **Build Errors in Monorepo Setup**
   - Make sure you run `pnpm run build` at the project root before starting the dev server
   - Ensure all dependencies are installed with `pnpm install` at the root

2. **Auth0 Configuration Issues**
   - Verify your `.env.local` file is in the correct location
   - Check that your Auth0 domain and client ID are correct
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
