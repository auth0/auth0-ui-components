/**
 * Mock factories for CrossAppAccessSection component tests.
 * @module cross-app-access-section.mocks
 * @internal
 */

import type { CrossAppAccessMessages } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import type { CrossAppAccessSectionProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-tab-types';

export function createMockCrossAppAccessSectionProps(
  overrides: Partial<CrossAppAccessSectionProps> = {},
): CrossAppAccessSectionProps {
  return {
    checked: false,
    onChange: vi.fn(),
    readOnly: false,
    customMessages: {},
    className: undefined,
    strategy: 'oidc',
    discoveryUrl: '',
    onDiscoveryUrlChange: vi.fn(),
    ...overrides,
  };
}

export function createMockCrossAppAccessMessages(
  overrides: Partial<CrossAppAccessMessages> = {},
): CrossAppAccessMessages {
  return {
    title: 'Cross App Access',
    label: 'Allow this provider to authorize access to this Resource Application',
    helper_text:
      'Accept authorizations from this provider to issue API access tokens to other connected enterprise applications.',
    domain_verification_text: 'The OIDC issuer domain must be verified.',
    saml_description:
      'Configure cross-app access for SAML providers by providing the discovery URL.',
    saml_discovery_url_label: 'Discovery URL',
    saml_discovery_url_placeholder: 'https://example.com/.well-known/openid-configuration',
    saml_discovery_url_helper: 'Enter the OpenID Connect discovery URL for this SAML provider.',
    ...overrides,
  };
}

export const mockUseTranslatorReturn = {
  t: Object.assign((key: string) => key, {
    trans: (key: string) => [key],
  }),
  changeLanguage: vi.fn(),
  currentLanguage: 'en',
  fallbackLanguage: 'en',
};

export const mockUseThemeReturn = {
  isDarkMode: false,
};
