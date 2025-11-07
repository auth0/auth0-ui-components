# @auth0/web-ui-components-react

React component library for Auth0 integrations. Built with TypeScript, Radix UI, and Tailwind CSS.

## Installation

```bash
npm install @auth0/web-ui-components-react
```

## Usage

### Import Styles

```typescript
import '@auth0/web-ui-components-react/dist/index.css';
```

### Using Blocks

```tsx
import { UserMFAMgmt } from '@auth0/web-ui-components-react';

function MyPage() {
  return <UserMFAMgmt />;
}
```

### Using Providers

```tsx
import { Auth0Provider } from '@auth0/web-ui-components-react';

function App() {
  return (
    <Auth0Provider domain="your-domain.auth0.com" clientId="your-client-id">
      {/* Your app */}
    </Auth0Provider>
  );
}
```

### Using Hooks

```tsx
import { useAuth0 } from '@auth0/web-ui-components-react';

function MyComponent() {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  // Your logic
}
```

## Requirements

- React >= 19.1.0
- Node.js >= 18
- Tailwind CSS >= 4.0 (for styling)

## Related Packages

- [@auth0/web-ui-components-core](https://www.npmjs.com/package/@auth0/web-ui-components-core) - Core utilities (auto-installed)

## Support

For issues and questions, visit our [GitHub repository](https://github.com/atko-cic/auth0-ui-components).

Copyright 2025 Okta, Inc.

Distributed under the MIT License found [here](https://github.com/atko-cic/auth0-ui-components/blob/main/LICENSE).

Authors
Okta Inc.
