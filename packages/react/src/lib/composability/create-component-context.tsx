/**
 * Factory for a typed compound-component context plus a guard hook.
 *
 * Each composable block component (SsoProviderTable, DomainTable, ...) creates
 * one context that shares its model/props from the `Root` boundary down to the
 * compound sub-components (`Header`, `Content`, `CreateAction`, ...).
 *
 * The factory also returns a small dev-tooling bundle (`parts`) for warning,
 * in development only, when a host composes `Root` but omits a part the
 * component needs to render (e.g. `Content`). See {@link createComponentContext}.
 *
 * @module create-component-context
 * @internal
 */

import * as React from 'react';

/** Registry shared from a `Root`'s {@link CompoundParts.Boundary} to its parts. */
interface PartRegistry {
  /** Marks a part present; returns a cleanup that removes it on unmount. */
  register: (partName: string) => () => void;
}

/** Dev-tooling for the missing-required-part warning, returned by the factory. */
export interface CompoundParts {
  /**
   * Provider that `Root` wraps its children in. Tracks which required parts
   * mounted and, in development only, warns after mount for any that are
   * missing. A passthrough (no warning) in production builds.
   */
  Boundary: React.FC<{ children?: React.ReactNode }>;
  /**
   * Marks a compound part present for the missing-required-part check. Call
   * once, unconditionally, inside a required part (e.g. `Content`).
   * @param partName - The part's short name (e.g. `'Content'`), matched against
   *   the `requiredParts` passed to {@link createComponentContext}.
   */
  useRegisterPart: (partName: string) => void;
}

/** Options for {@link createComponentContext}. */
export interface CreateComponentContextOptions {
  /**
   * Parts a host must render inside `Root` for the component to work (e.g.
   * `['Content']`). A dev-only warning fires when one never mounts. Omit for
   * components with no strictly-required part.
   */
  requiredParts?: readonly string[];
}

/**
 * Creates a context + guard hook pair for a compound component, plus dev tooling
 * for the missing-required-part warning.
 *
 * @template T - Shape of the context value shared by the compound parts.
 * @param displayName - Component display name, used for the context label, the
 *   error thrown when a part is rendered outside its `Root`, and the missing-part
 *   warning copy.
 * @param options - See {@link CreateComponentContextOptions}.
 * @returns A tuple `[Context, useContext, parts]`. The hook throws a descriptive
 *   error when a compound part is rendered outside `<${displayName}.Root>`.
 *   `parts` ({@link CompoundParts}) carries the dev-only missing-part tooling.
 */
export function createComponentContext<T>(
  displayName: string,
  options?: CreateComponentContextOptions,
) {
  const Context = React.createContext<T | null>(null);
  Context.displayName = `${displayName}Context`;

  const requiredParts = options?.requiredParts ?? [];

  // Internal registry context: `Boundary` (rendered by `Root`) provides a
  // `register` callback; required parts call it from an effect so `Boundary`
  // can warn about parts that never mounted. Kept separate from `Context` so it
  // never widens the public composition value `T`.
  const RegistryContext = React.createContext<PartRegistry | null>(null);

  /**
   * Reads the shared context value provided by `Root`.
   * @returns The context value of type `T`.
   * @throws When rendered outside the component's `Root` provider.
   */
  function useComponentContext(): T {
    const value = React.useContext(Context);
    if (value === null) {
      throw new Error(
        `${displayName} compound parts must be rendered inside <${displayName}.Root>.`,
      );
    }
    return value;
  }

  /**
   * Marks a compound part present for the missing-required-part check.
   * @param partName - The part's short name (e.g. `'Content'`).
   */
  function useRegisterPart(partName: string): void {
    const registry = React.useContext(RegistryContext);
    // Register on mount, unregister on unmount. React flushes descendant effects
    // before ancestor effects, so `Boundary`'s check (below) always sees the set
    // populated on first mount. Symmetric add/remove keeps StrictMode correct.
    React.useEffect(() => registry?.register(partName), [registry, partName]);
  }

  const Boundary: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const mountedRef = React.useRef<Set<string>>(new Set());
    const registry = React.useMemo<PartRegistry>(
      () => ({
        register(partName) {
          mountedRef.current.add(partName);
          return () => {
            mountedRef.current.delete(partName);
          };
        },
      }),
      [],
    );

    React.useEffect(() => {
      // Dev-only: consumer bundlers replace this with `false` in production
      // builds and drop the block, so there is no prod overhead or console noise.
      if (process.env.NODE_ENV === 'production' || requiredParts.length === 0) {
        return;
      }
      const missing = requiredParts.filter((part) => !mountedRef.current.has(part));
      if (missing.length === 0) {
        return;
      }
      const plural = missing.length > 1;
      console.warn(
        `🚨 [Auth0 Components Warning]: <${displayName}.Root> is missing required ` +
          `part${plural ? 's' : ''}: ${missing.map((part) => `<${displayName}.${part}>`).join(', ')}. ` +
          `The component will not render correctly. Add ${plural ? 'them' : 'it'} inside ` +
          `Root, or use <${displayName}.DefaultLayout /> for the default anatomy.`,
      );
    }, []);

    return <RegistryContext.Provider value={registry}>{children}</RegistryContext.Provider>;
  };

  Boundary.displayName = `${displayName}.Boundary`;

  const parts: CompoundParts = { Boundary, useRegisterPart };

  return [Context, useComponentContext, parts] as const;
}
