# React SPA with ShadCN UI - Setup Guide

A modern React single-page application built with Vite, TypeScript, and ShadCN UI components, featuring integrated Auth0 authentication and multi-factor authentication (MFA) management capabilities.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **pnpm** - [Install pnpm](https://pnpm.io/installation)
- **Auth0 Account** - [Sign up for Auth0](https://auth0.com/signup)

**Auth0 Configuration Requirements:**

Different Auth0 UI components may have specific configuration requirements. Please refer to the [Auth0 UI Components Documentation](https://auth0-ui-components.vercel.app/getting-started) for detailed prerequisites for each component you plan to use.

Basic Auth0 setup requirements for this sample application:

- Auth0 Application configured as Single Page Application
- Proper callback URLs, logout URLs, and web origins configured
- Required grant types enabled based on the components you're using

For component-specific Auth0 configuration (such as MFA grant types, social connections, etc.), check the individual component documentation pages.

## Getting Started

### 1. Environment Setup

Create a `.env` file in the sample app directory (react-spa-shadcn):

```env
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
```

Replace the values with your actual Auth0 domain and client ID.

**Auth0 Application Settings:**

Ensure your Auth0 application has the following settings:

- **Application Type**: Single Page Application
- **Allowed Callback URLs**: `http://localhost:5173`
- **Allowed Logout URLs**: `http://localhost:5173`
- **Allowed Web Origins**: `http://localhost:5173`

### 2. Run the Development Server

```sh
pnpm run dev
```

Run this command from the `examples/react-spa-shadcn` directory.

### 3. Access the Application

Once the development server is running, you can access the application at:

**http://localhost:5173**

The application should now be running with Auth0 authentication integrated.

## Adding an Auth0 Component

### Step 1: Setup ShadCN UI

If you haven't already set up ShadCN UI in your project, run the following command to initialize it:

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

### Step 2: Install a Component (e.g. MFA Component)

Use the ShadCN CLI to add the MFA component:

```sh
npx shadcn@latest add https://auth0-ui-components.vercel.app/r/user-mfa-management.json
```

This will install the `UserMFAMgmt` component in your `src/blocks/` directory.

**Note:** If you encounter certificate issues, use this workaround:

```sh
NODE_TLS_REJECT_UNAUTHORIZED=0 npx shadcn@latest add https://auth0-ui-components.vercel.app/r/user-mfa-management.json
```

### Step 3: Configure the Auth0 Component Provider

Update your main App component (`src/App.tsx`) to include the Auth0 Component provider:

```tsx
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route, BrowserRouter } from '@/components/RouterCompat';
import Index from './pages/Index';
import Profile from './pages/Profile';
import { Auth0Provider } from '@auth0/auth0-react';
import { useTranslation } from 'react-i18next';
import { config } from './config/env';
// ========== Importing Component Provider ==========
import { Auth0ComponentProvider } from '@/providers/component-provider';

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
            {/* Wrapping routes with Auth0ComponentProvider for MFA and localization */}
            <Auth0ComponentProvider
              authDetails={defaultAuthDetails}
              i18n={{ currentLanguage: i18n.language }}
            >
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/profile" element={<Profile />} />
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

### Step 4: Using a Component (e.g. UserMFAMgmt Component)

Here's how to integrate the MFA component in your profile page (`src/pages/Profile.tsx`):

```tsx
import Header from '@/components/Header';
import { useTranslation } from 'react-i18next';
// ========== Importing UserMFAMgmt ==========
import { UserMFAMgmt } from '@/blocks/user-mfa-management';

const Profile = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">{t('user-profile.title')}</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">{t('user-profile.mfa.title')}</h2>
          <p className="text-gray-600 mb-4">{t('user-profile.mfa.description')}</p>
          {/* Manage MFA Section */}
          {/* ==========  MFA SECTION START ========== */}
          <UserMFAMgmt
            factorConfig={{
              duo: {
                visible: false,
              },
              'webauthn-platform': {
                visible: false,
              },
              'recovery-code': {
                visible: false,
              },
              'webauthn-roaming': {
                visible: false,
              },
            }}
          />
          {/* ========== MFA SECTION END ========== */}
        </div>
      </div>
    </div>
  );
};

export default Profile;
```

## Component Documentation

For detailed configuration options, props, troubleshooting, and component-specific requirements, please refer to the official component documentation:

**[Auth0 UI Components Documentation](https://auth0-ui-components.vercel.app/getting-started)**

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

1. **Auth0 Environment Variables Missing**

   - Ensure `.env` file is created with correct Auth0 credentials
   - Verify Auth0 application settings match your local environment

2. **MFA Component Not Loading**

   - Check that the ShadCN installation completed successfully
   - Verify the `UserMFAMgmt` import path is correct
   - Ensure `Auth0ComponentProvider` wraps your component tree

3. **Translation Keys Not Working**

   - Verify translation keys exist in your locale files
   - Check that i18next is properly configured
   - Ensure the correct language is being passed to `Auth0ComponentProvider`

4. **Certificate Chain Issues**
   - Use the `NODE_TLS_REJECT_UNAUTHORIZED=0` workaround when installing components
   - This is a temporary solution for development environments

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
