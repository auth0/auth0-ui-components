/**
 * Mock factories for ThirdPartyAccessSection component tests.
 * @module third-party-access-section.mocks
 * @internal
 */

import type { ThirdPartyAccessMessages } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import type { ThirdPartyAccessSectionProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-tab-types';

export function createMockThirdPartyAccessSectionProps(
  overrides: Partial<ThirdPartyAccessSectionProps> = {},
): ThirdPartyAccessSectionProps {
  return {
    checked: false,
    onChange: vi.fn(),
    readOnly: false,
    customMessages: {},
    className: undefined,
    ...overrides,
  };
}

export function createMockThirdPartyAccessMessages(
  overrides: Partial<ThirdPartyAccessMessages> = {},
): ThirdPartyAccessMessages {
  return {
    title: 'Third party Application Access',
    label: 'Allow this provider to be used by third-party applications',
    helper_text:
      'Applications outside the official platform can authenticate users through this provider.',
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
