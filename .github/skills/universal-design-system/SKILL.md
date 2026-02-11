## Guidelines for Contributing

1. **Follow the variant pattern**: Every new component needs at minimum a `default/` variant with `index.tsx` and `registry.json`.
2. **Use CVA for variants**: Leverage `class-variance-authority` for component variant styling.
3. **Use `cn()` for class merging**: Always merge classes with the `cn()` utility from `@/lib/utils`.
4. **Semantic tokens only**: Never hardcode colors — use CSS custom properties.
5. **Accessibility first**: Include ARIA attributes, keyboard nav, and screen reader support.
6. **`"use client"` directive**: Add to any component with interactivity or state.
7. **OKLCH colors**: Use `oklch()` color format for all theme values.
8. **Tailwind CSS**: All styling is done via Tailwind utility classes.

---

## Creating a New Component (Step-by-Step)

### 1. Create the Component Folder Structure

```bash
# Create component directory with all variant folders
mkdir -p apps/docs/src/registry/ui/<component-name>/{default,radix-ui,base-ui,headless-ui}
```

### 2. Create the Default Variant (`default/index.tsx`)

```tsx
"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const componentVariants = cva(
  // Base classes that apply to all variants
  "inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        // Add more variants as needed
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-sm",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ComponentNameProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {}

function ComponentName({ className, variant, size, ...props }: ComponentNameProps) {
  return (
    <div
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { ComponentName, componentVariants };
```

### 3. Create the Registry JSON (`default/registry.json`)

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "<component-name>",
  "type": "registry:ui",
  "title": "Component Name",
  "description": "A brief description of what the component does.",
  "dependencies": [],
  "devDependencies": [],
  "registryDependencies": [],
  "files": [
    {
      "path": "registry/ui/<component-name>/default/index.tsx",
      "type": "registry:ui",
      "target": "components/ui/<component-name>.tsx"
    }
  ],
  "tailwind": {},
  "cssVars": {
    "light": {},
    "dark": {}
  },
  "meta": {
    "variant": "default"
  }
}
```

### 4. Create the Index Re-export (`index.ts`)

```ts
// apps/docs/src/registry/ui/<component-name>/index.ts
export * from "./default";
// Uncomment as variants are implemented:
// export * as RadixUI from "./radix-ui";
// export * as BaseUI from "./base-ui";
// export * as HeadlessUI from "./headless-ui";
```

### 5. Add to UI Registry

Update `apps/docs/src/lib/registry/ui-registry.ts`:

```ts
{
  name: "<component-name>",
  type: "registry:ui",
  files: [
    { path: "registry/ui/<component-name>/default/index.tsx", type: "registry:ui" },
  ],
},
```

### 6. Create Documentation Page

Create `apps/docs/src/app/(app)/docs/components/<component-name>/page.mdx`:

```mdx
---
title: Component Name
description: A brief description of the component.
---

<ComponentPreview name="<component-name>-demo" />

## Installation

<Tabs defaultValue="cli">
<TabsList>
  <TabsTrigger value="cli">CLI</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">
\`\`\`bash
npx shadcn@latest add https://universal-design.vercel.app/r/ui/<component-name>/default/registry.json
\`\`\`
</TabsContent>
</Tabs>

## Usage

\`\`\`tsx
import { ComponentName } from "@/components/ui/<component-name>";

export default function Example() {
  return <ComponentName>Content</ComponentName>;
}
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | "default" \| "secondary" | "default" | Visual style variant |
| size | "default" \| "sm" \| "lg" | "default" | Size of the component |
```

### 7. Create Example Component

Create `apps/docs/src/registry/examples/<component-name>-demo.tsx`:

```tsx
import { ComponentName } from "@/registry/ui/<component-name>";

export default function ComponentNameDemo() {
  return (
    <ComponentName>
      Example content
    </ComponentName>
  );
}
```

---

## Consuming Components

### Prerequisites

Before consuming components, ensure your project has the following setup:

```bash
# Required dependencies
pnpm add class-variance-authority clsx tailwind-merge

# Create the cn utility in your project
# @/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Installation Methods

#### CLI Installation (Recommended)

Use the shadcn CLI to install components directly from the registry:

```bash
# Install default variant
npx shadcn@latest add https://universal-design.vercel.app/r/ui/<component-name>/default/registry.json

# Install a specific library variant
npx shadcn@latest add https://universal-design.vercel.app/r/ui/<component-name>/radix-ui/registry.json
npx shadcn@latest add https://universal-design.vercel.app/r/ui/<component-name>/base-ui/registry.json
npx shadcn@latest add https://universal-design.vercel.app/r/ui/<component-name>/headless-ui/registry.json
```

The CLI will:
- Download the component to `components/ui/<component-name>.tsx`
- Install required dependencies automatically
- Prompt for any registry dependencies (other components this one needs)

#### Manual Installation

1. Copy the component source from the registry
2. Place it in your `components/ui/` directory
3. Install dependencies listed in `registry.json`

```bash
# Example: manually installing button dependencies
pnpm add @radix-ui/react-slot class-variance-authority
```

### Project Configuration

#### Tailwind CSS Setup

Ensure your `tailwind.config.ts` includes the component paths:

```ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",  // Include UI components
  ],
  theme: {
    extend: {
      colors: {
        // Map CSS variables to Tailwind
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
          foreground: "var(--color-destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-foreground)",
        },
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

#### CSS Variables Setup

Add the required CSS variables to your global stylesheet:

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-background: oklch(100% 0 0);
    --color-foreground: oklch(26.1% 0.0079 84.59);
    --color-primary: oklch(26.1% 0.0079 84.59);
    --color-primary-foreground: oklch(100% 0 0);
    --color-secondary: oklch(96.08% 0.0021 84.59);
    --color-secondary-foreground: oklch(26.1% 0.0079 84.59);
    --color-muted: oklch(96.08% 0.0021 84.59);
    --color-muted-foreground: oklch(55.19% 0.0146 84.59);
    --color-accent: oklch(96.08% 0.0021 84.59);
    --color-accent-foreground: oklch(26.1% 0.0079 84.59);
    --color-destructive: oklch(57.71% 0.215 27.33);
    --color-destructive-foreground: oklch(100% 0 0);
    --color-border: oklch(91.97% 0.0042 84.59);
    --color-input: oklch(91.97% 0.0042 84.59);
    --color-ring: oklch(26.1% 0.0079 84.59);
    --radius: 0.5rem;
  }

  .dark {
    --color-background: oklch(14.08% 0.0047 84.59);
    --color-foreground: oklch(96.83% 0.0021 84.59);
    --color-primary: oklch(96.83% 0.0021 84.59);
    --color-primary-foreground: oklch(26.1% 0.0079 84.59);
    --color-secondary: oklch(21.69% 0.0063 84.59);
    --color-secondary-foreground: oklch(96.83% 0.0021 84.59);
    --color-muted: oklch(21.69% 0.0063 84.59);
    --color-muted-foreground: oklch(70.66% 0.0097 84.59);
    --color-accent: oklch(21.69% 0.0063 84.59);
    --color-accent-foreground: oklch(96.83% 0.0021 84.59);
    --color-destructive: oklch(57.71% 0.215 27.33);
    --color-destructive-foreground: oklch(100% 0 0);
    --color-border: oklch(21.69% 0.0063 84.59);
    --color-input: oklch(21.69% 0.0063 84.59);
    --color-ring: oklch(84.15% 0.0077 84.59);
  }
}
```

### Usage Patterns

#### Basic Import and Usage

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function MyComponent() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <Input placeholder="Enter your name" />
      </DialogContent>
    </Dialog>
  );
}
```

#### Using Variant Props

```tsx
import { Button } from "@/components/ui/button";

export function ButtonExamples() {
  return (
    <div className="flex gap-4">
      {/* Variant styles */}
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>

      {/* Size variants */}
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">🔔</Button>
    </div>
  );
}
```

#### Extending Component Styles

Use the `className` prop to add or override styles:

```tsx
import { Button } from "@/components/ui/button";

// Add additional classes
<Button className="w-full mt-4">Full Width Button</Button>

// Override specific styles
<Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
  Gradient Button
</Button>
```

#### Using the Variants Function Directly

Access the CVA variants function for custom compositions:

```tsx
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

// Apply button styles to other elements
<Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
  Dashboard
</Link>

// Combine with custom classes
<a className={buttonVariants({ variant: "ghost", size: "sm", className: "text-muted-foreground" })}>
  Learn more
</a>
```

### Customizing Consumed Components

#### Modifying After Installation

Once installed, components are yours to modify. Common customizations:

```tsx
// components/ui/button.tsx - after installation

const buttonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        // Modify existing variants
        default: "bg-brand text-brand-foreground hover:bg-brand/90",
        // Add new variants
        gradient: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white",
      },
      size: {
        // Add custom sizes
        xs: "h-7 px-2 text-xs",
        "2xl": "h-14 px-8 text-xl",
      },
    },
  }
);
```

#### Creating Wrapper Components

Extend functionality without modifying the source:

```tsx
// components/ui/loading-button.tsx
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

export function LoadingButton({ loading, children, disabled, ...props }: LoadingButtonProps) {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
```

### Updating Components

To update a component to the latest version:

```bash
# Re-run the add command (will prompt to overwrite)
npx shadcn@latest add https://universal-design.vercel.app/r/ui/button/default/registry.json

# Or use the diff command to see changes
npx shadcn@latest diff https://universal-design.vercel.app/r/ui/button/default/registry.json
```

**Note**: If you've customized a component, re-running the add command will overwrite your changes. Consider:
- Keeping customizations in wrapper components
- Using git to track and merge updates manually
- Documenting your customizations for easy re-application

### Choosing Between Variants

| Variant | Best For | Trade-offs |
|---------|----------|------------|
| **default** | Simple projects, minimal dependencies | Limited interactivity patterns |
| **radix-ui** | Production apps, complex interactions | Larger bundle size, more dependencies |
| **base-ui** | Unstyled flexibility, full control | More styling work required |
| **headless-ui** | Tailwind-first projects | Tied to Tailwind ecosystem |

### Troubleshooting Consumption

| Issue | Solution |
|-------|----------|
| `Cannot find module '@/components/ui/button'` | Check tsconfig.json paths alias points to components folder |
| Styles not applying | Ensure Tailwind config includes components path |
| CSS variables undefined | Add the CSS variables to your global stylesheet |
| Type errors after install | Run `pnpm add -D @types/react` if types are missing |
| Dark mode not working | Add `dark` class toggle to your theme provider |

---

## Adding a Library Variant (Radix/Base/Headless)

### Radix UI Variant Pattern

```tsx
"use client";

import * as React from "react";
import * as RadixPrimitive from "@radix-ui/react-<primitive>";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const componentVariants = cva("...", { variants: { ... } });

const ComponentName = React.forwardRef<
  React.ElementRef<typeof RadixPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadixPrimitive.Root> &
    VariantProps<typeof componentVariants>
>(({ className, variant, ...props }, ref) => (
  <RadixPrimitive.Root
    ref={ref}
    className={cn(componentVariants({ variant }), className)}
    {...props}
  />
));
ComponentName.displayName = RadixPrimitive.Root.displayName;

export { ComponentName };
```

### Base UI Variant Pattern

```tsx
"use client";

import * as React from "react";
import { Component as BaseComponent } from "@base-ui-components/react/<component>";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const componentVariants = cva("...", { variants: { ... } });

function ComponentName({ className, variant, ...props }: ComponentNameProps) {
  return (
    <BaseComponent
      className={cn(componentVariants({ variant }), className)}
      {...props}
    />
  );
}

export { ComponentName };
```

### Headless UI Variant Pattern

```tsx
"use client";

import * as React from "react";
import { Component as HeadlessComponent } from "@headlessui/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const componentVariants = cva("...", { variants: { ... } });

function ComponentName({ className, variant, ...props }: ComponentNameProps) {
  return (
    <HeadlessComponent
      className={cn(componentVariants({ variant }), className)}
      {...props}
    />
  );
}

export { ComponentName };
```

---

## Registry JSON Reference

### Complete Schema

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "component-name",
  "type": "registry:ui",
  "title": "Human Readable Title",
  "description": "What the component does",
  "author": "Auth0 <support@auth0.com>",
  "dependencies": ["@radix-ui/react-dialog"],
  "devDependencies": [],
  "registryDependencies": ["button", "input"],
  "files": [
    {
      "path": "registry/ui/component/variant/index.tsx",
      "type": "registry:ui",
      "target": "components/ui/component.tsx"
    }
  ],
  "tailwind": {
    "config": {
      "theme": {
        "extend": {}
      }
    }
  },
  "cssVars": {
    "light": {
      "--custom-var": "value"
    },
    "dark": {
      "--custom-var": "dark-value"
    }
  },
  "meta": {
    "variant": "radix-ui"
  }
}
```

### Common Dependencies by Library

| Library | Common Dependencies |
|---------|---------------------|
| Radix UI | `@radix-ui/react-*`, `@radix-ui/react-slot` |
| Base UI | `@base-ui-components/react` |
| Headless UI | `@headlessui/react` |
| All | `class-variance-authority`, `clsx`, `tailwind-merge` |

---

## Theming Deep Dive

### CSS Variable Structure

Theme variables are defined in `apps/docs/src/styles/themes/`:

```css
/* Light mode */
:root {
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(26.1% 0.0079 84.59);
  --color-primary: oklch(26.1% 0.0079 84.59);
  --color-primary-foreground: oklch(100% 0 0);
  /* ... */
}

/* Dark mode */
.dark {
  --color-background: oklch(14.08% 0.0047 84.59);
  --color-foreground: oklch(96.83% 0.0021 84.59);
  /* ... */
}
```

### Shadow Tokens

```css
/* Bevel shadows (for raised elements) */
--shadow-bevel-xs: 0 1px 2px 0 oklch(0% 0 0 / 0.05);
--shadow-bevel-sm: 0 1px 3px 0 oklch(0% 0 0 / 0.1);
--shadow-bevel-md: 0 4px 6px -1px oklch(0% 0 0 / 0.1);

/* Component-specific shadows */
--shadow-button-default: inset 0 1px 0 0 oklch(100% 0 0 / 0.1);
--shadow-input-focus: 0 0 0 3px oklch(26.1% 0.0079 84.59 / 0.2);
```

### Adding Theme-Specific Styles

Use the `theme-default:` Tailwind prefix:

```tsx
<button className="
  bg-primary
  theme-default:shadow-button-default
  theme-default:active:scale-[0.99]
">
```

---

## Common Patterns & Best Practices

### DO ✅

- **Export both component and variants**: `export { Button, buttonVariants }`
- **Use `forwardRef` for Radix components**: Enables ref forwarding
- **Include `displayName`**: Helps with React DevTools debugging
- **Use semantic class names**: `cn("button", buttonVariants(...))`
- **Support `asChild` prop for Radix**: Allows composition with Slot

### DON'T ❌

- **Hardcode colors**: Use `bg-primary` not `bg-black`
- **Skip accessibility**: Always include ARIA attributes
- **Import from wrong paths**: Use `@/lib/utils` not relative paths
- **Mix styling approaches**: Stick to Tailwind + CVA
- **Forget dark mode**: Test both light and dark themes

### Accessibility Checklist

```tsx
// Interactive elements
<button
  aria-label="Close dialog"           // Descriptive label
  aria-expanded={isOpen}              // State indication
  aria-controls="dialog-content"      // Associated content
  aria-disabled={disabled}            // Disabled state
/>

// Form elements
<input
  aria-invalid={hasError}             // Validation state
  aria-describedby="error-message"    // Error association
  aria-required={required}            // Required indication
/>

// Dialog/Modal
<dialog
  role="dialog"                       // Semantic role
  aria-modal="true"                   // Modal behavior
  aria-labelledby="dialog-title"      // Title association
/>
```

---

## Testing Guidelines

### Running Tests

```bash
pnpm test                    # Run all tests
pnpm test --watch            # Watch mode
pnpm test <component>        # Test specific component
```

### Component Test Structure

```tsx
// apps/docs/src/__tests__/components/button.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/registry/ui/button";

describe("Button", () => {
  it("renders with default variant", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-destructive");
  });

  it("handles click events", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is accessible", () => {
    render(<Button aria-label="Submit form">Submit</Button>);
    expect(screen.getByLabelText("Submit form")).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `cn is not defined` | Import from `@/lib/utils` |
| `Module not found: @radix-ui/*` | Run `pnpm install` |
| Styles not applying | Check Tailwind config includes registry path |
| Dark mode not working | Ensure `.dark` class on `<html>` or `<body>` |
| Registry not updating | Run `pnpm build:registry` |
| TypeScript errors | Run `pnpm typecheck` to see all issues |

### Build Errors

```bash
# Clear all caches and rebuild
pnpm clean && pnpm install && pnpm build

# Regenerate registry
pnpm build:registry
```

---

## Git Conventions

### Branch Naming

```
feature/<component-name>      # New component
fix/<issue-description>       # Bug fixes
docs/<topic>                  # Documentation updates
refactor/<scope>              # Code refactoring
```

### Commit Messages

```
feat(button): add icon-only size variant
fix(dialog): correct aria-modal attribute
docs(readme): update installation instructions
refactor(utils): simplify cn function
chore(deps): update radix-ui packages
```

### PR Checklist

- [ ] Component works in all variants (default, radix-ui, base-ui, headless-ui)
- [ ] Accessibility tested (keyboard nav, screen reader)
- [ ] Light and dark mode tested
- [ ] registry.json is valid and complete
- [ ] Documentation page created
- [ ] Example component created
- [ ] TypeScript types exported
- [ ] No hardcoded colors or values