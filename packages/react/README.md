![Auth0 React Web Universal Components SDK for JavaScript/TypeScript](https://cdn.auth0.com/website/sdks/banners/web-ui-components-react.png)

React component library for Auth0 integrations. Built with TypeScript, Radix UI, and Tailwind CSS.

[![npm version](https://img.shields.io/npm/v/@auth0/universal-components-react.svg?style=flat-square)](https://www.npmjs.com/package/@auth0/universal-components-react)
[![license](https://img.shields.io/npm/l/@auth0/universal-components-react.svg?style=flat-square)](https://github.com/auth0/auth0-ui-components/blob/main/LICENSE)
[![downloads](https://img.shields.io/npm/dm/@auth0/universal-components-react.svg?style=flat-square)](https://www.npmjs.com/package/@auth0/universal-components-react)

**What it provides:**

- ⚛️ **React Components**: Pre-built UI components for Auth0 features (MFA management, org management etc.)
- 🎣 **Custom Hooks**: React hooks for component state management and API interactions
- 🎨 **UI Elements**: Beautiful, accessible components built with Radix UI and Tailwind CSS, following shadcn design patterns
- 🔄 **Providers**: React context providers for managing authentication, theme, and internationalization

## 📖 Documentation

For detailed information on how to use these components and get started with Auth0, please refer to the following resources:

- **[Component Documentation](https://auth0-ui-components.vercel.app/)**: Live Storybook showcasing all available components, their props, and usage examples
- **[Examples Folder](./examples/)**: Practical, hands-on sample applications demonstrating how to integrate and use these components in a real project
- **[Auth0 Quickstarts](https://auth0.com/docs/quickstarts)**: Official guides for creating and configuring your application on the Auth0 platform
- **[Auth0 APIs](https://auth0.com/docs/api)**: Comprehensive documentation for Auth0's APIs

## 🚀 Getting Started

### Installation

**For SPA (Single Page Application):**

```bash
npm install @auth0/universal-components-react @auth0/auth0-react
```

**For Next.js/Server-Side (RWA):**

```bash
npm install @auth0/universal-components-react @auth0/nextjs-auth0
```

### Step 1: Set up Auth0

Before using these components, you need an Auth0 account and application:

1. **Create an Auth0 Account** - [Sign up for free](https://auth0.com/signup)
2. **Create an Application** - In your Auth0 Dashboard, create a new application
3. **Configure Settings** - Set up your application's allowed callback URLs, logout URLs, and web origins

For detailed setup instructions, follow the [Auth0 React Quickstart](https://auth0.com/docs/quickstart/spa/react).

### Step 2: Wrap Your App with Providers

#### For SPA Applications:

```tsx
import { Auth0Provider } from '@auth0/auth0-react';
import {
  Auth0ComponentProvider,
  OrganizationDetailsEdit,
} from '@auth0/universal-components-react/spa';
import '@auth0/universal-components-react/styles';

function App() {
  return (
    <Auth0Provider
      domain="your-domain.auth0.com"
      clientId="your-client-id"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <Auth0ComponentProvider
        authDetails={{
          domain: 'your-domain.auth0.com',
        }}
        themeSettings={{ theme: 'default', mode: 'light' }}
      >
        <OrganizationDetailsEdit />
      </Auth0ComponentProvider>
    </Auth0Provider>
  );
}
```

#### For Next.js Applications:

```tsx
// app/layout.tsx or pages/_app.tsx
import { Auth0ComponentProvider } from '@auth0/universal-components-react/rwa';
import '@auth0/universal-components-react/styles';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Auth0ComponentProvider
          authDetails={{
            authProxyUrl: '/api/auth',
          }}
          themeSettings={{ theme: 'default', mode: 'light' }}
        >
          {children}
        </Auth0ComponentProvider>
      </body>
    </html>
  );
}
```

### Step 3: Use Components

```tsx
import { OrganizationDetailsEdit } from '@auth0/universal-components-react/spa';
// or
import { OrganizationDetailsEdit } from '@auth0/universal-components-react/rwa';

function MyPage() {
  return (
    <div>
      <h1>Organization Settings</h1>
      <OrganizationDetailsEdit />
    </div>
  );
}
```

## Requirements

- **React** >= 16.11.0
- **React DOM** >= 16.11.0
- **react-hook-form** >= 7.0.0
- **Tailwind CSS** >= 3.0.0 || >= 4.0.0 (recommended)
- **@auth0/auth0-react** >= 2.0.0 (required for `/spa` entry point only)

## Related Packages

- [@auth0/universal-components-core](https://www.npmjs.com/package/@auth0/universal-components-core) - Core utilities (auto-installed)
- [@auth0/auth0-react](https://www.npmjs.com/package/@auth0/auth0-react) - Auth0 SDK for React (SPA mode)
- [@auth0/nextjs-auth0](https://www.npmjs.com/package/@auth0/nextjs-auth0) - Auth0 SDK for Next.js (RWA mode)

## License

Copyright 2025 Okta, Inc.

Distributed under the MIT License.

**Authors**  
Okta Inc.
