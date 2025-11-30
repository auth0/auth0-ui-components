# React SPA with Auth0 Universal Components (npm) - Setup Guide

This guide will walk you through setting up and running the React SPA with Auth0 Universal Components (npm).

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

Run this command from the `examples/react-spa-npm` directory.

### 4. Access the Application

Once the development server is running, you can access the application at:

**http://localhost:5173**

The application should now be running with Auth0 authentication integrated.

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
