/**
 * Context shared by the instruction content components.
 * @module sso-guided-setup-context
 * @internal
 */

import * as React from 'react';

import type { SsoGuidedSetupContextValue } from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

const SsoGuidedSetupContext = React.createContext<SsoGuidedSetupContextValue | null>(null);

/**
 * Provides the guided setup values to the instruction components below it.
 * @param props - Component props.
 * @param props.value - Context value.
 * @param props.children - Children.
 * @returns JSX element
 */
export function SsoGuidedSetupProvider({
  value,
  children,
}: {
  value: SsoGuidedSetupContextValue;
  children: React.ReactNode;
}) {
  return <SsoGuidedSetupContext.Provider value={value}>{children}</SsoGuidedSetupContext.Provider>;
}

/**
 * Reads the guided setup values. Must be used under {@link SsoGuidedSetupProvider}.
 * @returns Context value.
 */
export function useSsoGuidedSetupContext(): SsoGuidedSetupContextValue {
  const value = React.useContext(SsoGuidedSetupContext);
  if (!value) {
    throw new Error('useSsoGuidedSetupContext must be used within SsoGuidedSetupProvider');
  }
  return value;
}
