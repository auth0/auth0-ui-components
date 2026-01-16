# Auth0 Web Universal Components

A comprehensive library of reusable UI components and utilities for Auth0 integrations, built with modern web technologies and designed for scalability.

## 📖 Documentation

For detailed information on how to use these components and get started with Auth0, please refer to the following resources:

- **[Auth0 Quickstarts](https://auth0.com/docs/quickstarts)**: Official guides for creating and configuring your application on the Auth0 platform.
- **[Auth0 APIs](https://auth0.com/docs/api)**: Comprehensive documentation for Auth0's APIs.
- **[Component Documentation](https://auth0-ui-components.vercel.app/)**: Live Storybook showcasing all available components, their props, and usage examples.
- **[Examples Folder](https://github.com/auth0/auth0-ui-components/tree/main/examples)**: Practical, hands-on sample applications demonstrating how to integrate and use these components in a real project.
- **[Component Reference](#-component-reference)**: Explore public components available in @auth0/universal-components-react.

## Packages Overview

This project uses a **monorepo architecture** designed for multi-framework support. It is organized into two main types of packages:

- A framework-agnostic `@auth0/universal-components-core` package that contains all the core logic, services, and utilities.
- Framework-specific packages (like `@auth0/universal-components-react`) that provide UI components and hooks for a particular technology. This structure allows for the future addition of packages for other frameworks like Vue or Angular.

### `packages/core/`

**@auth0/universal-components-core** - The foundational package containing core utilities and services.

**What it provides:**

- 📦 **Internal Services**: Handles all API logic for "My Account" and "My Organization" components, using the "My Account" and "My Organization" SDKs.
- 🌐 **Internationalization (i18n)**: Contains all translation files for multi-language support and utils.
- 🛡️ **Schema Validation**: Defines and maintains types for schema validation.
- 🛠️ **Shared Utilities**: Provides shared functions, TypeScript types, and theme management utilities.

### `packages/react/`

**@auth0/universal-components-react** - React-specific UI components and hooks for Auth0 integrations.

**What it provides:**

- ⚛️ **React Components**: Pre-built UI components for Auth0 features (MFA management, user profiles, ,organization management etc.)
- 🎣 **Custom Hooks**: React hooks for component state management and API interactions
- 🎨 **UI Elements**: Beautiful, accessible components built with Radix UI and Tailwind CSS, following shadcn design patterns.
- 🔄 **Providers**: React context providers for managing authentication, theme, and internationalization.

## 🚀 Using the Library

For detailed instructions on how to install and use the components in your project, please refer to the `README.md` file within the specific framework package you are using.

- **[React Usage Guide](./packages/react/README.md)**

## 🛠️ Getting Started (for Contributors)

### Prerequisites

- Node.js >= 18
- PNPM (recommended package manager)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/auth0/auth0-ui-components
    cd auth0-ui-components
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Build all packages:**
    ```bash
    pnpm run build
    ```

### Development

#### Local Development Workflow

To make and test changes locally:

1.  Make your desired changes in any of the packages (e.g., `packages/core` or `packages/react`).
2.  Re-build all packages to apply your changes:
    ```bash
    pnpm run build
    ```
3.  Navigate to a technology-specific example application in the `examples/` directory (e.g., `examples/react-spa-npm`).
4.  Configure the required environment variables in a `.env` file as per the example's `README`.
5.  Start the development server to see your changes in action:
    ```bash
    pnpm run dev
    ```

#### Testing

Running tests:

```bash
pnpm run test
pnpm run test:react
pnpm run test:core
```

To run a specific test, go to the relevant package folder and run:

```bash
pnpm run test organization-details-edit
```

#### Shadcn Local Development

1.  Update `registry.json` with your changes.

2.  Create a new build based on `registry.json`:

    ```bash
    pnpm build:shadcn
    ```

3.  Open `docs-site` and serve the registry:

```bash
cd docs-site
pnpm install
pnpm run dev
```

4.  Go to your app (e.g., `react-spa-shadcn`) and update the components:

    ```bash
    npx shadcn@latest add http://localhost:5173/r/my-account/user-mfa-management.json --overwrite
    npx shadcn@latest add http://localhost:5173/r/my-organization/organization-details-edit.json --overwrite
    # ... other components
    ```

    _Note: The port may differ if other applications are running._

## 📚 Component Reference

Explore public components available in @auth0/universal-components-react.

- [UserMfaManagement](https://auth0.github.io/auth0-ui-components/variables/_auth0_universal-components-react.UserMFAMgmt.html)
- [DomainTable](https://auth0.github.io/auth0-ui-components/variables/_auth0_universal-components-react.DomainTable.html)
- [SsoProviderCreate](https://auth0.github.io/auth0-ui-components/variables/_auth0_universal-components-react.SsoProviderCreate.html)
- [SsoProviderEdit](https://auth0.github.io/auth0-ui-components/variables/_auth0_universal-components-react.SsoProviderEdit.html)
- [SsoProviderTable](https://auth0.github.io/auth0-ui-components/variables/_auth0_universal-components-react.SsoProviderTable.html)
- [OrganizationDetailsEdit](https://auth0.github.io/auth0-ui-components/variables/_auth0_universal-components-react.OrganizationDetailsEdit.html)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any bugs, feature requests, or improvements.

## 📜 License

Copyright 2025 Okta, Inc

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

**Authors**  
Okta Inc.
