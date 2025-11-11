![Auth0 React Web UI Components SDK for JavaScript/TypeScript](https://cdn.auth0.com/website/sdks/banners/web-ui-components-react.png)

React component library for Auth0 integrations. Built with TypeScript, Radix UI, and Tailwind CSS.

[![npm version](https://img.shields.io/npm/v/@auth0/web-ui-components-react.svg?style=flat-square)](https://www.npmjs.com/package/@auth0/web-ui-components-react)
[![license](https://img.shields.io/npm/l/@auth0/web-ui-components-react.svg?style=flat-square)](https://github.com/atko-cic/auth0-ui-components/blob/main/LICENSE)
[![downloads](https://img.shields.io/npm/dm/@auth0/web-ui-components-react.svg?style=flat-square)](https://www.npmjs.com/package/@auth0/web-ui-components-react)

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

```bash
npm install @auth0/web-ui-components-react
```

### Step 1: Set up Auth0

Before using these components, you need an Auth0 account and application:

1. **Create an Auth0 Account** - [Sign up for free](https://auth0.com/signup)
2. **Create an Application** - In your Auth0 Dashboard, create a new application
3. **Configure Settings** - Set up your application's allowed callback URLs, logout URLs, and web origins

For detailed setup instructions, follow the [Auth0 React Quickstart](https://auth0.com/docs/quickstart/spa/react).

### Step 2: Install Dependencies

For **SPA (Single Page Application)**:

```bash
npm install @auth0/web-ui-components-react @auth0/auth0-react
```

For **Next.js/Server-Side**:

```bash
npm install @auth0/web-ui-components-react @auth0/nextjs-auth0
```

### Step 3: Wrap Your App with Providers

#### For SPA Applications:

```tsx
import { Auth0Provider } from '@auth0/auth0-react';
import { Auth0ComponentProvider, UserMFAMgmt } from '@auth0/web-ui-components-react';

function App() {
  return (
    <Auth0Provider
      domain="your-domain.auth0.com"
      clientId="your-client-id"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <AppWithComponents />
    </Auth0Provider>
  );
}

function AppWithComponents() {
  return (
    <Auth0ComponentProvider
      authDetails={{
        domain: 'your-domain.auth0.com',
      }}
      themeSettings={{ theme: 'default', mode: 'light' }}
    >
      <UserMFAMgmt />
    </Auth0ComponentProvider>
  );
}
```

#### For Next.js Applications:

```tsx
// app/layout.tsx or pages/_app.tsx
import { Auth0Provider } from '@auth0/nextjs-auth0';
import { Auth0ComponentProvider } from '@auth0/web-ui-components-react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Auth0Provider>
          <Auth0ComponentProvider
            authDetails={{
              authProxyUrl: '/', // Next.js API route
            }}
            themeSettings={{ theme: 'default', mode: 'light' }}
          >
            {children}
          </Auth0ComponentProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
```

### Step 4: Use Components

```tsx
import { UserMFAMgmt, OrgManagement } from '@auth0/web-ui-components-react';

function MyPage() {
  return (
    <div>
      <h1>Security Settings</h1>
      <UserMFAMgmt />
    </div>
  );
}
```

## Usage

### Using Blocks

```tsx
import { UserMFAMgmt } from '@auth0/web-ui-components-react';

function MyPage() {
  return <UserMFAMgmt />;
}
```

### Using Providers

#### Direct Mode (Client-Side - SPA)

For Single Page Applications using Auth0 React SDK:

```tsx
import { Auth0ComponentProvider } from '@auth0/web-ui-components-react';

function App() {
  return (
    <Auth0ComponentProvider
      authDetails={{
        domain: 'your-domain.auth0.com',
      }}
      i18n={{ currentLanguage: 'en' }}
      themeSettings={{
        theme: 'default',
        mode: 'light',
      }}
    >
      {/* Your app */}
    </Auth0ComponentProvider>
  );
}
```

#### Proxy Mode (Server-Side - Next.js/RWA)

For React Web Applications (RWA) like Next.js with server-side authentication:

```tsx
import { Auth0ComponentProvider } from '@auth0/web-ui-components-react';

function App() {
  return (
    <Auth0ComponentProvider
      authDetails={{
        authProxyUrl: '/', // Your API proxy endpoint (e.g., /api/auth/mfa, /api/auth/my-org)
      }}
      i18n={{ currentLanguage: 'en' }}
      themeSettings={{
        theme: 'default',
        mode: 'light',
      }}
    >
      {/* Your app */}
    </Auth0ComponentProvider>
  );
}
```

## Requirements

### Peer Dependencies

- **React** >= 16.11.0 (supports React 16, 17, 18, and 19)
- **React DOM** >= 16.11.0 (supports React 16, 17, 18, and 19)
- **@auth0/auth0-react** >= 2.0.0 (optional - only required for SPA/Direct Mode)

### Styling

- **Tailwind CSS** >= 4.0 (recommended for full styling support)

## Related Packages

- [@auth0/web-ui-components-core](https://www.npmjs.com/package/@auth0/web-ui-components-core) - Core utilities (auto-installed)

## Support

For issues and questions, visit our [GitHub repository](https://github.com/atko-cic/auth0-ui-components).

---

## License

Copyright 2025 Okta, Inc.

Distributed under the MIT License found [here](https://github.com/atko-cic/auth0-ui-components/blob/main/LICENSE).

**Authors**  
Okta Inc.
