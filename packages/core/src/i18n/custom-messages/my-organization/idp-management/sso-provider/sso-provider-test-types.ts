/**
 * Custom message type definitions for SSO provider test components.
 * @module sso-provider-test-types
 * @internal
 */

import type { SharedMessages } from '../../../shared/shared-types';

export interface SsoProviderTestOverlayMessages {
  title?: string;
  description?: string;
  trouble_text?: string;
  retry_button_label?: string;
  popup_blocked_text?: string;
  open_window_link_label?: string;
}

export interface SsoProviderTestResultMessages extends SharedMessages {
  success_title?: string;
  success_description?: string;
  copy_button_label?: string;
  try_again_text?: string;
  expired_error?: string;
  timeout_error?: string;
}

export interface SsoProviderTestMessages extends SharedMessages {
  title?: string;
  description?: string;
  test_button_label?: string;
  overlay?: SsoProviderTestOverlayMessages;
  result?: SsoProviderTestResultMessages;
}
