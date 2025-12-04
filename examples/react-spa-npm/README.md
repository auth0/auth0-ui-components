# **Universal Components** demo for React (npm)

A React (npm) example that demonstrates Auth0 authentication using a SPA along with Auth0 Universal Components demonstrating delegated administration.

## Jump to a section

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Universal Component Docs (Component-Specific Requirements)](#universal-component-docs-component-specific-requirements)
- [Troubleshooting](#troubleshooting)

## Prerequisites

1. **Node.js v20 or later** is required to run the bootstrapping process.

We recommend using [`nvm`](https://github.com/nvm-sh/nvm) to manage node versions in your development environment. Click these links to [learn how to install nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script) or [how to use nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#usage) to make sure you're using Node 20+.

2. **[`pnpm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) or a comparable package manager** installed in your development environment.

These instructions assume that you're using `pnpm`, which is automatically included as part of the Node.js installation from prerequisite 1.

3. **A new Auth0 tenant**.

**This is important!** Using a new Auth0 tenant for this sample application ensures you don't encounter any conflicts due to existing configuration in an existing tenant. You can sign up for a free Auth0 account at [https://auth0.com/signup](https://auth0.com/signup?utm_source=github&utm_medium=thirdpartyutm_campaign=saastart). See [Create Tenants](https://auth0.com/docs/get-started/auth0-overview/create-tenants) in the Auth0 docs if you need help.

4. **Configure your Auth0 tenant** based on the components you will use.

Different Auth0 Universal components may have specific configuration requirements.
**Please refer to the [Auth0 Universal Components Documentation](https://auth0-ui-components.vercel.app/getting-started) for detailed prerequisites for each component or group of components you plan to use.**

## Getting Started

### 1. Environment Setup

Before running the application, you need to configure your Auth0 credentials:

1. **Clone the repository and navigate to its folder:**

   ```bash
   git clone https://github.com/auth0/auth0-ui-components
   cd auth0-ui-components
   ```

2. **Create environment file:**

   In the root directory of your project (or in the example directory if working with monorepo), copy the `.env.example` to an `.env` file:

   ```env
   VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your-auth0-client-id
   ```

3. **Configure Auth0 values:**

   Replace the placeholder values with your actual Auth0 credentials:
   - `VITE_AUTH0_DOMAIN`: Your Auth0 domain (found in your Auth0 Dashboard > Applications > Settings)
   - `VITE_AUTH0_CLIENT_ID`: Your Auth0 application client ID (found in the same location)

### 2. Build the components package and install dependencies

Make sure you run install and build scripts **at the root of the project** before starting the dev server.

1. Build the components package and install dependencies:

   ```bash
   pnpm install
   pnpm run build
   ```

1. Navigate to the examples folder and install dependencies:

   ```bash
   cd examples/react-spa-npm
   pnpm install
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

## Universal Component Docs (Component-Specific Requirements)

For detailed configuration options, props, troubleshooting, and component-specific requirements, please refer to the official component documentation:

**[Auth0 Universal Components Documentation](https://auth0-ui-components.vercel.app/getting-started)**

**Important**: Each component may have specific Auth0 configuration requirements. Before using any component, please check the [Auth0 UI Components Documentation](https://auth0-ui-components.vercel.app/) for component-specific prerequisites and setup instructions.

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
- Open an issue in the project repository

---

**Note**: This setup guide assumes you're working with the latest version of the codebase. If you encounter version-specific issues, please refer to the project's main documentation or create an issue in the repository.

## License

Copyright 2025 Okta, Inc.

Distributed under the MIT License found [here](https://github.com/atko-cic/auth0-ui-components/blob/main/LICENSE).

**Authors**  
Okta Inc.
