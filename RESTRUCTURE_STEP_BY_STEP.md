# Restructure - Step by Step Guide

> **For:** Someone who wants to understand every single step  
> **Goal:** Reorganize folder structure for better Shadcn distribution

---

## What Are We Doing? (The Big Picture)

### The Problem (In Simple Terms)

Imagine you have a toolbox with tools scattered everywhere. When someone wants to borrow just a hammer, they end up taking the whole toolbox including stuff they don't need.

That's what's happening with our code:

- When developers download ONE component using Shadcn, they get extra files they don't need
- Files are in confusing locations
- Some files cause errors when downloaded alone

### The Solution

We're going to:

1. **Organize files into logical folders** (like organizing a closet)
2. **Remove unnecessary "index files"** (these cause the "whole toolbox" problem)
3. **Move some files to a different package** (styles and assets)
4. **Create a script** that automatically fixes import paths when we publish

---

## Before We Start: Understanding Key Concepts

### What is Shadcn?

Shadcn is a tool that lets developers download UI components directly into their project. Instead of installing a package, they get the actual source code files.

**Example:** Running `npx shadcn add button` downloads `button.tsx` into their project.

### What is an "index.ts" file?

An `index.ts` file is like a "table of contents" for a folder. It re-exports everything from that folder.

```typescript
// hooks/index.ts
export * from './use-theme';
export * from './use-translator';
export * from './use-toast';
```

**Problem:** When you import from the index, you load EVERYTHING even if you only need one thing.

### What is an "import"?

An import is how one file uses code from another file.

```typescript
// This is an import - getting the Button from another file
import { Button } from '@/components/ui/button';
```

### What is "@/" in imports?

The `@/` is a shortcut (called an "alias") that points to the `src/` folder.

```typescript
// These two are the same:
import { Button } from '@/components/ui/button';
import { Button } from '../../../components/ui/button'; // Ugly!
```

### What is "npm"?

npm is a package manager. When you run `npm install some-package`, it downloads code that someone else wrote.

### What's the difference between Shadcn and npm?

| Shadcn                                        | npm                              |
| --------------------------------------------- | -------------------------------- |
| Downloads source code files into YOUR project | Installs package in node_modules |
| You can edit the files                        | Files are read-only              |
| Files become part of your code                | Files stay separate              |

---

## Step 0: Setup (Before Any Code Changes)

### Step 0.1: Create a New Branch

**What is a branch?**  
A branch is like making a copy of your code to work on. If something goes wrong, the original is safe.

**Command to run:**

```bash
git checkout -b feat/restructure-component-architecture-UIC-323
```

**What this does:**

- `git checkout -b` = "create a new branch and switch to it"
- `feat/restructure-component-architecture-UIC-323` = the name of our branch

**How to verify it worked:**

```bash
git branch
```

You should see `* feat/restructure-component-architecture-UIC-323` (the \* means you're on this branch)

---

### Step 0.2: Create a Backup Branch

**Why?**  
In case everything goes wrong, we have a safe copy to go back to.

**Command to run:**

```bash
git branch backup/pre-restructure-20260204
```

**What this does:**  
Creates a branch called `backup/pre-restructure-20260204` that stays at the current state.

---

### Step 0.3: Make Sure Everything Works First

Before changing anything, let's verify the project is healthy.

**Command 1: Install dependencies**

```bash
pnpm install
```

**What this does:** Downloads all the packages the project needs.

**Command 2: Run tests**

```bash
pnpm test
```

**What this does:** Runs all the automated tests. We want to see "All tests passed."

**Command 3: Build the project**

```bash
pnpm build
```

**What this does:** Compiles all the code. We want to see no errors.

**If any of these fail:** STOP. Fix the issues before continuing.

---

## Step 1: Understand the Current Structure

### Step 1.1: Look at What We Have

Let's see the current folder structure in the react package.

**Command to run:**

```bash
ls packages/react/src/
```

**You'll see something like:**

```
__tests__/
assets/
blocks/
components/
hoc/
hooks/
internals/
lib/
providers/
rwa.ts
spa.ts
styles/
types/
```

**What each folder contains:**

| Folder        | What's Inside                             | Will it be in Shadcn?          |
| ------------- | ----------------------------------------- | ------------------------------ |
| `blocks/`     | Final components (like UserMFAManagement) | ✅ Yes (moving to components/) |
| `components/` | UI pieces used to build blocks            | ✅ Yes                         |
| `hooks/`      | React hooks (reusable logic)              | ✅ Yes                         |
| `lib/`        | Utility functions and constants           | ✅ Partially                   |
| `types/`      | TypeScript type definitions               | ❌ No (npm only)               |
| `providers/`  | Context providers                         | ❌ No (npm only)               |
| `hoc/`        | Higher-order components                   | ❌ No (npm only)               |
| `internals/`  | Test utilities                            | ❌ No (npm only)               |
| `assets/`     | Images, icons                             | ❌ No (moving to core)         |
| `styles/`     | CSS files                                 | ❌ No (moving to core)         |

---

### Step 1.2: Count the index.ts Files

Let's see how many index.ts files we have (we want to reduce these).

**Command to run:**

```bash
find packages/react/src -name "index.ts" | wc -l
```

**What this does:**

- `find packages/react/src -name "index.ts"` = find all files named index.ts
- `wc -l` = count the lines (each file is one line)

**Expected output:** Around 20+ files

**To see the actual files:**

```bash
find packages/react/src -name "index.ts"
```

---

## Step 2: Move Styles and Assets to Core Package

### Why Are We Doing This?

The `core` package is for shared utilities. Styles and assets are shared, so they belong there. Also, we don't want them distributed via Shadcn.

### Step 2.1: Check If Core Already Has These Folders

**Command to run:**

```bash
ls packages/core/src/
```

**What to look for:**  
Does it already have `assets/` and `styles/`?

If yes → we'll MERGE our files into them  
If no → we'll CREATE these folders

---

### Step 2.2: Look at What's in React's Assets Folder

**Command to run:**

```bash
ls -la packages/react/src/assets/
```

**What this shows:** All files and folders in the assets directory.

---

### Step 2.3: Look at What's in Core's Assets Folder

**Command to run:**

```bash
ls -la packages/core/src/assets/
```

**Compare the two:** Are there any files with the same name? If yes, we need to decide which to keep.

---

### Step 2.4: Move Assets from React to Core

**Command to run:**

```bash
# First, let's see what we're moving
ls packages/react/src/assets/

# Move the contents (not the folder itself)
mv packages/react/src/assets/* packages/core/src/assets/

# Remove the now-empty folder
rmdir packages/react/src/assets
```

**What this does:**

- Moves all files from react's assets to core's assets
- Removes the empty folder

**⚠️ If there are conflicts:** You'll need to manually decide which files to keep.

---

### Step 2.5: Move Styles from React to Core

**First, check if core has a styles folder:**

```bash
ls packages/core/src/styles/ 2>/dev/null || echo "Folder doesn't exist"
```

**If it doesn't exist, create it:**

```bash
mkdir -p packages/core/src/styles
```

**Move the styles:**

```bash
mv packages/react/src/styles/* packages/core/src/styles/
rmdir packages/react/src/styles
```

---

### Step 2.6: Verify the Move

**Check that files are in core:**

```bash
ls packages/core/src/assets/
ls packages/core/src/styles/
```

**Check that folders are gone from react:**

```bash
ls packages/react/src/assets/ 2>/dev/null || echo "Good! Folder removed"
ls packages/react/src/styles/ 2>/dev/null || echo "Good! Folder removed"
```

---

### Step 2.7: Commit This Change

**Why commit now?**  
Small, frequent commits make it easier to undo mistakes.

**Commands:**

```bash
git add .
git commit -m "chore(core): move assets and styles from react to core package"
```

---

## Step 3: Move Test Utilities

### Why?

The `internals/` folder contains test helpers. We're renaming it to `tests/utils/` for clarity.

### Step 3.1: Create the New Folder

**Command:**

```bash
mkdir -p packages/react/src/tests/utils
```

**What `-p` does:** Creates parent folders if they don't exist.

---

### Step 3.2: Move the Files

**Command:**

```bash
mv packages/react/src/internals/* packages/react/src/tests/utils/
```

---

### Step 3.3: Remove the Old Folder

**Command:**

```bash
rmdir packages/react/src/internals
```

**If this fails:** The folder might not be empty. Check with:

```bash
ls -la packages/react/src/internals/
```

---

### Step 3.4: Move Test Helpers (if they exist separately)

**Check if **tests**/utils exists:**

```bash
ls packages/react/src/__tests__/utils/ 2>/dev/null
```

**If it exists, move those files too:**

```bash
mv packages/react/src/__tests__/utils/* packages/react/src/tests/utils/
```

---

### Step 3.5: Commit This Change

```bash
git add .
git commit -m "chore(react): move internals to tests/utils"
```

---

## Step 4: Reorganize the Lib Folder

### What's in lib/?

```bash
ls packages/react/src/lib/
```

**You'll see:**

- `mfa-constants.ts` - Constants for MFA feature
- `theme-utils.ts` - Utility functions (like `cn()`)
- `my-organization/` - Organization-related utilities

### Step 4.1: Create New Folder Structure

**Commands:**

```bash
mkdir -p packages/react/src/lib/constants/my-account/mfa
mkdir -p packages/react/src/lib/utils/my-organization/domain-management
```

**This creates:**

```
lib/
├── constants/
│   └── my-account/
│       └── mfa/
└── utils/
    └── my-organization/
        └── domain-management/
```

---

### Step 4.2: Move MFA Constants

**Command:**

```bash
mv packages/react/src/lib/mfa-constants.ts \
   packages/react/src/lib/constants/my-account/mfa/mfa-constants.ts
```

**What `\` does:** Continues the command on the next line (for readability).

---

### Step 4.3: Move Domain Management Utils

**First, check what's in the file:**

```bash
ls packages/react/src/lib/my-organization/
```

**Move it:**

```bash
mv packages/react/src/lib/my-organization/domain-management.ts \
   packages/react/src/lib/utils/my-organization/domain-management/domain-management-utils.ts
```

---

### Step 4.4: Rename theme-utils.ts to utils.ts

**Command:**

```bash
mv packages/react/src/lib/theme-utils.ts \
   packages/react/src/lib/utils.ts
```

**Why?** This is the standard name in Shadcn projects.

---

### Step 4.5: Clean Up Empty Folders

```bash
# Remove empty my-organization folder if it's now empty
rmdir packages/react/src/lib/my-organization 2>/dev/null || true
```

---

### Step 4.6: Commit This Change

```bash
git add .
git commit -m "chore(react): reorganize lib folder structure"
```

---

## Step 5: Create New Component Structure

This is the big one! We're reorganizing how components are organized.

### Current Structure:

```
blocks/
  my-account/
    mfa/
      user-mfa-management.tsx
  my-organization/
    idp-management/
      sso-provider-edit.tsx
      ...
components/
  ui/
    button.tsx
    ...
  my-account/
    mfa/
      delete-factor-confirmation.tsx
      ...
  my-organization/
    ...
```

### Target Structure:

```
components/
  ui/
    button.tsx
    ...
  auth0/
    shared/
      wizard.tsx
      data-table.tsx
    my-account/
      user-mfa-management.tsx          ← Block (final component)
      shared/
        mfa/
          delete-factor-confirmation.tsx
          ...
    my-organization/
      sso-provider-edit.tsx            ← Block
      sso-provider-create.tsx          ← Block
      domain-table.tsx                 ← Block
      organization-details-edit.tsx    ← Block
      shared/
        idp-management/
        domain-management/
        ...
```

---

### Step 5.1: Create the New Folder Structure

**Commands:**

```bash
# Create auth0 folders
mkdir -p packages/react/src/components/auth0/shared
mkdir -p packages/react/src/components/auth0/my-account/shared/mfa
mkdir -p packages/react/src/components/auth0/my-organization/shared/idp-management
mkdir -p packages/react/src/components/auth0/my-organization/shared/domain-management
mkdir -p packages/react/src/components/auth0/my-organization/shared/organization-management
```

---

### Step 5.2: Move My Account Block (User MFA Management)

**This is a "block" - a final, complete component.**

**Command:**

```bash
mv packages/react/src/blocks/my-account/mfa/user-mfa-management.tsx \
   packages/react/src/components/auth0/my-account/user-mfa-management.tsx
```

**Notice:** The block goes directly in `my-account/`, NOT in a subfolder.

---

### Step 5.3: Move My Account Shared Components

**These are helper components used to build the block.**

**Command:**

```bash
mv packages/react/src/components/my-account/mfa/* \
   packages/react/src/components/auth0/my-account/shared/mfa/
```

---

### Step 5.4: Move My Organization Blocks

**Move each block file to the domain root:**

```bash
# SSO Provider Edit
mv packages/react/src/blocks/my-organization/idp-management/sso-provider-edit.tsx \
   packages/react/src/components/auth0/my-organization/sso-provider-edit.tsx

# SSO Provider Create
mv packages/react/src/blocks/my-organization/idp-management/sso-provider-create.tsx \
   packages/react/src/components/auth0/my-organization/sso-provider-create.tsx

# SSO Provider Table
mv packages/react/src/blocks/my-organization/idp-management/sso-provider-table.tsx \
   packages/react/src/components/auth0/my-organization/sso-provider-table.tsx

# Domain Table
mv packages/react/src/blocks/my-organization/domain-management/domain-table.tsx \
   packages/react/src/components/auth0/my-organization/domain-table.tsx

# Organization Details Edit
mv packages/react/src/blocks/my-organization/organization-management/organization-details-edit.tsx \
   packages/react/src/components/auth0/my-organization/organization-details-edit.tsx
```

---

### Step 5.5: Move My Organization Shared Components

```bash
# Move IDP management shared components
mv packages/react/src/components/my-organization/idp-management/* \
   packages/react/src/components/auth0/my-organization/shared/idp-management/

# Move domain management shared components
mv packages/react/src/components/my-organization/domain-management/* \
   packages/react/src/components/auth0/my-organization/shared/domain-management/

# Move organization management shared components
mv packages/react/src/components/my-organization/organization-management/* \
   packages/react/src/components/auth0/my-organization/shared/organization-management/
```

---

### Step 5.6: Clean Up Old Folders

```bash
# Remove empty blocks folders
rm -rf packages/react/src/blocks/

# Remove old component folders (be careful here!)
rm -rf packages/react/src/components/my-account/
rm -rf packages/react/src/components/my-organization/
```

**⚠️ Warning:** Only run these if you've successfully moved all files!

---

### Step 5.7: Verify the New Structure

```bash
# See the new structure
find packages/react/src/components/auth0 -type f -name "*.tsx" | head -20
```

---

### Step 5.8: Commit This Change

```bash
git add .
git commit -m "feat(react): reorganize components to domain-driven structure"
```

---

## Step 6: Reorganize Hooks

### Step 6.1: Create New Hook Folders

```bash
mkdir -p packages/react/src/hooks/shared
```

---

### Step 6.2: Move Shared Hooks

**These are hooks used across multiple domains:**

```bash
mv packages/react/src/hooks/use-theme.ts packages/react/src/hooks/shared/
mv packages/react/src/hooks/use-translator.ts packages/react/src/hooks/shared/
mv packages/react/src/hooks/use-core-client.ts packages/react/src/hooks/shared/
mv packages/react/src/hooks/use-core-client-initialization.ts packages/react/src/hooks/shared/
mv packages/react/src/hooks/use-error-handler.ts packages/react/src/hooks/shared/
mv packages/react/src/hooks/use-scope-manager.ts packages/react/src/hooks/shared/
mv packages/react/src/hooks/use-toast-provider.ts packages/react/src/hooks/shared/
```

---

### Step 6.3: Commit This Change

```bash
git add .
git commit -m "chore(react): reorganize hooks into domain folders"
```

---

## Step 7: Remove Unnecessary Index Files

### Why?

Index files (barrel exports) cause:

1. Larger bundle sizes (importing everything when you need one thing)
2. Broken imports when downloading single components via Shadcn

### Step 7.1: List All Index Files

```bash
find packages/react/src -name "index.ts" -type f
```

---

### Step 7.2: Decide Which to Keep

**KEEP these 3:**

- `packages/react/src/components/index.ts`
- `packages/react/src/hooks/index.ts`
- `packages/react/src/types/index.ts`

**DELETE all others in the react package.**

---

### Step 7.3: Delete the Unnecessary Ones

**⚠️ First, let's be safe and see what we're deleting:**

```bash
find packages/react/src -name "index.ts" -type f | grep -v "^packages/react/src/components/index.ts$" | grep -v "^packages/react/src/hooks/index.ts$" | grep -v "^packages/react/src/types/index.ts$"
```

**If the list looks correct, delete them:**

```bash
# Delete hooks subdirectory index files
rm -f packages/react/src/hooks/my-organization/index.ts
rm -f packages/react/src/hooks/my-organization/organization-management/index.ts
rm -f packages/react/src/hooks/my-account/index.ts
rm -f packages/react/src/hooks/my-account/mfa/index.ts

# Delete lib index files
rm -f packages/react/src/lib/my-organization/index.ts

# Delete component subdirectory index files
find packages/react/src/components -path "*/components/index.ts" -prune -o -name "index.ts" -type f -print | xargs rm -f

# Delete blocks index if it still exists
rm -f packages/react/src/blocks/index.ts
```

---

### Step 7.4: Update the Kept Index Files

Now we need to update the 3 index files we kept.

**Edit `packages/react/src/components/index.ts`:**

```typescript
// Export only blocks (final components)

// My Account
export { UserMFAManagement } from './auth0/my-account/user-mfa-management';

// My Organization
export { SsoProviderEdit } from './auth0/my-organization/sso-provider-edit';
export { SsoProviderCreate } from './auth0/my-organization/sso-provider-create';
export { SsoProviderTable } from './auth0/my-organization/sso-provider-table';
export { DomainTable } from './auth0/my-organization/domain-table';
export { OrganizationDetailsEdit } from './auth0/my-organization/organization-details-edit';
```

**Edit `packages/react/src/hooks/index.ts`:**

```typescript
// Export only user-facing hooks
export { useTheme } from './shared/use-theme';
export { useTranslator } from './shared/use-translator';
export { useCoreClient } from './shared/use-core-client';
```

---

### Step 7.5: Commit This Change

```bash
git add .
git commit -m "chore(react): remove barrel imports, keep only 3 index files"
```

---

## Step 8: Fix All Import Paths

This is the most tedious step. Every file that imports from a moved location needs to be updated.

### What Needs to Change?

| Old Import                         | New Import                                      |
| ---------------------------------- | ----------------------------------------------- |
| `@/blocks/my-account/...`          | `@/components/auth0/my-account/...`             |
| `@/blocks/my-organization/...`     | `@/components/auth0/my-organization/...`        |
| `@/components/my-account/...`      | `@/components/auth0/my-account/shared/...`      |
| `@/components/my-organization/...` | `@/components/auth0/my-organization/shared/...` |
| `@/hooks/use-theme`                | `@/hooks/shared/use-theme`                      |
| `@/lib/theme-utils`                | `@/lib/utils`                                   |
| `@/lib/mfa-constants`              | `@/lib/constants/my-account/mfa/mfa-constants`  |
| `@/internals/...`                  | `@/tests/utils/...`                             |
| `@/assets/...`                     | `@auth0/universal-components-core/assets/...`   |
| `@/styles/...`                     | `@auth0/universal-components-core/styles/...`   |

### Step 8.1: Find Files That Need Updating

**Find files importing from old locations:**

```bash
# Find imports from @/blocks
grep -r "@/blocks" packages/react/src/ --include="*.ts" --include="*.tsx" -l

# Find imports from old component paths
grep -r "@/components/my-account" packages/react/src/ --include="*.ts" --include="*.tsx" -l
grep -r "@/components/my-organization" packages/react/src/ --include="*.ts" --include="*.tsx" -l

# Find imports from old hook paths
grep -r "from '@/hooks/use-" packages/react/src/ --include="*.ts" --include="*.tsx" -l

# Find imports from internals
grep -r "@/internals" packages/react/src/ --include="*.ts" --include="*.tsx" -l
```

### Step 8.2: Use Search and Replace

**Option A: Use VS Code**

1. Press `Cmd+Shift+H` (Mac) or `Ctrl+Shift+H` (Windows)
2. Enable regex mode (click `.*` button)
3. Search: `@/blocks/`
4. Replace: `@/components/auth0/`
5. Click "Replace All"

Repeat for each pattern.

**Option B: Use sed (command line)**

```bash
# Replace blocks imports
find packages/react/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/blocks/|@/components/auth0/|g' {} +

# Replace old component imports
find packages/react/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/my-account/|@/components/auth0/my-account/shared/|g' {} +
find packages/react/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/components/my-organization/|@/components/auth0/my-organization/shared/|g' {} +

# Replace internals imports
find packages/react/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's|@/internals/|@/tests/utils/|g' {} +
```

---

### Step 8.3: Fix Hook Imports

```bash
# Replace shared hook imports
find packages/react/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|from '@/hooks/use-theme'|from '@/hooks/shared/use-theme'|g" {} +
find packages/react/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|from '@/hooks/use-translator'|from '@/hooks/shared/use-translator'|g" {} +
find packages/react/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|from '@/hooks/use-core-client'|from '@/hooks/shared/use-core-client'|g" {} +
```

---

### Step 8.4: Fix Lib Imports

```bash
# Replace theme-utils with utils
find packages/react/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|@/lib/theme-utils|@/lib/utils|g" {} +

# Replace mfa-constants
find packages/react/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|@/lib/mfa-constants|@/lib/constants/my-account/mfa/mfa-constants|g" {} +
```

---

### Step 8.5: Verify No Broken Imports

**Run TypeScript compiler to check for errors:**

```bash
cd packages/react
pnpm tsc --noEmit
```

**What this does:** Checks all TypeScript files for errors WITHOUT building.

**If there are errors:** Fix them one by one. The error messages will tell you which file and line has the problem.

---

### Step 8.6: Commit This Change

```bash
git add .
git commit -m "refactor(react): update all import paths to new structure"
```

---

## Step 9: Update Core Package Exports

Since we moved styles and assets to core, we need to export them.

### Step 9.1: Update Core's index.ts

**Open `packages/core/src/index.ts` and add:**

```typescript
// Add these exports
export * from './assets';
export * from './styles';
```

---

### Step 9.2: Update Core's package.json Exports

**Open `packages/core/package.json` and update the exports field:**

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./assets/*": {
      "types": "./dist/assets/*.d.ts",
      "import": "./dist/assets/*.js"
    },
    "./styles/*": {
      "types": "./dist/styles/*.d.ts",
      "import": "./dist/styles/*.js"
    }
  }
}
```

---

### Step 9.3: Commit This Change

```bash
git add .
git commit -m "feat(core): export assets and styles from core package"
```

---

## Step 10: Build and Test

### Step 10.1: Build All Packages

```bash
pnpm build
```

**What to look for:** No errors. If there are errors, read them carefully and fix.

---

### Step 10.2: Run All Tests

```bash
pnpm test
```

**What to look for:** All tests pass. If tests fail, the error message will tell you what's wrong.

---

### Step 10.3: Run Linter

```bash
pnpm lint
```

**What to look for:** No errors. Warnings are okay but should be reviewed.

---

### Step 10.4: Commit Any Fixes

```bash
git add .
git commit -m "fix(react): resolve build and test issues after restructure"
```

---

## Step 11: Update Shadcn Registry

The `registry.json` file tells Shadcn which files to download for each component.

### Step 11.1: Open registry.json

```bash
code packages/react/registry.json
```

---

### Step 11.2: Update File Paths

Every path needs to be updated to match the new structure.

**Before:**

```json
{
  "path": "src/blocks/my-account/mfa/user-mfa-management.tsx",
  "target": "auth0-ui-components/blocks/my-account/mfa/user-mfa-management.tsx"
}
```

**After:**

```json
{
  "path": "src/components/auth0/my-account/user-mfa-management.tsx",
  "target": "components/auth0/my-account/user-mfa-management.tsx"
}
```

---

### Step 11.3: Add @auth0/universal-components-core as Dependency

For each component in registry.json, add to the dependencies array:

```json
{
  "name": "my-account/user-mfa-management",
  "dependencies": ["@auth0/universal-components-core"]
}
```

---

### Step 11.4: Commit This Change

```bash
git add .
git commit -m "feat(react): update registry.json with new file paths"
```

---

## Step 12: Create Import Transformer Script

When we build the Shadcn registry, we need to transform some imports.

### What Gets Transformed?

| In Source Code    | In Shadcn Output                                  |
| ----------------- | ------------------------------------------------- |
| `@/types/...`     | `@auth0/universal-components-react/types/...`     |
| `@/providers/...` | `@auth0/universal-components-react/providers/...` |
| `@/hoc/...`       | `@auth0/universal-components-react/hoc/...`       |

### Step 12.1: Create the Script File

```bash
mkdir -p packages/react/scripts
touch packages/react/scripts/transform-imports.ts
```

### Step 12.2: Write the Script

**Open the file and add:**

```typescript
/**
 * Transform imports for Shadcn registry generation
 *
 * This script changes @/ imports for types, providers, and hoc
 * to use the npm package instead.
 */

const NPM_PATTERNS = [
  { from: /@\/types\//g, to: '@auth0/universal-components-react/types/' },
  { from: /@\/providers\//g, to: '@auth0/universal-components-react/providers/' },
  { from: /@\/hoc\//g, to: '@auth0/universal-components-react/hoc/' },
  { from: /@\/lib\/utils(['"])/g, to: '@auth0/universal-components-react/lib/utils$1' },
];

export function transformImports(content: string): string {
  let result = content;

  for (const pattern of NPM_PATTERNS) {
    result = result.replace(pattern.from, pattern.to);
  }

  return result;
}
```

---

### Step 12.3: Commit This Change

```bash
git add .
git commit -m "feat(react): add import transformer for Shadcn registry"
```

---

## Step 13: Final Verification

### Step 13.1: Run Everything One More Time

```bash
pnpm format:check
pnpm lint
pnpm test
pnpm build
```

**All should pass with no errors.**

---

### Step 13.2: Test Shadcn Registry

```bash
pnpm build:shadcn
```

---

### Step 13.3: Verify New Structure

```bash
# Check components structure
tree packages/react/src/components/auth0 -L 3

# Check hooks structure
tree packages/react/src/hooks -L 2

# Check only 3 index files remain
find packages/react/src -name "index.ts" -type f
```

---

### Step 13.4: Push to Remote

```bash
git push origin feat/restructure-component-architecture-UIC-323
```

---

## Summary: All Commits Made

1. `chore(core): move assets and styles from react to core package`
2. `chore(react): move internals to tests/utils`
3. `chore(react): reorganize lib folder structure`
4. `feat(react): reorganize components to domain-driven structure`
5. `chore(react): reorganize hooks into domain folders`
6. `chore(react): remove barrel imports, keep only 3 index files`
7. `refactor(react): update all import paths to new structure`
8. `feat(core): export assets and styles from core package`
9. `fix(react): resolve build and test issues after restructure`
10. `feat(react): update registry.json with new file paths`
11. `feat(react): add import transformer for Shadcn registry`

---

## Troubleshooting

### "File not found" errors after moving files

**Cause:** Imports still pointing to old locations.  
**Fix:** Search for the old path and update it.

```bash
grep -r "OLD_PATH" packages/react/src/
```

### TypeScript errors after changes

**Cause:** Missing or incorrect imports.  
**Fix:** Run `pnpm tsc --noEmit` to see all errors, then fix one by one.

### Tests fail

**Cause:** Test files also have old imports.  
**Fix:** Don't forget to update imports in `__tests__` folders too!

### Build fails

**Cause:** Could be many things.  
**Fix:** Read the error message carefully. It usually tells you exactly what's wrong.

---

## Need Help?

If you get stuck on any step:

1. **Read the error message** - It usually tells you what's wrong
2. **Check git status** - `git status` shows what's changed
3. **Undo changes** - `git checkout -- .` undoes all uncommitted changes
4. **Go back to last commit** - `git reset --hard HEAD` undoes everything since last commit
5. **Ask for help** - Share the error message with the team

---

**You've got this! Take it one step at a time.** 🚀
