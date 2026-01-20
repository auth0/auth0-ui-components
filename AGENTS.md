# AGENTS.md

**Library:** `@auth0/universal-components-core` + `@auth0/universal-components-react`  
**Purpose:** Reusable UI components for Auth0 integrations (MFA, Organization Management, SSO, Domain Management)  
**Runtime:** Node 18+, ESM, TypeScript, React 16.11+/17/18/19

---

## Quick Commands

| Task                  | Command             |
| --------------------- | ------------------- |
| Install               | `pnpm install`      |
| Build all             | `pnpm build`        |
| Build docs            | `pnpm build:docs`   |
| Build shadcn registry | `pnpm build:shadcn` |
| Test all              | `pnpm test`         |
| Test core only        | `pnpm test:core`    |
| Test react only       | `pnpm test:react`   |
| Test watch mode       | `pnpm test:watch`   |
| Lint                  | `pnpm lint`         |
| Lint + fix            | `pnpm lint:fix`     |
| Format                | `pnpm format`       |
| Format check          | `pnpm format:check` |
| Dev docs site         | `pnpm dev:docs`     |
| Conventional commit   | `pnpm commit`       |

---

## Package Exports

### `@auth0/universal-components-core`

| Export    | Contents                                                                        |
| --------- | ------------------------------------------------------------------------------- |
| Default   | `createCoreClient`, i18n services, API services, schemas, theme utilities       |
| Types     | `CoreClientInterface`, `AuthDetails`, `SessionData`, `Authenticator`, `MFAType` |
| Services  | `myAccountApiClient`, `myOrganizationApiClient`                                 |
| Constants | `FACTOR_TYPE_*` (MFA factor constants)                                          |

### `@auth0/universal-components-react`

| Import Path                                | Contents                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| `@auth0/universal-components-react/spa`    | SPA mode: `Auth0ComponentProvider`, blocks, hooks (uses `@auth0/auth0-react`) |
| `@auth0/universal-components-react/rwa`    | RWA/Proxy mode: `Auth0ComponentProvider`, blocks, hooks (uses auth proxy URL) |
| `@auth0/universal-components-react/styles` | CSS stylesheet (`dist/styles.css`)                                            |

### Available Blocks and Hooks

For the full list of available blocks and hooks, see:

- **Blocks:** [`packages/react/src/blocks/index.ts`](packages/react/src/blocks/index.ts)
- **Hooks:** [`packages/react/src/hooks/`](packages/react/src/hooks/)

---

## Architecture

```
auth0-ui-components/
├── packages/
│   ├── core/                 # @auth0/universal-components-core
│   │   └── src/
│   │       ├── api/          # API utilities
│   │       ├── auth/         # CoreClient, TokenManager, auth types
│   │       ├── i18n/         # Internationalization service + translations
│   │       ├── schemas/      # Zod validation schemas
│   │       ├── services/     # API service layer
│   │       │   ├── my-account/    # MFA management APIs
│   │       │   └── my-organization/ # Org, SSO, Domain APIs
│   │       ├── theme/        # Theme utilities
│   │       └── assets/       # Icons, images
│   │
│   └── react/                # @auth0/universal-components-react
│       └── src/
│           ├── spa.ts        # SPA entry point
│           ├── rwa.ts        # RWA/Proxy entry point
│           ├── providers/    # Auth0ComponentProvider (SPA + Proxy)
│           ├── blocks/       # High-level feature components
│           │   ├── my-account/mfa/
│           │   └── my-organization/
│           ├── components/   # UI components
│           │   ├── ui/       # Base components (button, dialog, etc.)
│           │   ├── my-account/
│           │   └── my-organization/
│           ├── hooks/        # React hooks
│           ├── hoc/          # Higher-order components (withServices)
│           ├── types/        # TypeScript types
│           └── styles/       # Tailwind CSS
│
├── examples/
│   ├── react-spa-npm/        # React SPA using npm package
│   ├── react-spa-shadcn/     # React SPA using shadcn registry
│   └── next-rwa/             # Next.js with proxy auth
│
└── docs-site/                # Documentation site (Vite + React)
```

---

## Data Flows

Legend: `→` flow, `↔` bidirectional, `[]` storage, `{}` transform

| Flow        | Path                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| SPA Init    | `Auth0Provider`→`Auth0ComponentProvider`→`useCoreClientInitialization`→{createCoreClient}→[CoreClientContext] |
| RWA Init    | `Auth0ComponentProvider`→{authProxyUrl}→`useCoreClientInitialization`→{createCoreClient}→[CoreClientContext]  |
| API Call    | Block→Hook→`useCoreClient`→`myAccountApiClient`/`myOrganizationApiClient`→Auth0 SDK→Auth0 API                 |
| Token (SPA) | `getAccessTokenSilently`→{cache/refresh}→token→API header                                                     |
| Token (RWA) | Request→`authProxyUrl`→{scope header}→proxy→Auth0→response                                                    |
| Translation | `useTranslator(namespace, customMessages)`→{merge}→`t(key, params)`                                           |
| Scopes      | Block→`withServices` HOC→`useScopeManager`→`registerScopes`→`ensureScopes`→Component render                   |

---

## Key Patterns

### Provider Pattern

```tsx
// SPA Mode (uses @auth0/auth0-react)
import { Auth0ComponentProvider } from '@auth0/universal-components-react/spa';

<Auth0Provider domain={domain} clientId={clientId}>
  <Auth0ComponentProvider
    authDetails={{ domain }}
    i18n={{ currentLanguage: 'en-US' }}
    themeSettings={{ mode: 'dark', theme: 'rounded' }}
    toastSettings={{ provider: 'sonner' }}
  >
    <App />
  </Auth0ComponentProvider>
</Auth0Provider>;

// RWA/Proxy Mode (Next.js, server-side auth)
import { Auth0ComponentProvider } from '@auth0/universal-components-react/rwa';

<Auth0ComponentProvider
  authDetails={{ authProxyUrl: '/api/auth', domain: 'your-tenant.auth0.com' }}
  i18n={{ currentLanguage: 'en-US' }}
>
  <App />
</Auth0ComponentProvider>;
```

### CoreClient

Central service interface created via `createCoreClient()`:

| Property/Method                  | Purpose                      |
| -------------------------------- | ---------------------------- |
| `i18nService`                    | Translation management       |
| `myAccountApiClient`             | MFA, user profile operations |
| `myOrganizationApiClient`        | Org, SSO, domain operations  |
| `getToken(scope, audience)`      | Token retrieval              |
| `ensureScopes(scopes, audience)` | Scope authorization          |
| `isProxyMode()`                  | Check if using auth proxy    |

### HOC Pattern (withServices)

Blocks use `withMyOrganizationService()` or `withMyAccountService()` to:

1. Register required OAuth scopes via `useScopeManager`
2. Wait for scope authorization before rendering
3. Show loading state during scope acquisition

```tsx
// Internal usage
export const OrganizationDetailsEdit = withMyOrganizationService(
  OrganizationDetailsEditComponent,
  MY_ORGANIZATION_DETAILS_EDIT_SCOPES,
);
```

### Translation System

```tsx
const { t } = useTranslator('organization_management.organization_details_edit', customMessages);

// Usage
t('header.title', { organizationName: org.name });
```

- Base translations: `packages/core/src/i18n/translations/`
- Custom messages override via `customMessages` prop
- Custom message types: `packages/core/src/i18n/custom-messages/`
- Supports: `en-US`, `ja`

### Schema Validation

All API inputs/outputs validated with Zod schemas:

```
packages/core/src/schemas/
├── common/           # Shared schemas
├── my-account/       # MFA schemas
└── my-organization/  # Org, SSO, Domain schemas
```

---

## Component Structure

### Block Component Location

| Type                   | Location                                     |
| ---------------------- | -------------------------------------------- |
| My Account blocks      | `packages/react/src/blocks/my-account/`      |
| My Organization blocks | `packages/react/src/blocks/my-organization/` |

### Block Component Template

```tsx
// packages/react/src/blocks/my-organization/{feature}/{component}.tsx

import { getComponentStyles, REQUIRED_SCOPES } from '@auth0/universal-components-core';
import * as React from 'react';

import { SubComponent } from '../../../components/my-organization/{feature}/sub-component';
import { Header } from '../../../components/ui/header';
import { Spinner } from '../../../components/ui/spinner';
import { withMyOrganizationService } from '../../../hoc/with-services';
import { useFeatureHook } from '../../../hooks/my-organization/{feature}/use-feature';
import { useTheme } from '../../../hooks/use-theme';
import { useTranslator } from '../../../hooks/use-translator';
import type { ComponentProps } from '../../../types/my-organization/{feature}/{component}-types';

function ComponentInternal({
  schema,
  customMessages = {},
  styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  readOnly = false,
  ...props
}: ComponentProps): React.JSX.Element {
  const { t } = useTranslator('namespace.component', customMessages);
  const { isDarkMode } = useTheme();

  const { data, isLoading, actions } = useFeatureHook({ ...props });

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  if (isLoading) {
    return <Spinner />;
  }

  return <div style={currentStyles.variables}>{/* Component content */}</div>;
}

export const Component = withMyOrganizationService(ComponentInternal, REQUIRED_SCOPES);
```

### UI Component Location

| Type                                 | Location                                         |
| ------------------------------------ | ------------------------------------------------ |
| Base UI (button, dialog, form, etc.) | `packages/react/src/components/ui/`              |
| My Account components                | `packages/react/src/components/my-account/`      |
| My Organization components           | `packages/react/src/components/my-organization/` |

---

## Testing

### Test Configuration

- **Framework:** Vitest
- **Environment:** jsdom (React package)
- **Coverage threshold:** 80% (branches, functions, lines, statements)
- **Setup file:** `packages/*/vitest-setup.ts`

### Test File Conventions

| Pattern                | Purpose               |
| ---------------------- | --------------------- |
| `__tests__/*.test.ts`  | Unit tests            |
| `__tests__/*.test.tsx` | React component tests |

### Test Conventions

- Reuse utilities from `internals` when possible
- Add new mocks or update existing ones in `packages/react/src/internals/__mocks__/`
- Follow the `describe`/`it` naming convention: "when..." for conditions, action in `it`
- Use queries by priority: see [Testing Library query priority](https://testing-library.com/docs/queries/about/#priority)
- Avoid common mistakes: see [Kent C. Dodds - Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

**Example test structure:**

```tsx
describe('isOpen', () => {
  describe('when is true', () => {
    it('should render the modal', async () => {
      renderWithProviders(<Modal {...props({ isOpen: true })} />);
      await waitForComponentToLoad();
      expect(screen.getByDisplayValue('example.auth0.com')).toBeInTheDocument();
    });
  });

  describe('when is false', () => {
    it('should not render the modal content', () => {
      renderWithProviders(<Modal {...props({ isOpen: false })} />);
      expect(screen.queryByDisplayValue('example.auth0.com')).not.toBeInTheDocument();
    });
  });
});
```

### Test Utilities

Common test utilities are available from `@auth0/universal-components-react/internals`.

See full list of exports in: `packages/react/src/internals/index.ts`

```tsx
// Most commonly used utilities
import {
  TestProvider,
  renderWithProviders,
  renderWithFormProvider,
  mockCore,
  mockCreateCoreClient,
  setupAllCommonMocks,
} from '@auth0/universal-components-react/internals';
```

### Running Tests

```bash
# All tests with coverage
pnpm test

# Specific package
pnpm test:core
pnpm test:react

# Watch mode
pnpm test:watch

# Specific test file
cd packages/react && pnpm test organization-details-edit
```

---

## Build System

### Turborepo Tasks (`turbo.json`)

| Task            | Dependencies          | Outputs       |
| --------------- | --------------------- | ------------- |
| `build`         | `^build` (deps first) | `dist/**`     |
| `dev`           | -                     | (persistent)  |
| `test:coverage` | -                     | `coverage/**` |

### tsup Configuration

**Core package:**

- Entry: `src/index.ts`
- Formats: ESM + CJS
- SVG as data URLs

**React package:**

- Entries: `spa.ts`, `rwa.ts`
- Formats: ESM + CJS
- Banner: `"use client";`
- Externals: `react`, `react-dom`, `react-hook-form`, `@auth0/auth0-react`

### Build Commands

```bash
# Build all packages
pnpm build

# Build specific package
cd packages/core && pnpm build
cd packages/react && pnpm build

# Build shadcn registry
pnpm build:shadcn
```

---

## CI/CD Workflows

### GitHub Actions (`.github/workflows/`)

| Workflow                 | Trigger                 | Purpose                           |
| ------------------------ | ----------------------- | --------------------------------- |
| `ci-cd.yml`              | PR/push to main         | Format, lint, test, build + Slack |
| `unit-test.yml`          | PR/push                 | Tests + Codecov upload            |
| `preview-deploy.yml`     | PR opened/sync          | Vercel preview deployment         |
| `production-deploy.yml`  | Push to main/production | Vercel production deployment      |
| `publish-public-npm.yml` | Manual dispatch         | npm publish with dry-run option   |
| `claude-code-review.yml` | PR comments             | AI code review                    |
| `sca_scan.yml`           | -                       | Security vulnerability scanning   |

### Validation Pipeline

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm test
pnpm build
```

---

## Git Conventions

### Commit Message Format (Conventional Commits)

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Scopes:** `core`, `react`, `docs`, `www`, `registry`, `examples`

**Examples:**

```bash
feat(react): add tooltip to toggle action
fix(core): resolve i18n fallback issue
docs(examples): update Next.js setup guide
test(react): add MFA component tests
```

### Branch Naming

Pattern: `{TICKET}-{description}` (e.g., `UIC-531-tooltip-for-toggle-action`)

---

## Shadcn Registry

### Distribution

Components can be installed via shadcn CLI:

```bash
npx shadcn@latest add https://auth0-ui-components.vercel.app/r/my-organization/organization-details-edit.json
```

### Registry Configuration

- **Source:** `packages/react/registry.json`
- **Build command:** `pnpm build:shadcn`
- **Output:** `docs-site/public/r/`

### Adding to Registry

1. Update `packages/react/registry.json`
2. Run `pnpm build:shadcn`
3. Registry files copied to `docs-site/public/r/`

**Important:** Do not add `index` files to `registry.json` - only add individual component files.

---

## Environment Variables

### Examples Apps

| Variable               | Purpose                        |
| ---------------------- | ------------------------------ |
| `VITE_AUTH0_DOMAIN`    | Auth0 tenant domain            |
| `VITE_AUTH0_CLIENT_ID` | Application client ID          |
| `AUTH0_SECRET`         | Session encryption (Next.js)   |
| `AUTH0_BASE_URL`       | Application base URL (Next.js) |
| `AUTH0_CLIENT_SECRET`  | Client secret (Next.js)        |

### CI/CD

| Variable                    | Purpose                 |
| --------------------------- | ----------------------- |
| `VERCEL_ORG_ID`             | Vercel organization ID  |
| `VERCEL_PROJECT_ID`         | Vercel project ID       |
| `VERCEL_TOKEN`              | Vercel deployment token |
| `CODECOV_TOKEN`             | Codecov upload token    |
| `NPM_TOKEN`                 | npm publish token       |
| `SLACK_CI_WORKFLOW_WEBHOOK` | Slack notifications     |

---

## Key Files Reference

| File                                                                                                 | Purpose                     |
| ---------------------------------------------------------------------------------------------------- | --------------------------- |
| [`packages/core/src/auth/core-client.ts`](packages/core/src/auth/core-client.ts)                     | CoreClient factory          |
| [`packages/core/src/auth/auth-types.ts`](packages/core/src/auth/auth-types.ts)                       | Auth type definitions       |
| [`packages/core/src/i18n/i18n-service.ts`](packages/core/src/i18n/i18n-service.ts)                   | i18n service implementation |
| [`packages/react/src/spa.ts`](packages/react/src/spa.ts)                                             | SPA entry point             |
| [`packages/react/src/rwa.ts`](packages/react/src/rwa.ts)                                             | RWA entry point             |
| [`packages/react/src/providers/spa-provider.tsx`](packages/react/src/providers/spa-provider.tsx)     | SPA provider                |
| [`packages/react/src/providers/proxy-provider.tsx`](packages/react/src/providers/proxy-provider.tsx) | RWA proxy provider          |
| [`packages/react/src/hoc/with-services.tsx`](packages/react/src/hoc/with-services.tsx)               | Service HOC                 |
| [`packages/react/src/blocks/index.ts`](packages/react/src/blocks/index.ts)                           | Block exports               |
| [`packages/react/registry.json`](packages/react/registry.json)                                       | Shadcn registry config      |

---

## Anti-Patterns

- ❌ Consumers importing from internal source paths instead of package exports (e.g., use `@auth0/universal-components-react/spa` not `packages/react/src/...`)
- ❌ Using `@auth0/auth0-react` in RWA mode
- ❌ Hardcoding translations instead of using `useTranslator`
- ❌ Skipping `withServices` HOC for blocks requiring scopes
- ❌ Mutating CoreClient or context values directly
- ❌ Using `any` type without explicit justification
- ❌ Creating components without proper TypeScript props interface
- ❌ Ignoring schema validation for API inputs
- ❌ Storing sensitive data in client-accessible props
- ❌ Type casting (`as`) unless there is no other option
- ❌ Using linter/tsc skip annotations (`// @ts-ignore`, `// eslint-disable`) unless there is no other option

---

## PR Review Checklist

### Code Quality

- [ ] TypeScript strict mode compliance (no `any` without justification)
- [ ] Props interface defined in `types/` directory
- [ ] Translations use `useTranslator` hook
- [ ] Styling uses `getComponentStyles` utility
- [ ] Loading states handled with `Spinner` component

### Testing

- [ ] Unit tests for new hooks/utilities
- [ ] Component tests for new blocks
- [ ] Tests use `renderWithProviders` helper
- [ ] Coverage meets 80% threshold

### Documentation

- [ ] JSDoc comments for public APIs
- [ ] README updated if needed
- [ ] Docs-site page created for new components

### Architecture

- [ ] Blocks use appropriate `withServices` HOC
- [ ] Hooks follow `use{Feature}` naming
- [ ] Components follow folder structure conventions
- [ ] Proper separation between core and react packages

### Build & CI

- [ ] `pnpm build` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm format:check` passes
- [ ] No new dependencies without justification

---

## Dependency Graph

See the full dependency list in the respective `package.json` files:

- **Core package:** [`packages/core/package.json`](packages/core/package.json)
- **React package:** [`packages/react/package.json`](packages/react/package.json)

---

## Quick Start for Contributors

```bash
# 1. Clone and install
git clone https://github.com/auth0/auth0-ui-components
cd auth0-ui-components
pnpm install

# 2. Build all packages
pnpm build

# 3. Run docs site for local development
pnpm dev:docs

# 4. Make changes and test
pnpm test:watch

# 5. Validate before PR
pnpm format:check && pnpm lint && pnpm test && pnpm build

# 6. Commit with conventional format
pnpm commit

# 7. (Optional) Run an example app
cd examples/react-spa-npm && pnpm dev
# or
cd examples/next-rwa && pnpm dev
```

---

## Agent Skills Reference

This repository has additional AI agent skills installed for code reviews and audits.

### Installed Skills

| Skill                     | Location                                                                                                       | Purpose                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **React Best Practices**  | [`.github/skills/vercel-react-best-practices/AGENTS.md`](.github/skills/vercel-react-best-practices/AGENTS.md) | 40+ React/Next.js performance rules (waterfalls, bundle size, re-renders) |
| **Web Design Guidelines** | [`.github/skills/web-design-guidelines/SKILL.md`](.github/skills/web-design-guidelines/SKILL.md)               | UI/UX accessibility and design patterns (fetches from remote)             |

### When to Apply

- **PR Reviews:** Reference React Best Practices for performance issues
- **Component Audits:** Use Web Design Guidelines for accessibility checks
- **New Features:** Apply both when creating new UI components
