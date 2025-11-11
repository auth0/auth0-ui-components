# Next.js RWA Example

A Next.js Regular Web App (RWA) example that demonstrates Auth0 authentication using proxy mode with Auth0 UI components.

## Features

- **Next.js 15** - Latest version of Next.js with App Router
- **Auth0 Authentication** - Server-side authentication using proxy mode
- **MFA Management** - Complete Multi-Factor Authentication management UI
- **TypeScript** - Full type safety
- **Tailwind CSS** - Modern styling
- **Internationalization** - Multi-language support

## Getting Started

1. Clone the repository and navigate to this example:

   ```bash
   cd examples/next-rwa
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up your Auth0 application:

   - Create a new Regular Web Application in your Auth0 dashboard
   - Configure the callback URLs, logout URLs, and web origins
   - Note your Domain and Client ID

4. Create a `.env.local` file in the project root:

   ```env
   AUTH0_SECRET='use [openssl rand -hex 32] to generate a 32 bytes value'
   APP_BASE_URL='http://localhost:5173'
   AUTH0_DOMAIN='https://your-domain.auth0.com'
   AUTH0_CLIENT_ID='your-client-id'
   AUTH0_CLIENT_SECRET='your-client-secret'
   AUTH0_SCOPE='openid profile email create:me:authentication_methods read:me:authentication_methods delete:me:authentication_methods update:me:authentication_methods read:me:factors'
   ```

5. Run the development server:
   ```bash
   pnpm run dev
   ```

Open [http://localhost:5173](http://localhost:5173) to see the result.

## Auth0 Configuration

This example uses Auth0's Regular Web Application authentication flow with proxy mode. The Auth0 UI Components automatically detect the proxy configuration and use server-side authentication.

### Component-Specific Requirements

**Important**: Each component may have specific Auth0 configuration requirements. Before using any component, please check the [Auth0 UI Components Documentation](https://auth0-ui-components.vercel.app/) for component-specific prerequisites and setup instructions.

### License

Copyright 2025 Okta, Inc.

Distributed under the MIT License found [here](https://github.com/atko-cic/auth0-ui-components/blob/main/LICENSE).

**Authors**  
Okta Inc.
