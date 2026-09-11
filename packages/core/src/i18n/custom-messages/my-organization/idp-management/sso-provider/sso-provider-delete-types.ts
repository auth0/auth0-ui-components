/**
 * Custom message type definitions for SSO provider delete component.
 * @module sso-provider-delete-types
 * @internal
 */

import type { SharedMessages } from '../../../shared/shared-types';
export interface SsoProviderDeleteModalContentMessages {
  description?: string;
  field: {
    label?: string;
    placeholder?: string;
  };
}

export interface SsoProvideDeleteMessages extends SharedMessages {
  title?: string;
  description?: string;
  delete_button_label?: string;
  modal?: {
    title?: string;
    description?: string;
    content: SsoProviderDeleteModalContentMessages;
    actions?: {
      cancel_button_label?: string;
      delete_button_label?: string;
    };
  };
}

export interface SsoProvideRemoveMessages extends SharedMessages {
  title?: string;
  description?: string;
  remove_button_label?: string;
  modal?: {
    title?: string;
    description?: string;
    content: SsoProviderDeleteModalContentMessages;
    actions?: {
      cancel_button_label?: string;
      delete_button_label?: string;
    };
  };
}
