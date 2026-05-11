# Contributing to Auth0 Universal Components

We appreciate feedback and contribution to this repo! Before you get started, please see the following:

- [Auth0's general contribution guidelines](https://github.com/auth0/open-source-template/blob/master/GENERAL-CONTRIBUTING.md)
- [Auth0's code of conduct guidelines](https://github.com/auth0/open-source-template/blob/master/CODE-OF-CONDUCT.md)

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm (recommended package manager) - Install with `npm install -g pnpm` or see [pnpm.io/installation](https://pnpm.io/installation)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/auth0/auth0-ui-components
   cd auth0-ui-components
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Build all packages:**

   ```bash
   pnpm build
   ```

## Development

### Local Development Workflow

To make and test changes locally:

1. Make your desired changes in any of the packages (e.g., `packages/core` or `packages/react`).

2. Re-build all packages to apply your changes:

   ```bash
   pnpm build
   ```

3. Navigate to a technology-specific example application in the `examples/` directory (e.g., `examples/react-spa-npm`).

4. Configure the required environment variables in a `.env` file as per the example's README.

5. Start the development server to see your changes in action:

   ```bash
   pnpm dev
   ```

### Testing

Running tests:

```bash
pnpm test          # Run all tests
pnpm test:react    # Run React package tests only
pnpm test:core     # Run Core package tests only
```

To run a specific test, go to the relevant package folder and run:

```bash
cd packages/react
pnpm test organization-details-edit
```

### Shadcn Local Development

1. Update `registry.json` with your changes.

2. Create a new build based on `registry.json`:

   ```bash
   pnpm build:shadcn
   ```

3. Open `docs-site` and serve the registry:

   ```bash
   cd docs-site
   pnpm install
   pnpm dev
   ```

4. Go to your app (e.g., `react-spa-shadcn`) and update the components:

   ```bash
   npx shadcn@latest add http://localhost:5173/r/my-account/user-mfa-management.json --overwrite
   npx shadcn@latest add http://localhost:5173/r/my-organization/organization-details-edit.json --overwrite
   # ... other components
   ```

   > [!NOTE]
   > The port may differ if other applications are running.

## Monorepo Architecture

This project uses a **monorepo architecture** designed for multi-framework support:

- **`@auth0/universal-components-core`** (`packages/core/`) - Framework-agnostic core with API services, i18n, schemas, and theme utilities
- **`@auth0/universal-components-react`** (`packages/react/`) - React components and hooks with `/spa` and `/rwa` entry points

## Raise an Issue

To provide feedback or report a bug, please [raise an issue on our issue tracker](https://github.com/auth0/auth0-ui-components/issues).

## Vulnerability Reporting

Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/responsible-disclosure-policy) details the procedure for disclosing security issues.
