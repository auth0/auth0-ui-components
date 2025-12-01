# React SPA with Auth0 Universal Components (shadcn) - Setup Guide

This guide will walk you through setting up and running the React SPA with Auth0 Universal Components (shadcn).

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **pnpm** - [Install pnpm](https://pnpm.io/installation)
- **Auth0 Account** - [Sign up for Auth0](https://auth0.com/signup)

**Auth0 Configuration Requirements:**

Different Auth0 Universal components may have specific configuration requirements.
**Please refer to the [Auth0 Universal Components Documentation](https://auth0-ui-components.vercel.app/getting-started) for detailed prerequisites for each component you plan to use.**

Basic Auth0 setup requirements for this sample application:

- Auth0 Application configured as Single Page Application
- Proper callback URLs, logout URLs, and web origins configured
- Required grant types enabled based on the components you're using

For component-specific Auth0 configuration (such as MFA grant types, social connections, etc.), check the individual component documentation pages.

## Getting Started

### 1. Environment Setup

Before running the application, you need to configure your Auth0 credentials:

1. **Create environment file:**

   In the root directory of your project (or in the example directory if working with monorepo), create a `.env` file:

   ```env
   VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your-auth0-client-id
   ```

2. **Configure Auth0 values:**

   Replace the placeholder values with your actual Auth0 credentials:
   - `VITE_AUTH0_DOMAIN`: Your Auth0 domain (found in your Auth0 Dashboard > Applications > Settings)
   - `VITE_AUTH0_CLIENT_ID`: Your Auth0 application client ID (found in the same location)

3. **Auth0 Application Settings:**

   Make sure your Auth0 application is configured with the following settings:
   - **Application Type**: Single Page Application
   - **Allowed Callback URLs**: `http://localhost:5173`
   - **Allowed Logout URLs**: `http://localhost:5173`
   - **Allowed Web Origins**: `http://localhost:5173`

### 2. Build the components package and install dependencies

Make sure you run install and build scripts **at the root of the project** before starting the dev server.

```sh
pnpm install
pnpm run build
```

### 3. Run the Development Server

```sh
pnpm run dev
```

Run this command from the `examples/react-spa-shadcn` directory.

### 4. Access the Application

Once the development server is running, you can access the application at:

**http://localhost:5173**

The application should now be running with Auth0 authentication integrated.

## Adding an Auth0 Component with Shadcn

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

### Step 2: Install a Component (e.g. OrgDetailsEdit Component)

Use the ShadCN CLI to add the OrgDetailsEdit component:

```sh
npx shadcn@latest add https://auth0-ui-components.vercel.app/r/my-org/org-details-edit.json
```

This will install the `OrgDetailsEdit` component in your `blocks/` directory.

**[Check docs](https://auth0-ui-components.vercel.app/) to view all available components.**

**Note:** If you encounter certificate issues, use this workaround:

```sh
NODE_TLS_REJECT_UNAUTHORIZED=0 npx shadcn@latest add https://auth0-ui-components.vercel.app/r/my-org/org-details-edit.json
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
                <Route path="/org-management" element={<OrganizationManagement />} />
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

### Step 4: Using a Component (e.g. OrgDetailsEdit Component)

Here's how to integrate the OrgDetailsEdit component in your organization management page (`src/pages/OrganizationManagement.tsx`):

```tsx
import Header from '@/components/Header';
import { useTranslation } from 'react-i18next';
// ========== Importing OrgDetailsEdit (choose the right folder path) ==========
import { OrgDetailsEdit } from '@/blocks/my-org/org-management/org-details-edit';

const OrganizationManagement = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">{t('org-management.title')}</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">{t('org-management.subtitle')}</h2>
          <p className="text-gray-600 mb-4">{t('org-management.description')}</p>
          {/* ========== Adding the component ========== */}
          <OrgDetailsEdit />
        </div>
      </div>
    </div>
  );
};

export default OrganizationManagement;
```

## Component Documentation

For detailed configuration options, props, troubleshooting, and component-specific requirements, please refer to the official component documentation:

**[Auth0 Universal Components Documentation](https://auth0-ui-components.vercel.app/getting-started)**

Each component has its own documentation page with:

- Complete prop references
- Configuration examples
- Auth0 setup requirements
- Common troubleshooting steps
- Best practices

Make sure to review the specific documentation for any component you plan to use, as different components may have unique Auth0 configuration requirements or setup steps.

## Technologies Used

This project is built with:

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **ShadCN UI** - Modern component library
- **Tailwind CSS** - Utility-first CSS framework
- **Auth0** - Authentication and authorization platform
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React i18next** - Internationalization

## Troubleshooting

### Common Issues

1. **Build Errors in Monorepo Setup**
   - Make sure you run `pnpm run build` at the project root before starting the dev server
   - Ensure all dependencies are installed with `pnpm install` at the root

2. **Auth0 Configuration Issues**
   - Verify your `.env` file is in the correct location
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
- Review [ShadCN UI Documentation](https://ui.shadcn.com)
- Open an issue in the project repository

---

**Note**: This setup guide assumes you're working with the latest version of the codebase. If you encounter version-specific issues, please refer to the project's main documentation or create an issue in the repository.

### License

Copyright 2025 Okta, Inc.

Distributed under the MIT License found [here](https://github.com/atko-cic/auth0-ui-components/blob/main/LICENSE).

**Authors**  
Okta Inc.
