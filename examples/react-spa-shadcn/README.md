# React SPA with ShadCN UI

A modern React single-page application built with Vite, TypeScript, and ShadCN UI components, featuring integrated Auth0 authentication and multi-factor authentication (MFA) management capabilities.

## What technologies are used for this project?

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

## Prerequisites

- **Node.js** (v18 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **pnpm** - [Install pnpm](https://pnpm.io/installation)

- **Auth0 Account** - [Sign up for Auth0](https://auth0.com/signup)

1. **Enable MFA Grant Types**

   - Navigate to your Auth0 Dashboard > Applications > [Your Application] > Advanced Settings > Grant Types
   - Ensure **MFA** grant type is enabled for the MFA component to work properly
   - Save the changes and redeploy if necessary

2. **Enable Google OAuth2 Connection**

   - Go to Auth0 Dashboard > Authentication > Social > Google
   - Make sure the Google OAuth2 connection is enabled and properly configured
   - Verify the connection is associated with your application under Applications tab

## Getting Started

### 1. Environment Setup

Create a `.env` file in the sample app directory (react-spa-shadcn):

```env
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
```

Replace the values with your actual Auth0 domain and client ID.

### 2. Auth0 Configuration

Ensure your Auth0 application has the following settings:

- **Application Type**: Single Page Application
- **Allowed Callback URLs**: `http://localhost:8080` (for development)
- **Allowed Logout URLs**: `http://localhost:8080`
- **Allowed Web Origins**: `http://localhost:8080`

### 3. Adding Auth0 MFA Component

#### Step 1: Setup ShadCN UI

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

#### Step 2: Install the MFA Component

Use the ShadCN CLI to add the MFA component:

```sh
npx shadcn@latest add https://auth0-ui-components.vercel.app/r/user-mfa-management.json
```

This will install the `UserMFAMgmt` component in your `src/blocks/` directory.

#### Step 3: Configure the Auth0 Component Provider

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

#### Step 4: Using the UserMFAMgmt Component

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

### 5. **Start the development server:**

```sh
pnpm run dev
```

Run this command from the `examples/react-spa-shadcn` directory.

### 6. Access the Application

Once the development server is running, you can access the application at:

**http://localhost:8080**

The application should now be running with Auth0 authentication integrated.

## MFA Component Configuration

### Props

The `UserMFAMgmt` component accepts the following props:

#### `localization` (optional)

Customize text labels for internationalization:

```tsx
<UserMFAMgmt
  localization={{
    title: 'Multi-Factor Authentication',
    subtitle: 'Secure your account with additional verification methods',
    // ... other localization options
  }}
/>
```

#### `factorConfig` (optional)

Configure which MFA factors are available and their visibility:

```tsx
<UserMFAMgmt
  factorConfig={{
    // Disable Duo integration
    duo: {
      enabled: false,
    },
    // Hide WebAuthn platform authenticators
    'webauthn-platform': {
      visible: false,
    },
    // Enable SMS with custom settings
    sms: {
      enabled: true,
      visible: true,
    },
    // Enable TOTP (Time-based One-Time Password)
    otp: {
      enabled: true,
      visible: true,
    },
    // Enable Email OTP
    email: {
      enabled: true,
      visible: true,
    },
    // Enable WebAuthn roaming authenticators (security keys)
    'webauthn-roaming': {
      enabled: true,
      visible: true,
    },
  }}
/>
```

### Available MFA Factors

- **`otp`** - Time-based One-Time Password (TOTP) using authenticator apps
- **`sms`** - SMS-based verification
- **`email`** - Email-based verification
- **`pushnotification`** - Push Notification Verification

## Internationalization Setup

### Adding Translation Keys

Add MFA-related translation keys to your locale files:

```json
// src/locales/en.json
{
  "user-profile": {
    "mfa": {
      "title": "Multi-Factor Authentication",
      "subtitle": "Add an extra layer of security to your account",
      "add-factor": "Add Authentication Method",
      "remove-factor": "Remove",
      "factors": {
        "sms": "SMS Verification",
        "email": "Email Verification",
        "otp": "Authenticator App",
        "webauthn-roaming": "Security Key",
        "webauthn-platform": "Biometric Authentication"
      }
    }
  }
}
```

```json
// src/locales/ja.json
{
  "user-profile": {
    "mfa": {
      "title": "多要素認証",
      "subtitle": "アカウントにセキュリティレイヤーを追加します",
      "add-factor": "認証方法を追加",
      "remove-factor": "削除",
      "factors": {
        "sms": "SMS認証",
        "email": "メール認証",
        "otp": "認証アプリ",
        "webauthn-roaming": "セキュリティキー",
        "webauthn-platform": "生体認証"
      }
    }
  }
}
```

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

4. **Self-signed certificate in certificate chain**

Something went wrong. Please check the error below for more details.
If the problem persists, please open an issue on GitHub.
request to https://auth0-ui-components.vercel.app/r/user-mfa-management.json failed, reason: self-signed certificate in certificate chain
**Work Around - Run the below command**

`NODE_TLS_REJECT_UNAUTHORIZED=0 npx shadcn@latest add https://auth0-ui-components.vercel.app/r/user-mfa-management.json`

### Getting Help

- Check the [Auth0 Documentation](https://auth0.com/docs)
- Review [ShadCN UI Documentation](https://ui.shadcn.com)
- Open an issue in the project repository
