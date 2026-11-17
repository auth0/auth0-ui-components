/**
 * Custom message type definitions for SSO domain tab component.
 * @module sso-domain-tab-types
 * @internal
 */

import type { SharedMessages } from '../../../shared/shared-types';
import type { DomainCreateMessages } from '../../domain-management/domain-create-types';
import type { DomainDeleteMessages } from '../../domain-management/domain-delete-types';
import type { DomainVerifyMessages } from '../../domain-management/domain-verify-types';

export interface SsoDomainAssignMessages {
  title?: string;
  description?: string;
  field?: {
    label?: string;
    placeholder?: string;
    helper_text?: string;
    empty_message?: string;
  };
  learn_more?: {
    text?: string;
    link_text?: string;
  };
  actions?: {
    cancel_button_text?: string;
    assign_button_text?: string;
  };
}

export interface SsoDomainTabMessages extends SharedMessages {
  title?: string;
  description?: string;
  create_button_text?: string;
  table?: {
    empty_message?: string;
    columns?: {
      name?: string;
      status?: string;
      verify?: string;
    };
    actions?: {
      enable_domain_tooltip?: string;
      disable_domain_tooltip?: string;
      remove_domain_tooltip?: string;
      remove_domain_aria_label?: string;
    };
    domain_statuses?: {
      pending?: string;
      verified?: string;
      failed?: string;
    };
  };
  domain_assign?: SsoDomainAssignMessages;
  domain_create?: DomainCreateMessages;
  domain_verify?: DomainVerifyMessages;
  domain_delete?: DomainDeleteMessages;
}
