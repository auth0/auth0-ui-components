![Auth0 React Web Universal Components SDK for JavaScript/TypeScript](https://cdn.auth0.com/website/universalcomponentsreact/universal-components-react.png)

Auth0 Universal Components for React - pre-built UI components for organization management, SSO configuration, and MFA enrollment.

[![npm version](https://img.shields.io/npm/v/@auth0/universal-components-react.svg?style=flat-square)](https://www.npmjs.com/package/@auth0/universal-components-react)
[![license](https://img.shields.io/npm/l/@auth0/universal-components-react.svg?style=flat-square)](https://github.com/auth0/auth0-ui-components/blob/main/LICENSE)
[![downloads](https://img.shields.io/npm/dm/@auth0/universal-components-react.svg?style=flat-square)](https://www.npmjs.com/package/@auth0/universal-components-react)

📚 [Documentation](#documentation) - 🚀 [Getting Started](#getting-started) - 💬 [Feedback](#feedback)

## Documentation

- [Auth0 Universal Components](https://auth0.com/docs/get-started/universal-components/universal-components-overview) - installation, configuration, and component reference
- [Examples](https://github.com/auth0/auth0-ui-components/tree/main/examples) - sample applications for React SPA, React shadcn, and Next.js
- [Auth0 Docs](https://auth0.com/docs) - explore our docs site and learn more about Auth0

## Getting Started

### Installation

**For SPA (Single Page Application):**

```bash
npm install @auth0/universal-components-react @auth0/auth0-react react-hook-form
```

**For Next.js/Server-Side (RWA):**

```bash
npm install @auth0/universal-components-react react-hook-form
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
import { Auth0ComponentProvider } from '@auth0/universal-components-react/spa';
import { OrganizationDetailsEdit } from '@auth0/universal-components-react';
import '@auth0/universal-components-react/styles';

function App() {
  return (
    <Auth0Provider
      domain="your-domain.auth0.com"
      clientId="your-client-id"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
      interactiveErrorHandler="popup" // Required to handle step-up auth challenges via Universal Login popup
    >
      <Auth0ComponentProvider themeSettings={{ theme: 'default', mode: 'light' }}>
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
          domain="your-domain.auth0.com"
          mode="proxy"
          proxyConfig={{ baseUrl: '/api/auth' }}
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
import { OrganizationDetailsEdit } from '@auth0/universal-components-react';

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

## Feedback

### Contributing

We appreciate feedback and contribution to this repo! Before you get started, please read the following:

- [Contributing Guide](https://github.com/auth0/auth0-ui-components/blob/main/CONTRIBUTING.md)

### Raise an issue

To provide feedback or report a bug, please [raise an issue on our issue tracker](https://github.com/auth0/auth0-ui-components/issues).

### Vulnerability Reporting

Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/responsible-disclosure-policy) details the procedure for disclosing security issues.

---

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.auth0.com/website/sdks/logos/auth0_light_mode.png" width="150">
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.auth0.com/website/sdks/logos/auth0_dark_mode.png" width="150">
    <img alt="Auth0 Logo" src="https://cdn.auth0.com/website/sdks/logos/auth0_light_mode.png" width="150">
  </picture>
</p>
<p align="center">Auth0 is an easy to implement, adaptable authentication and authorization platform. To learn more checkout <a href="https://auth0.com/why-auth0">Why Auth0?</a></p>
<p align="center">
This project is licensed under the Apache 2.0 license. See the <a href="https://github.com/auth0/auth0-ui-components/blob/main/LICENSE">LICENSE</a> file for more info.</p>
