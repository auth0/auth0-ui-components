/**
 * Factory for a typed compound-component context plus a guard hook.
 *
 * Each composable block component (SsoProviderTable, DomainTable, ...) creates
 * one context that shares its model/props from the `Root` boundary down to the
 * compound sub-components (`Header`, `Content`, `CreateAction`, ...).
 *
 * @module create-component-context
 * @internal
 */

import * as React from 'react';

/**
 * Creates a context + guard hook pair for a compound component.
 *
 * @template T - Shape of the context value shared by the compound parts.
 * @param displayName - Component display name, used for the context label and
 *   the error thrown when a part is rendered outside its `Root`.
 * @returns A tuple `[Context, useContext]`. The hook throws a descriptive error
 *   when a compound part is rendered outside `<${displayName}.Root>`.
 */
export function createComponentContext<T>(displayName: string) {
  const Context = React.createContext<T | null>(null);
  Context.displayName = `${displayName}Context`;

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

  return [Context, useComponentContext] as const;
}
