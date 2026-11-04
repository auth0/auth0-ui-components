/**
 * Logo for an identity provider strategy.
 * @module sso-strategy-icon
 * @internal
 */

import { STRATEGIES, type IdpStrategy } from '@auth0/universal-components-core';
import type * as React from 'react';

import EntraIdLogo from '@/assets/icons/entraid-logo';
import GoogleLogo from '@/assets/icons/google-logo';
import MicrosoftLogo from '@/assets/icons/microsoft-logo';
import OidcLogo from '@/assets/icons/oidc-logo';
import OktaLogo from '@/assets/icons/okta-logo';
import PingIdLogo from '@/assets/icons/pingid-logo';
import SamlpLogo from '@/assets/icons/sampl-logo';

const STRATEGY_ICONS: Record<IdpStrategy, React.FC<{ className?: string }>> = {
  [STRATEGIES.OKTA]: OktaLogo,
  [STRATEGIES.GOOGLE_APPS]: GoogleLogo,
  [STRATEGIES.WAAD]: EntraIdLogo,
  [STRATEGIES.ADFS]: MicrosoftLogo,
  [STRATEGIES.PINGFEDERATE]: PingIdLogo,
  [STRATEGIES.SAMLP]: SamlpLogo,
  [STRATEGIES.OIDC]: OidcLogo,
};

/**
 * Renders the logo for a strategy; nothing for an unknown strategy.
 * @param props - Component props.
 * @param props.strategy - IdP strategy.
 * @param props.className - Class names.
 * @returns JSX element, or `null`.
 */
export function SsoStrategyIcon({
  strategy,
  className,
}: {
  strategy: IdpStrategy;
  className?: string;
}) {
  const Icon = STRATEGY_ICONS[strategy];
  return Icon ? <Icon className={className} /> : null;
}
