/**
 * Organization member table types.
 * @module organization-member-table-types
 */

import type { SharedComponentProps, ComponentAction } from '@auth0/universal-components-core';

/** Organization member entity. */
export interface Member {
  user_id: string;
  email?: string;
  name?: string;
  picture?: string;
  roles?: string[];
}

/** CSS classes for OrganizationMemberTab. */
export interface OrganizationMemberTabClasses {
  'OrganizationMemberTab-root'?: string;
  'OrganizationMemberTab-table'?: string;
  'OrganizationMemberTab-removeModal'?: string;
}

/** OrganizationMemberTab translation messages. */
export interface OrganizationMemberTabMessages {
  table?: {
    columns?: {
      name?: string;
      email?: string;
      roles?: string;
    };
    empty_message?: string;
  };
  remove?: {
    title?: string;
    description?: string;
    confirm_button?: string;
    cancel_button?: string;
  };
}

/** Props for OrganizationMemberTab component. */
export interface OrganizationMemberTabProps
  extends SharedComponentProps<OrganizationMemberTabMessages, OrganizationMemberTabClasses> {
  removeAction?: ComponentAction<Member>;
}
