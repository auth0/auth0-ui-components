/**
 * Pure helpers for the SSO provider test hook.
 * @module sso-provider-test-utils
 * @internal
 */

import {
  SSO_PROVIDER_TEST_FORBIDDEN_STATUS,
  SSO_PROVIDER_TEST_NOT_FOUND_STATUS,
  SSO_PROVIDER_TEST_POPUP_HEIGHT,
  SSO_PROVIDER_TEST_POPUP_WIDTH,
} from '@/lib/constants/my-organization/idp-management/idp-management-constants';
import type { SsoProviderTestErrorReason } from '@/types/my-organization/idp-management/sso-provider/sso-provider-test-types';

/**
 * Builds the `window.open` features string. Browsers only open a popup window
 * (instead of a tab) when explicit size features are supplied.
 * @returns Comma-separated features string that centers the popup on the parent window.
 */
export const getPopupFeatures = (): string => {
  const left = Math.max(
    0,
    Math.round(window.screenX + (window.outerWidth - SSO_PROVIDER_TEST_POPUP_WIDTH) / 2),
  );
  const top = Math.max(
    0,
    Math.round(window.screenY + (window.outerHeight - SSO_PROVIDER_TEST_POPUP_HEIGHT) / 2),
  );
  return `popup=yes,width=${SSO_PROVIDER_TEST_POPUP_WIDTH},height=${SSO_PROVIDER_TEST_POPUP_HEIGHT},left=${left},top=${top}`;
};

/**
 * Maps a fatal poll status to an error reason.
 * @param status - HTTP status of the poll error.
 * @returns `forbidden` for 403, `expired` for 404, `provider` for anything else.
 */
export const errorReasonForStatus = (status: number | undefined): SsoProviderTestErrorReason => {
  if (status === SSO_PROVIDER_TEST_FORBIDDEN_STATUS) return 'forbidden';
  if (status === SSO_PROVIDER_TEST_NOT_FOUND_STATUS) return 'expired';
  return 'provider';
};

/**
 * Only `https:` URLs are safe to navigate the test window to.
 * @param url - URL returned by the API.
 * @returns Whether the URL parses and uses the `https:` protocol.
 */
export const isHttpsUrl = (url: string): boolean => {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
};
