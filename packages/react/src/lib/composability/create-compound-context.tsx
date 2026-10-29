/**
 * Strict React context for compound components.
 * @module create-compound-context
 * @internal
 */

import * as React from 'react';

/**
 * Creates a context whose consumer throws a readable error when a part is used
 * outside its root, instead of failing later on an undefined value.
 *
 * @param componentName - Public component name, e.g. `UserPasskeyManagement`.
 * @param providerName - Part that provides the context, e.g. `Root`.
 * @returns The provider and a hook that takes the consuming part's name.
 */
export function createCompoundContext<T>(componentName: string, providerName = 'Root') {
  const Context = React.createContext<T | null>(null);
  Context.displayName = `${componentName}${providerName}Context`;

  /**
   * Reads the context for a part.
   * @param partName - Consuming part, used in the error message.
   * @returns The context value.
   */
  function useCompoundContext(partName: string): T {
    const value = React.useContext(Context);
    if (value === null) {
      throw new Error(
        `<${componentName}.${partName}> must be rendered inside <${componentName}.${providerName}>.`,
      );
    }
    return value;
  }

  return [Context.Provider, useCompoundContext, Context] as const;
}
