/**
 * Organization member table types.
 * @module organization-member-table-types
 */

import type {
  SharedComponentProps,
  ComponentAction,
  EnhancedTranslationFunction,
} from '@auth0/universal-components-core';

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

/** Hook options for useOrganizationMemberTable. */
export interface UseOrganizationMemberTableOptions {
  removeAction?: OrganizationMemberTabProps['removeAction'];
  customMessages?: OrganizationMemberTabProps['customMessages'];
}

/** Hook result for useOrganizationMemberTable. */
export interface UseOrganizationMemberTableResult {
  members: Member[];
  isFetching: boolean;
  isRemoving: boolean;
  fetchMembers: () => Promise<void>;
  onRemoveMember: (member: Member) => Promise<void>;
}

/** Hook options for useOrganizationMemberTableLogic. */
export interface UseOrganizationMemberTableLogicOptions {
  t: EnhancedTranslationFunction;
  onRemoveMember: UseOrganizationMemberTableResult['onRemoveMember'];
  fetchMembers: UseOrganizationMemberTableResult['fetchMembers'];
}

/** Hook result for useOrganizationMemberTableLogic. */
export interface UseOrganizationMemberTableLogicResult {
  showRemoveModal: boolean;
  selectedMember: Member | null;
  setShowRemoveModal: (show: boolean) => void;
  handleRemoveClick: (member: Member) => void;
  handleRemove: (member: Member) => Promise<void>;
}
