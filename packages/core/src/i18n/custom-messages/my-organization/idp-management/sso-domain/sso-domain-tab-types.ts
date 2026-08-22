/**
 * Custom message type definitions for SSO domain tab component.
 * @module sso-domain-tab-types
 * @internal
 */

import type { CommonMessages } from '../../../shared/common-types';
import type { DomainCreateMessages } from '../../domain-management/domain-create-types';
import type { DomainDeleteMessages } from '../../domain-management/domain-delete-types';
import type { DomainVerifyMessages } from '../../domain-management/domain-verify-types';

export interface SsoDomainTabMessages extends CommonMessages {
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
    };
    domain_statuses?: {
      pending?: string;
      verified?: string;
      failed?: string;
    };
  };
  domain_create?: DomainCreateMessages;
  domain_verify?: DomainVerifyMessages;
  domain_delete?: DomainDeleteMessages;
}
