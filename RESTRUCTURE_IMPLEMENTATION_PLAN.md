# Auth0 UI Components - Restructure Implementation Plan

**Date:** February 4, 2026  
**Status:** Planning Phase  
**Goal:** Reorganize folder structure to improve Shadcn distribution and follow domain-driven component grouping

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Preparation](#phase-1-preparation)
4. [Phase 2: Core Package Reorganization](#phase-2-core-package-reorganization)
5. [Phase 3: React Package Reorganization](#phase-3-react-package-reorganization)
6. [Phase 4: Import Path Transformation](#phase-4-import-path-transformation)
7. [Phase 5: Shadcn Registry Updates](#phase-5-shadcn-registry-updates)
8. [Phase 6: Build System & Testing](#phase-6-build-system--testing)
9. [Phase 7: Documentation Updates](#phase-7-documentation-updates)
10. [Phase 8: Final Validation](#phase-8-final-validation)
11. [Risk Mitigation](#risk-mitigation)
12. [Rollback Plan](#rollback-plan)

---

## Overview

### Current Problems

1. Components distributed via Shadcn include files that projects already have (e.g., `lib/theme-utils.ts`)
2. Multiple `index.ts` files causing broken links when downloading single components
3. Non-Shadcn files (providers, HOCs, types) are distributed unnecessarily
4. Folder structure doesn't follow domain-driven design
5. Manual installation of `@auth0/universal-components-core` required
6. Unclear process for adding new Shadcn components

### Solution Summary

- **Shadcn-distributed files:** Domain-driven component structure under `@/components/auth0/`
  - Blocks at domain root (e.g., `@/components/auth0/my-organization/sso-provider-edit.tsx`)
  - Shared components in `/shared` subfolders
- **NPM-imported files:** Providers, HOCs, types, etc. imported from `@auth0/universal-components-react`
- **Import transformation:** Script to convert `@/` imports to `@auth0/universal-components-react/` imports when generating Shadcn registry
- **Minimal index files:** Keep only 3 essential index.ts files:
  1. `/components/index.ts` → export only blocks
  2. `/hooks/index.ts` → export only user-facing hooks
  3. `/types/index.ts` → export types (imported into spa.ts and rwa.ts)
- **Automated dependencies:** Add `@auth0/universal-components-core` as Shadcn dependency
- **Move to core:** styles and assets folders (consolidate duplicate assets)

---

## Confirmed Final Structure

> **Note:** This structure was approved by the team on February 2, 2026.

### React Package - Shadcn Distributed

```
packages/react/src/
├── components/
│   ├── ui/                                    # UI Atoms (Button, QRcode, etc.)
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── otp-field.tsx
│   │   ├── text-field.tsx
│   │   └── ...
│   ├── auth0/
│   │   ├── shared/                            # Cross-domain reusable (Wizard, DataTable)
│   │   │   ├── wizard.tsx
│   │   │   ├── data-table.tsx
│   │   │   └── ...
│   │   ├── my-account/
│   │   │   ├── user-mfa-management.tsx        # ← BLOCK (final component)
│   │   │   └── shared/                        # MFA shared components
│   │   │       └── mfa/
│   │   │           ├── delete-factor-confirmation.tsx
│   │   │           ├── qr-code-enrollment-form.tsx
│   │   │           ├── otp-verification-form.tsx
│   │   │           ├── contact-input-form.tsx
│   │   │           ├── factors-list.tsx
│   │   │           ├── empty-state.tsx
│   │   │           ├── error-state.tsx
│   │   │           └── show-recovery-code.tsx
│   │   └── my-organization/
│   │       ├── sso-provider-edit.tsx          # ← BLOCK
│   │       ├── sso-provider-create.tsx        # ← BLOCK
│   │       ├── sso-provider-table.tsx         # ← BLOCK
│   │       ├── domain-table.tsx               # ← BLOCK
│   │       ├── organization-details-edit.tsx  # ← BLOCK
│   │       └── shared/                        # Org shared components
│   │           ├── idp-management/
│   │           ├── domain-management/
│   │           └── organization-management/
│   └── index.ts                               # ✓ KEEP - exports only blocks
├── hooks/
│   ├── shared/                                # Cross-domain hooks
│   │   ├── use-theme.ts
│   │   ├── use-translator.ts
│   │   ├── use-core-client.ts
│   │   └── ...
│   ├── my-account/
│   │   └── mfa/
│   ├── my-organization/
│   │   ├── idp-management/
│   │   ├── domain-management/
│   │   └── organization-management/
│   └── index.ts                               # ✓ KEEP - exports user-facing hooks
├── lib/
│   ├── utils/
│   │   ├── my-account/
│   │   └── my-organization/
│   │       └── domain-management/
│   │           └── domain-management-utils.ts
│   ├── constants/
│   │   ├── my-account/
│   │   │   └── mfa/
│   │   │       └── mfa-constants.ts
│   │   └── my-organization/
│   └── utils.ts                               # ✗ NOT exposed in Shadcn (cn function)
```

### React Package - NPM Only (Not in Shadcn)

```
packages/react/src/
├── types/                                     # Imported via @auth0/universal-components-react
│   ├── auth-types.ts
│   ├── i18n-types.ts
│   ├── theme-types.ts
│   ├── toast-types.ts
│   ├── my-account/
│   ├── my-organization/
│   └── index.ts                               # ✓ KEEP - exports all types
├── providers/                                 # Imported via @auth0/universal-components-react/providers
├── hoc/                                       # Imported via @auth0/universal-components-react/hoc
├── tests/
│   └── utils/                                 # Testing utilities (moved from /internals)
├── spa.ts                                     # SPA entry point
└── rwa.ts                                     # RWA entry point
```

### Core Package

```
packages/core/src/
├── styles/                                    # ← Moved from react package
├── assets/                                    # ← Merged (react + existing core assets)
│   └── icons/
├── api/
├── auth/
├── i18n/
├── schemas/
├── services/
├── theme/
└── index.ts
```

### Key Points

| Category                  | Location                        | Shadcn? | Import Method                                   |
| ------------------------- | ------------------------------- | ------- | ----------------------------------------------- |
| Blocks (final components) | `components/auth0/my-*/` root   | ✅ Yes  | Shadcn CLI                                      |
| Shared domain components  | `components/auth0/my-*/shared/` | ✅ Yes  | Shadcn CLI                                      |
| UI Atoms                  | `components/ui/`                | ✅ Yes  | Shadcn CLI                                      |
| Cross-domain shared       | `components/auth0/shared/`      | ✅ Yes  | Shadcn CLI                                      |
| Hooks                     | `hooks/`                        | ✅ Yes  | Shadcn CLI                                      |
| Lib utils/constants       | `lib/`                          | ✅ Yes  | Shadcn CLI                                      |
| Types                     | `types/`                        | ❌ No   | `@auth0/universal-components-react`             |
| Providers                 | `providers/`                    | ❌ No   | `@auth0/universal-components-react/providers`   |
| HOCs                      | `hoc/`                          | ❌ No   | `@auth0/universal-components-react/hoc`         |
| Test utils                | `tests/utils/`                  | ❌ No   | `@auth0/universal-components-react/tests/utils` |
| Styles                    | `core/styles/`                  | ❌ No   | `@auth0/universal-components-core`              |
| Assets                    | `core/assets/`                  | ❌ No   | `@auth0/universal-components-core`              |

---

## Prerequisites

### Before Starting

- [ ] Create feature branch: `feat/restructure-component-architecture-UIC-323`
- [ ] Notify team of upcoming changes
- [ ] Create backup branch: `backup/pre-restructure-$(date +%Y%m%d)`
- [ ] Document current import patterns (run analysis script)
- [ ] Review all open PRs that may conflict
- [ ] Ensure all tests pass: `pnpm test`
- [ ] Ensure clean build: `pnpm build`

### Required Tools

- Node.js 18+
- pnpm
- jscodeshift (for codemod migrations)

---

## Phase 1: Preparation

### 1.1 Create Analysis Scripts

**Task:** Build scripts to analyze current structure

```bash
# Create scripts directory
mkdir -p scripts/restructure

# Files to create:
# - scripts/restructure/analyze-imports.mjs
# - scripts/restructure/analyze-exports.mjs
# - scripts/restructure/validate-structure.mjs
```

**Checklist:**

- [ ] Script to list all import statements by type
- [ ] Script to find all `index.ts` files and their exports
- [ ] Script to map current → new file paths
- [ ] Script to identify UDS components used directly

**Output:** `scripts/restructure/analysis-report.json`

### 1.2 Create Migration Map

**Task:** Document every file move

Create `scripts/restructure/migration-map.json`:

```json
{
  "files": [
    {
      "from": "packages/react/src/blocks/my-organization/sso-provider-edit.tsx",
      "to": "packages/react/src/components/auth0/my-organization/sso-provider-edit.tsx",
      "type": "block",
      "domain": "my-organization"
    }
  ],
  "folders": [
    {
      "from": "packages/react/src/components/my-organization",
      "to": "packages/react/src/components/auth0/my-organization/shared",
      "type": "shared-components"
    }
  ]
}
```

**Checklist:**

- [ ] Map all block files
- [ ] Map all component files
- [ ] Map all hook files
- [ ] Map all lib files
- [ ] Map styles and assets to core
- [ ] Map internals to tests/utils

### 1.3 Create Codemod Scripts

**Task:** Write automated migration scripts using jscodeshift

```bash
# Install jscodeshift
pnpm add -D jscodeshift @types/jscodeshift

# Create codemod files:
# - scripts/restructure/codemods/update-component-imports.ts
# - scripts/restructure/codemods/update-hook-imports.ts
# - scripts/restructure/codemods/update-type-imports.ts
# - scripts/restructure/codemods/update-lib-imports.ts
```

**Checklist:**

- [ ] Codemod for component imports
- [ ] Codemod for hook imports
- [ ] Codemod for type imports
- [ ] Codemod for HOC/provider imports
- [ ] Codemod for lib/utils imports
- [ ] Test codemods on sample files

---

## Phase 2: Core Package Reorganization

### 2.1 Move Assets and Styles

**Task:** Move `packages/react/src/assets` and `packages/react/src/styles` to core

**Steps:**

1. **Create directories in core:**

   ```bash
   mkdir -p packages/core/src/assets
   mkdir -p packages/core/src/styles
   ```

2. **Move files:**

   ```bash
   # Move assets
   mv packages/react/src/assets/* packages/core/src/assets/

   # Move styles
   mv packages/react/src/styles/* packages/core/src/styles/
   ```

3. **Update core package exports:**
   - Update `packages/core/src/index.ts`
   - Update `packages/core/package.json` exports field
   - Update `packages/core/tsup.config.ts` for asset handling

4. **Update react package imports:**
   - Change all `@/assets/*` → `@auth0/universal-components-core/assets/*`
   - Change all `@/styles/*` → `@auth0/universal-components-core/styles/*`

**Checklist:**

- [ ] Create asset directories in core
- [ ] Move all asset files
- [ ] Move all style files
- [ ] Update core exports
- [ ] Update react imports
- [ ] Verify no duplicate assets folders
- [ ] Test build: `cd packages/core && pnpm build`
- [ ] Coordinate with Naveen on styling bundle generation

### 2.2 Move Types to Core

**Task:** Consolidate types in core package

**Steps:**

1. **Analyze current types:**
   - Identify types that should stay in core
   - Identify types that are React-specific

2. **Create type structure in core:**

   ```bash
   mkdir -p packages/core/src/types/my-account
   mkdir -p packages/core/src/types/my-organization
   mkdir -p packages/core/src/types/shared
   ```

3. **Move appropriate types:**
   - Move domain-agnostic types to core
   - Keep React component prop types in react package

4. **Create `packages/core/src/types/index.ts`:**
   - Export all types for consumption

5. **Update react package:**
   - Import types from core where appropriate
   - Keep only React-specific types

**Checklist:**

- [ ] Audit all type files
- [ ] Move core types to core package
- [ ] Create types/index.ts in core
- [ ] Update core exports
- [ ] Update react imports
- [ ] Update spa.ts and rwa.ts to export types from core
- [ ] Test TypeScript compilation

---

## Phase 3: React Package Reorganization

### 3.1 Create New Directory Structure

**Task:** Create all new directories in react package

```bash
cd packages/react/src

# Create new structure
mkdir -p components/ui
mkdir -p components/auth0/shared
mkdir -p components/auth0/my-account/shared
mkdir -p components/auth0/my-organization/shared

mkdir -p hooks/shared
mkdir -p hooks/my-account
mkdir -p hooks/my-organization

mkdir -p lib/utils/my-account
mkdir -p lib/utils/my-organization
mkdir -p lib/constants/my-account
mkdir -p lib/constants/my-organization

mkdir -p tests/utils
```

**Checklist:**

- [ ] Create all component directories
- [ ] Create all hook directories
- [ ] Create all lib directories
- [ ] Create tests/utils directory
- [ ] Verify directory structure

### 3.2 Move UI Components (Atoms)

**Task:** Move/organize UI atom components to `components/ui/`

**Files to organize:**

- `button.tsx`
- `qrcode.tsx`
- `empty-state.tsx`
- Other plain UDS dependencies

**Steps:**

1. **Identify all UI atoms:**

   ```bash
   # List current UI components
   ls packages/react/src/components/ui/
   ```

2. **Verify each is a pure atom:**
   - No domain-specific logic
   - Can be reused across any component
   - Matches UDS patterns

3. **Keep in `components/ui/`:**
   - These are already in the correct location
   - Ensure no domain logic

**Checklist:**

- [ ] Audit all UI components
- [ ] Verify atom purity
- [ ] Document which are Auth0-specific vs. UDS
- [ ] Update import paths if needed

### 3.3 Move Shared Components

**Task:** Move cross-domain components to `components/auth0/shared/`

**Components:**

- `Wizard`
- `DataTable`
- Other components used across domains

**Steps:**

1. **Identify shared components:**
   - Currently in `components/`
   - Used by both my-account and my-organization

2. **Move to auth0/shared:**

   ```bash
   mv packages/react/src/components/shared/wizard.tsx \
      packages/react/src/components/auth0/shared/wizard.tsx

   mv packages/react/src/components/shared/data-table.tsx \
      packages/react/src/components/auth0/shared/data-table.tsx
   ```

3. **Update all imports:**
   - Use codemod to update import paths
   - `@/components/shared/*` → `@/components/auth0/shared/*`

**Checklist:**

- [ ] Identify all shared components
- [ ] Move to auth0/shared/
- [ ] Update imports across codebase
- [ ] Verify no broken imports
- [ ] Test build

### 3.4 Move My Account Components

**Task:** Reorganize my-account components

**Target Structure:**

```
components/auth0/my-account/
├── user-mfa-management.tsx      # Block (from blocks/my-account/mfa/)
├── shared/                       # Shared components (from components/my-account/)
│   ├── mfa/
│   │   ├── delete-factor-confirmation.tsx
│   │   ├── qr-code-enrollment-form.tsx
│   │   ├── otp-verification-form.tsx
│   │   ├── contact-input-form.tsx
│   │   ├── factors-list.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-state.tsx
│   │   └── show-recovery-code.tsx
│   └── ...
```

**Current Location → New Location:**

- `blocks/my-account/mfa/user-mfa-management.tsx` → `components/auth0/my-account/user-mfa-management.tsx`
- `components/my-account/mfa/*` → `components/auth0/my-account/shared/mfa/*`

**Steps:**

1. **Move blocks to root:**

   ```bash
   mv packages/react/src/blocks/my-account/user-mfa-management.tsx \
      packages/react/src/components/auth0/my-account/user-mfa-management.tsx
   ```

2. **Move shared components:**

   ```bash
   mv packages/react/src/components/my-account/* \
      packages/react/src/components/auth0/my-account/shared/
   ```

3. **Update imports:**
   - Blocks: `@/blocks/my-account/*` → `@/components/auth0/my-account/*`
   - Shared: `@/components/my-account/*` → `@/components/auth0/my-account/shared/*`

**Checklist:**

- [ ] Move user-mfa-management.tsx
- [ ] Move all shared my-account components
- [ ] Update all imports
- [ ] Verify component functionality
- [ ] Test build

### 3.5 Move My Organization Components

**Task:** Reorganize my-organization components

**Target Structure:**

```
components/auth0/my-organization/
├── sso-provider-edit.tsx           # Block (from blocks/my-organization/idp-management/)
├── sso-provider-create.tsx         # Block (from blocks/my-organization/idp-management/)
├── sso-provider-table.tsx          # Block (from blocks/my-organization/idp-management/)
├── domain-table.tsx                # Block (from blocks/my-organization/domain-management/)
├── organization-details-edit.tsx   # Block (from blocks/my-organization/organization-management/)
├── shared/                          # Shared components (from components/my-organization/)
│   ├── idp-management/
│   │   ├── sso-provider-edit/
│   │   └── ...
│   ├── domain-management/
│   │   └── ...
│   └── organization-management/
│       └── ...
```

**Current Location → New Location:**

- `blocks/my-organization/idp-management/sso-provider-edit.tsx` → `components/auth0/my-organization/sso-provider-edit.tsx`
- `blocks/my-organization/idp-management/sso-provider-create.tsx` → `components/auth0/my-organization/sso-provider-create.tsx`
- `blocks/my-organization/idp-management/sso-provider-table.tsx` → `components/auth0/my-organization/sso-provider-table.tsx`
- `blocks/my-organization/domain-management/domain-table.tsx` → `components/auth0/my-organization/domain-table.tsx`
- `blocks/my-organization/organization-management/organization-details-edit.tsx` → `components/auth0/my-organization/organization-details-edit.tsx`
- `components/my-organization/*` → `components/auth0/my-organization/shared/*`

**Steps:**

1. **Move blocks to root:**

   ```bash
   mv packages/react/src/blocks/my-organization/*.tsx \
      packages/react/src/components/auth0/my-organization/
   ```

2. **Move shared components:**

   ```bash
   mv packages/react/src/components/my-organization/* \
      packages/react/src/components/auth0/my-organization/shared/
   ```

3. **Update imports:**
   - Apply codemod for import updates

**Checklist:**

- [ ] Move all organization blocks
- [ ] Move all shared organization components
- [ ] Update all imports
- [ ] Verify component functionality
- [ ] Test build

### 3.6 Reorganize Hooks

**Task:** Move hooks to domain-specific folders

**Structure:**

```
hooks/
├── shared/              # Cross-domain hooks
│   ├── use-theme.ts
│   ├── use-translator.ts
│   └── ...
├── my-account/
│   ├── use-mfa-management.ts
│   └── ...
└── my-organization/
    ├── use-sso-providers.ts
    └── ...
```

**Steps:**

1. **Categorize hooks:**
   - Identify shared hooks
   - Identify my-account hooks
   - Identify my-organization hooks

2. **Move to appropriate folders:**

   ```bash
   # Example
   mv packages/react/src/hooks/use-theme.ts \
      packages/react/src/hooks/shared/use-theme.ts
   ```

3. **Update imports:**
   - `@/hooks/*` paths update based on new location

**Checklist:**

- [ ] Categorize all hooks
- [ ] Move to domain folders
- [ ] Update all imports
- [ ] Create hooks/index.ts (export only user-facing hooks)
- [ ] Test build

### 3.7 Reorganize Lib Files

**Task:** Move and reorganize lib files

**Changes:**

1. **Move MFA constants:**

   ```
   FROM: lib/mfa-constants.ts
   TO:   lib/constants/my-account/mfa/mfa-constants.ts
   ```

2. **Move domain management:**

   ```
   FROM: lib/my-organization/domain-management.ts
   TO:   lib/utils/my-organization/domain-management/domain-management-utils.ts
   ```

3. **Rename theme-utils:**
   ```
   FROM: lib/theme-utils.ts
   TO:   lib/utils.ts
   ```
   **IMPORTANT:** This file must NOT be exposed in Shadcn

**Steps:**

1. **Create new structure:**

   ```bash
   mkdir -p packages/react/src/lib/constants/my-account/mfa
   mkdir -p packages/react/src/lib/utils/my-organization/domain-management
   ```

2. **Move files:**

   ```bash
   mv packages/react/src/lib/mfa-constants.ts \
      packages/react/src/lib/constants/my-account/mfa/mfa-constants.ts

   mv packages/react/src/lib/my-organization/domain-management.ts \
      packages/react/src/lib/utils/my-organization/domain-management/domain-management-utils.ts

   mv packages/react/src/lib/theme-utils.ts \
      packages/react/src/lib/utils.ts
   ```

3. **Update imports:**
   - Apply codemod

**Checklist:**

- [ ] Move mfa-constants.ts
- [ ] Move domain-management.ts
- [ ] Rename theme-utils.ts to utils.ts
- [ ] Update all imports
- [ ] Ensure utils.ts is not in registry.json
- [ ] Test build

### 3.8 Move Test Utils

**Task:** Move internals and test helpers to `tests/utils/`

**Changes:**

```
FROM: src/internals/
TO:   src/tests/utils/

FROM: src/__tests__/utils/test-helpers.ts
TO:   src/tests/utils/test-helpers.ts
```

**Steps:**

1. **Create tests directory:**

   ```bash
   mkdir -p packages/react/src/tests/utils
   ```

2. **Move internals:**

   ```bash
   mv packages/react/src/internals/* packages/react/src/tests/utils/
   rmdir packages/react/src/internals
   ```

3. **Move test helpers:**

   ```bash
   mv packages/react/src/__tests__/utils/test-helpers.ts \
      packages/react/src/tests/utils/test-helpers.ts
   rmdir packages/react/src/__tests__/utils
   rmdir packages/react/src/__tests__
   ```

4. **Update test imports:**
   - Update all test files to import from new location
   - Update `packages/react/src/tests/utils/index.ts` (currently internals/index.ts)

5. **Update package exports:**
   - Update `packages/react/package.json` exports for `/internals` → `/tests/utils`

**Checklist:**

- [ ] Move internals folder
- [ ] Move test-helpers.ts
- [ ] Remove old folders
- [ ] Update test imports
- [ ] Update package.json exports
- [ ] Test all tests: `pnpm test:react`

### 3.9 Remove Index Files

**Task:** Remove all index.ts files except 3

**Why:** Barrel imports (index.js re-exports) import the entire module even if you need one component. This adds unused code to your bundle and causes broken links when downloading single components via Shadcn.

**Keep only these 3 index.ts files:**

1. `/components/index.ts` - Export only blocks (final components)
2. `/hooks/index.ts` - Export only user-facing hooks
3. `/types/index.ts` - Export types (imported into spa.ts and rwa.ts)

**Delete all other index.ts files in react package** (currently ~20+ files)

**Index Files to DELETE (React Package):**

```
packages/react/src/
├── blocks/index.ts                                              # DELETE
├── hooks/my-organization/index.ts                               # DELETE
├── hooks/my-organization/organization-management/index.ts       # DELETE
├── hooks/my-account/index.ts                                    # DELETE
├── hooks/my-account/mfa/index.ts                                # DELETE
├── lib/my-organization/index.ts                                 # DELETE
├── internals/index.ts                                           # DELETE (moving to tests/utils/)
├── internals/__mocks__/index.ts                                 # DELETE
├── components/my-organization/organization-management/index.ts  # DELETE
├── components/my-organization/organization-management/organization-details/index.ts  # DELETE
├── components/my-organization/idp-management/sso-provider-edit/sso-provisioning/index.ts  # DELETE
└── ... (any others found)
```

**Index Files to KEEP (React Package):**

```
packages/react/src/
├── components/index.ts  # ✓ KEEP - exports blocks only
├── hooks/index.ts       # ✓ KEEP - exports user-facing hooks only
└── types/index.ts       # ✓ KEEP - exports all types
```

**Steps:**

1. **Audit all index.ts files:**

   ```bash
   find packages/react/src -name "index.ts" -type f
   ```

2. **For each index.ts NOT in the keep list:**
   - Update imports that use the index to import directly
   - Delete the index.ts file

3. **Update remaining index files:**

   **components/index.ts:**

   ```typescript
   // Export only blocks (final components) - FLAT structure at domain root
   // My Account
   export { UserMFAManagement } from './auth0/my-account/user-mfa-management';

   // My Organization
   export { SsoProviderEdit } from './auth0/my-organization/sso-provider-edit';
   export { SsoProviderCreate } from './auth0/my-organization/sso-provider-create';
   export { SsoProviderTable } from './auth0/my-organization/sso-provider-table';
   export { DomainTable } from './auth0/my-organization/domain-table';
   export { OrganizationDetailsEdit } from './auth0/my-organization/organization-details-edit';
   ```

   **types/index.ts:**

   ```typescript
   // Export all types - imported into spa.ts and rwa.ts
   export * from './auth-types';
   export * from './i18n-types';
   export * from './theme-types';
   export * from './toast-types';
   export * from './my-account';
   export * from './my-organization';
   ```

   **hooks/index.ts:**

   ```typescript
   // Export only hooks users need (public API)
   export { useTheme } from './shared/use-theme';
   export { useTranslator } from './shared/use-translator';
   // Add others as needed
   ```

4. **Update tsconfig.json:**
   - Ensure path resolution works without index files

**Checklist:**

- [ ] Find all index.ts files
- [ ] Categorize keep vs. remove
- [ ] Update imports for removed indexes
- [ ] Delete unnecessary index files
- [ ] Update kept index files
- [ ] Test build
- [ ] Verify no broken imports

---

## Phase 4: Import Path Transformation

### 4.1 Update Alias Configuration

**Task:** Ensure all imports use `@/` alias

**Files to update:**

- `packages/react/tsconfig.json`
- `packages/react/vite.config.ts` (if exists)
- `packages/react/vitest.config.ts`

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Checklist:**

- [ ] Update tsconfig.json paths
- [ ] Update vitest.config.ts if needed
- [ ] Remove any `@react/*` alias configurations
- [ ] Test TypeScript compilation
- [ ] Test editor autocomplete suggests `@/`

### 4.2 Run Import Codemods

**Task:** Update all imports to use `@/` alias and new paths

**Steps:**

1. **Run component import codemod:**

   ```bash
   pnpm jscodeshift -t scripts/restructure/codemods/update-component-imports.ts \
     packages/react/src/**/*.{ts,tsx}
   ```

2. **Run hook import codemod:**

   ```bash
   pnpm jscodeshift -t scripts/restructure/codemods/update-hook-imports.ts \
     packages/react/src/**/*.{ts,tsx}
   ```

3. **Run type import codemod:**

   ```bash
   pnpm jscodeshift -t scripts/restructure/codemods/update-type-imports.ts \
     packages/react/src/**/*.{ts,tsx}
   ```

4. **Run lib import codemod:**

   ```bash
   pnpm jscodeshift -t scripts/restructure/codemods/update-lib-imports.ts \
     packages/react/src/**/*.{ts,tsx}
   ```

5. **Manual verification:**
   - Search for remaining relative imports: `grep -r "from '\.\." packages/react/src/`
   - Search for `@react/` imports: `grep -r "@react/" packages/react/src/`
   - Update any stragglers manually

**Checklist:**

- [ ] Run all codemods
- [ ] Verify no relative imports remain (except local ones)
- [ ] Verify no `@react/` imports
- [ ] All imports use `@/` alias
- [ ] Test TypeScript compilation
- [ ] Test build

### 4.3 Create Registry Import Transformer

**Task:** Build script to transform imports for Shadcn registry

**Script:** `scripts/build-shadcn-registry.ts`

**Purpose:** When generating Shadcn registry files, transform imports for files that are NOT distributed via Shadcn (they come from npm instead).

**Transform Rules:**

| Source Import       | Registry Output                                 | Reason                  |
| ------------------- | ----------------------------------------------- | ----------------------- |
| `@/types/*`         | `@auth0/universal-components-react/types/*`     | Types from npm          |
| `@/providers/*`     | `@auth0/universal-components-react/providers/*` | Providers from npm      |
| `@/hoc/*`           | `@auth0/universal-components-react/hoc/*`       | HOCs from npm           |
| `@/lib/utils`       | `@auth0/universal-components-react/lib/utils`   | cn() function from npm  |
| `@/components/*`    | `@/components/*`                                | ✗ NO transform - Shadcn |
| `@/hooks/*`         | `@/hooks/*`                                     | ✗ NO transform - Shadcn |
| `@/lib/constants/*` | `@/lib/constants/*`                             | ✗ NO transform - Shadcn |
| `@/lib/utils/*`     | `@/lib/utils/*`                                 | ✗ NO transform - Shadcn |

**Example Transformation:**

```typescript
// BEFORE (in source file: components/auth0/my-organization/sso-provider-edit.tsx)
import { SsoProviderEditProps } from '@/types/my-organization/sso-provider-types';
import { withMyOrganizationService } from '@/hoc/with-services';
import { useTranslator } from '@/hooks/shared/use-translator'; // NO transform
import { Button } from '@/components/ui/button'; // NO transform

// AFTER (in Shadcn registry output)
import { SsoProviderEditProps } from '@auth0/universal-components-react/types/my-organization/sso-provider-types';
import { withMyOrganizationService } from '@auth0/universal-components-react/hoc/with-services';
import { useTranslator } from '@/hooks/shared/use-translator'; // Unchanged
import { Button } from '@/components/ui/button'; // Unchanged
```

**Implementation:**

```typescript
// scripts/build-shadcn-registry.ts

const NPM_IMPORT_PATTERNS = [
  // Transform these to npm package imports
  { from: /@\/types\//g, to: '@auth0/universal-components-react/types/' },
  { from: /@\/providers\//g, to: '@auth0/universal-components-react/providers/' },
  { from: /@\/hoc\//g, to: '@auth0/universal-components-react/hoc/' },
  { from: /@\/lib\/utils(['"])/g, to: '@auth0/universal-components-react/lib/utils$1' },
];

// DO NOT transform these - they are distributed via Shadcn
const SHADCN_PATTERNS = [
  '@/components/',
  '@/hooks/',
  '@/lib/constants/',
  '@/lib/utils/', // Note: /lib/utils/* (with subfolder) stays, /lib/utils (file) transforms
];

function transformImportsForRegistry(content: string, filePath: string): string {
  let result = content;

  for (const pattern of NPM_IMPORT_PATTERNS) {
    result = result.replace(pattern.from, pattern.to);
  }

  return result;
}
```

**Checklist:**

- [ ] Create transform script
- [ ] Define transformation patterns
- [ ] Handle edge cases (comments, strings)
- [ ] Test on sample files
- [ ] Integrate into build:shadcn process
- [ ] Verify transformed output

### 4.4 Update React Package Exports

**Task:** Update package.json exports for non-Shadcn imports

**packages/react/package.json:**

```json
{
  "exports": {
    "./spa": {
      "types": "./dist/spa.d.ts",
      "import": "./dist/spa.js",
      "require": "./dist/spa.cjs"
    },
    "./rwa": {
      "types": "./dist/rwa.d.ts",
      "import": "./dist/rwa.js",
      "require": "./dist/rwa.cjs"
    },
    "./styles": "./dist/styles.css",
    "./providers/*": {
      "types": "./dist/providers/*.d.ts",
      "import": "./dist/providers/*.js",
      "require": "./dist/providers/*.cjs"
    },
    "./hoc/*": {
      "types": "./dist/hoc/*.d.ts",
      "import": "./dist/hoc/*.js",
      "require": "./dist/hoc/*.cjs"
    },
    "./types/*": {
      "types": "./dist/types/*.d.ts",
      "import": "./dist/types/*.js",
      "require": "./dist/types/*.cjs"
    },
    "./lib/*": {
      "types": "./dist/lib/*.d.ts",
      "import": "./dist/lib/*.js",
      "require": "./dist/lib/*.cjs"
    },
    "./tests/utils": {
      "types": "./dist/tests/utils/index.d.ts",
      "import": "./dist/tests/utils/index.js",
      "require": "./dist/tests/utils/index.cjs"
    }
  }
}
```

**Checklist:**

- [ ] Update package.json exports
- [ ] Test imports from external package
- [ ] Verify TypeScript types resolution
- [ ] Test in example apps

---

## Phase 5: Shadcn Registry Updates

### 5.1 Identify UDS Components

**Task:** Find components directly from UDS with no changes

**Steps:**

1. **Audit UI components:**

   ```bash
   ls packages/react/src/components/ui/
   ```

2. **For each component:**
   - Check if it's unchanged from UDS
   - Check if there are Auth0-specific modifications

3. **Create list of pure UDS components**

**Checklist:**

- [ ] Audit all UI components
- [ ] Document which are pure UDS
- [ ] Document which have Auth0 modifications
- [ ] Create list for registryDependencies

### 5.2 Update registry.json

**Task:** Update registry configuration with new structure

**Location:** `packages/react/registry.json`

**Changes:**

1. **Update file paths to new structure:**

   ```json
   {
     "name": "user-mfa-management",
     "type": "registry:block",
     "files": [
       {
         "path": "components/auth0/my-account/user-mfa-management.tsx",
         "type": "registry:component"
       },
       {
         "path": "components/auth0/my-account/shared/delete-factor-confirmation.tsx",
         "type": "registry:component"
       }
     ],
     "registryDependencies": ["button", "dialog", "form"],
     "dependencies": ["@auth0/universal-components-core"]
   }
   ```

2. **Add registryDependencies for UDS components:**
   - Remove pure UDS components from `files` array
   - Add to `registryDependencies` array

3. **Add @auth0/universal-components-core dependency:**
   - Add to every component's `dependencies` array
   - Optionally support versioning

4. **Remove index.ts files from registry:**
   - Do not include any index.ts in files list

5. **Remove lib/utils.ts from registry:**
   - This file should not be distributed via Shadcn

**Checklist:**

- [ ] Update all file paths
- [ ] Add registryDependencies for UDS components
- [ ] Add @auth0/universal-components-core to dependencies
- [ ] Remove index.ts files
- [ ] Remove lib/utils.ts
- [ ] Validate JSON syntax
- [ ] Test registry build

### 5.3 Update Build Shadcn Script

**Task:** Integrate import transformer into build process

**Current:** `pnpm build:shadcn` runs a script

**Update:** `scripts/build-shadcn-registry.ts`

**Steps:**

1. **Update build script to:**
   - Read registry.json
   - For each component file:
     - Read source file
     - Transform imports (using transformer from 4.3)
     - Write to output location
   - Generate registry metadata
   - Copy to `docs-site/public/r/`

2. **Handle versioning:**
   - Read `packages/react/package.json` version
   - Use same version for `@auth0/universal-components-core` dependency
   - Or read from `packages/core/package.json`

**Checklist:**

- [ ] Update build script
- [ ] Integrate import transformer
- [ ] Add versioning logic
- [ ] Test build output
- [ ] Verify transformed imports
- [ ] Test generated registry files

### 5.4 Test Shadcn Installation

**Task:** Verify components install correctly via Shadcn

**Steps:**

1. **Build registry:**

   ```bash
   pnpm build:shadcn
   ```

2. **Test in example app:**

   ```bash
   cd examples/react-spa-shadcn

   # Test installing a component
   npx shadcn@latest add http://localhost:5173/r/my-organization/organization-details-edit.json
   ```

3. **Verify:**
   - All files downloaded correctly
   - Imports are correct (npm imports for providers/hoc/types)
   - No broken links
   - `@auth0/universal-components-core` installed automatically
   - Component works

**Checklist:**

- [ ] Build registry successfully
- [ ] Install test component
- [ ] Verify file structure
- [ ] Verify imports
- [ ] Check no broken dependencies
- [ ] Test component functionality
- [ ] Repeat for multiple components

---

## Phase 6: Build System & Testing

### 6.1 Update Build Configuration

**Task:** Update build configs for new structure

**Files:**

- `packages/react/tsup.config.ts`
- `packages/core/tsup.config.ts`
- `turbo.json`

**Steps:**

1. **Update tsup configs:**
   - Verify entry points
   - Update external dependencies
   - Ensure assets bundled correctly

2. **Test builds:**
   ```bash
   pnpm build:core
   pnpm build:react
   pnpm build
   ```

**Checklist:**

- [ ] Update tsup.config.ts files
- [ ] Build core package successfully
- [ ] Build react package successfully
- [ ] Build all packages
- [ ] Verify dist/ output structure
- [ ] Check bundle sizes
- [ ] Verify CSS bundling

### 6.2 Update Test Configuration

**Task:** Update test configs for new paths

**Files:**

- `packages/react/vitest.config.ts`
- `packages/react/vitest-setup.ts`
- `packages/core/vitest.config.ts`

**Steps:**

1. **Update path aliases in vitest config:**

   ```typescript
   resolve: {
     alias: {
       '@': path.resolve(__dirname, './src')
     }
   }
   ```

2. **Update test setup:**
   - Update imports in vitest-setup.ts

3. **Run tests:**
   ```bash
   pnpm test:core
   pnpm test:react
   pnpm test
   ```

**Checklist:**

- [ ] Update vitest configs
- [ ] Update vitest-setup files
- [ ] Run core tests
- [ ] Run react tests
- [ ] All tests pass
- [ ] Coverage meets 80% threshold
- [ ] Update test documentation

### 6.3 Update Example Apps

**Task:** Update example apps to use new structure

**Apps:**

- `examples/react-spa-npm/`
- `examples/react-spa-shadcn/`
- `examples/next-rwa/`

**Steps:**

1. **For npm example:**
   - Update imports from `@auth0/universal-components-react`
   - Verify all imports work

2. **For shadcn example:**
   - Re-install components using new registry
   - Verify functionality

3. **For Next.js example:**
   - Update imports
   - Test RWA mode

**Checklist:**

- [ ] Update react-spa-npm
- [ ] Update react-spa-shadcn
- [ ] Update next-rwa
- [ ] All examples run successfully
- [ ] All examples build successfully
- [ ] Test functionality in each

---

## Phase 7: Documentation Updates

### 7.1 Update Internal Documentation

**Task:** Document new structure and processes

**Files to create/update:**

1. **CONTRIBUTING.md:**
   - Update folder structure section
   - Update import guidelines
   - Add section on alias usage

2. **AGENTS.md:**
   - Update architecture section
   - Update component structure
   - Update key files reference
   - Add shadcn component creation guide

3. **packages/react/README.md:**
   - Update structure documentation
   - Update usage examples
   - Update import examples

4. **CREATE_SHADCN_COMPONENT.md** (NEW):

   ```markdown
   # Adding a New Shadcn Component

   ## Step 1: Create Component Files

   ...

   ## Step 2: Update registry.json

   ...

   ## Step 3: Build Registry

   ...

   ## Step 4: Test Installation

   ...
   ```

**Checklist:**

- [ ] Update CONTRIBUTING.md
- [ ] Update AGENTS.md
- [ ] Update packages/react/README.md
- [ ] Create CREATE_SHADCN_COMPONENT.md
- [ ] Add migration guide for existing users
- [ ] Update component structure diagrams

### 7.2 Update Component Documentation

**Task:** Update docs-site component pages

**Files:** `docs-site/src/pages/*Docs.tsx`

**Changes:**

- Remove "install @auth0/universal-components-core manually" instructions
- Update import paths in examples
- Update component usage examples

**Checklist:**

- [ ] Update UserMFAMgmtDocs.tsx
- [ ] Update OrganizationDetailsEditDocs.tsx
- [ ] Update SsoProviderCreateDocs.tsx
- [ ] Update SsoProviderEditDocs.tsx
- [ ] Update SsoProviderTableDocs.tsx
- [ ] Update DomainTableDocs.tsx
- [ ] Update GettingStarted.tsx
- [ ] Update MyAccountIntroduction.tsx
- [ ] Update MyOrganizationIntroduction.tsx

### 7.3 Update API Documentation

**Task:** Update JSDoc comments for public APIs

**Focus areas:**

- Exported blocks
- Exported hooks
- Provider components
- HOC functions

**Checklist:**

- [ ] Update component JSDoc
- [ ] Update hook JSDoc
- [ ] Update provider JSDoc
- [ ] Update HOC JSDoc
- [ ] Add examples in JSDoc

---

## Phase 8: Final Validation

### 8.1 Comprehensive Testing

**Task:** Run full test suite

**Commands:**

```bash
# Format check
pnpm format:check

# Lint
pnpm lint

# Type check
pnpm tsc --noEmit

# Tests
pnpm test

# Build
pnpm build

# Build docs
pnpm build:docs

# Build shadcn
pnpm build:shadcn
```

**Checklist:**

- [ ] Format check passes
- [ ] Lint passes
- [ ] Type check passes
- [ ] All tests pass
- [ ] Test coverage ≥ 80%
- [ ] Build succeeds
- [ ] Docs build succeeds
- [ ] Shadcn build succeeds

### 8.2 Integration Testing

**Task:** Test full workflow in real scenarios

**Scenarios:**

1. **Shadcn Installation:**
   - [ ] Install single component
   - [ ] Install multiple components
   - [ ] Verify no broken imports
   - [ ] Verify auto-install of core package

2. **NPM Package Usage:**
   - [ ] Install from npm (in example app)
   - [ ] Import from SPA mode
   - [ ] Import from RWA mode
   - [ ] Verify TypeScript types

3. **Development Workflow:**
   - [ ] Run dev server
   - [ ] Hot reload works
   - [ ] Add new component
   - [ ] Build and test

**Checklist:**

- [ ] Complete all scenarios
- [ ] Document any issues
- [ ] Fix critical issues
- [ ] Create tickets for minor issues

### 8.3 Performance Validation

**Task:** Ensure no performance regression

**Metrics:**

- Bundle size
- Build time
- Test execution time

**Steps:**

1. **Measure before:**
   - Checkout main branch
   - Run `pnpm build` and measure time
   - Check dist/ bundle sizes
   - Run `pnpm test` and measure time

2. **Measure after:**
   - Checkout feature branch
   - Run same measurements

3. **Compare:**
   - Bundle size should not increase significantly
   - Build time should be similar
   - Test time should be similar

**Checklist:**

- [ ] Measure baseline metrics
- [ ] Measure new metrics
- [ ] Compare results
- [ ] Investigate any regressions
- [ ] Document performance impact

---

## Risk Mitigation

### Potential Risks

| Risk                                | Impact | Mitigation                                     |
| ----------------------------------- | ------ | ---------------------------------------------- |
| Breaking changes for existing users | High   | Version bump, migration guide, clear changelog |
| Broken imports after restructure    | High   | Automated codemods, comprehensive testing      |
| Shadcn install failures             | High   | Thorough testing, rollback plan                |
| Build system issues                 | Medium | Incremental changes, test after each phase     |
| Test failures                       | Medium | Fix immediately, maintain coverage             |
| Documentation outdated              | Low    | Update docs in same PR                         |

### Pre-Implementation Validation

- [ ] All tests passing on main branch
- [ ] Clean build on main branch
- [ ] No pending PRs with conflicting changes
- [ ] Team notified of upcoming changes

### During Implementation

- [ ] Commit frequently with clear messages
- [ ] Run tests after each major change
- [ ] Keep rollback plan updated
- [ ] Document unexpected issues

---

## Rollback Plan

### If Critical Issues Arise

1. **Stop immediately** - Don't continue if blocking issues found

2. **Assess impact:**
   - Can it be fixed quickly (< 2 hours)?
   - Is it a blocker for other work?
   - Does it affect production?

3. **Rollback procedure:**

   ```bash
   # 1. Switch to backup branch
   git checkout backup/pre-restructure-20260204

   # 2. Create new branch from backup
   git checkout -b rollback/restructure-issues

   # 3. Force push to feature branch (if needed)
   git push origin rollback/restructure-issues --force

   # 4. Notify team
   ```

4. **Document issues:**
   - What went wrong?
   - Why did it happen?
   - How to prevent next time?

### Partial Rollback

If only one phase has issues:

- Revert commits for that phase
- Fix issues
- Re-run phase

---

## Success Criteria

### Phase Complete When:

- [ ] All checklist items completed
- [ ] All tests passing
- [ ] Build succeeds
- [ ] Documentation updated
- [ ] Code reviewed (if applicable)
- [ ] No regressions identified

### Project Complete When:

- [ ] All phases completed
- [ ] Full test suite passes
- [ ] All example apps work
- [ ] Shadcn installation tested and working
- [ ] Documentation complete and accurate
- [ ] Performance validated
- [ ] Team review completed
- [ ] Migration guide published
- [ ] PR approved and merged

---

## Timeline Estimate

| Phase                          | Estimated Time | Dependencies |
| ------------------------------ | -------------- | ------------ |
| Phase 1: Preparation           | 2-3 days       | None         |
| Phase 2: Core Reorganization   | 1-2 days       | Phase 1      |
| Phase 3: React Reorganization  | 3-4 days       | Phase 1, 2   |
| Phase 4: Import Transformation | 2-3 days       | Phase 3      |
| Phase 5: Shadcn Updates        | 2-3 days       | Phase 4      |
| Phase 6: Build & Testing       | 2-3 days       | Phase 5      |
| Phase 7: Documentation         | 1-2 days       | Phase 6      |
| Phase 8: Final Validation      | 1-2 days       | Phase 7      |
| **Total**                      | **14-22 days** | -            |

_Note: Timeline assumes one developer working full-time. Can be parallelized with careful coordination._

---

## Next Steps

1. **Review this plan** with the team
2. **Get approval** to proceed
3. **Create backup branch**
4. **Start Phase 1** - Preparation
5. **Daily standup** to track progress
6. **Document blockers** immediately

---

## Notes

- This is a living document - update as needed
- Mark checkboxes as completed
- Add notes for any deviations from plan
- Keep team informed of progress

---

**Last Updated:** February 4, 2026  
**Owner:** [Your Name]  
**Status:** Ready for Review
