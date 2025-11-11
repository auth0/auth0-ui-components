# React SPA with Auth0 UI Components (npm) - Setup Guide

This guide will walk you through setting up and running the React SPA with Auth0 UI Components (npm).

## Prerequisites

Before you begin, make sure you have the following installed on your system:

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

### 2. Run the Development Server

```sh
pnpm run dev
```

Run this command from the `examples/react-spa-npm` directory.

### 3. Access the Application

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

1. Check the terminal output for error messages
2. Verify all prerequisites are installed
3. Ensure Auth0 configuration is correct
4. Check that all environment variables are properly set

---

**Note**: This setup guide assumes you're working with the latest version of the codebase. If you encounter version-specific issues, please refer to the project's main documentation or create an issue in the repository.

### License

Copyright 2025 Okta, Inc.

Distributed under the MIT License found [here](https://github.com/atko-cic/auth0-ui-components/blob/main/LICENSE).

**Authors**  
Okta Inc.
