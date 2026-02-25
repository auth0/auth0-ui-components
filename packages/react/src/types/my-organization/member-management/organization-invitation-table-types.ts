/**
 * Organization invitation table types.
 * @module organization-invitation-table-types
 */

import type {
  SharedComponentProps,
  ComponentAction,
  EnhancedTranslationFunction,
} from '@auth0/universal-components-core';

/** Organization invitation entity. */
export interface Invitation {
  id: string;
  invitee: {
    email: string;
  };
  inviter: {
    name?: string;
  };
  roles?: string[];
  created_at?: string;
  expires_at?: string;
}

/** Input for creating an invitation. */
export interface CreateInvitationInput {
  invitee: {
    email: string;
  };
  roles?: string[];
}

/** CSS classes for OrganizationInvitationTab. */
export interface OrganizationInvitationTabClasses {
  'OrganizationInvitationTab-root'?: string;
  'OrganizationInvitationTab-table'?: string;
  'OrganizationInvitationTab-createModal'?: string;
  'OrganizationInvitationTab-detailsModal'?: string;
  'OrganizationInvitationTab-revokeModal'?: string;
}

/** OrganizationInvitationTab translation messages. */
export interface OrganizationInvitationTabMessages {
  table?: {
    columns?: {
      email?: string;
      inviter?: string;
      created_at?: string;
      expires_at?: string;
    };
    empty_message?: string;
  };
  create?: {
    title?: string;
    email_label?: string;
    email_placeholder?: string;
    submit_button?: string;
    cancel_button?: string;
  };
  details?: {
    title?: string;
    close_button?: string;
  };
  revoke?: {
    title?: string;
    description?: string;
    confirm_button?: string;
    cancel_button?: string;
  };
}

/** Props for OrganizationInvitationTab component. */
export interface OrganizationInvitationTabProps
  extends SharedComponentProps<
    OrganizationInvitationTabMessages,
    OrganizationInvitationTabClasses
  > {
  createAction?: ComponentAction<CreateInvitationInput, Invitation>;
  revokeAction?: ComponentAction<Invitation>;
}

/** Hook options for useOrganizationInvitationTable. */
export interface UseOrganizationInvitationTableOptions {
  createAction?: OrganizationInvitationTabProps['createAction'];
  revokeAction?: OrganizationInvitationTabProps['revokeAction'];
  customMessages?: OrganizationInvitationTabProps['customMessages'];
}

/** Hook result for useOrganizationInvitationTable. */
export interface UseOrganizationInvitationTableResult {
  invitations: Invitation[];
  isFetching: boolean;
  isCreating: boolean;
  isRevoking: boolean;
  fetchInvitations: () => Promise<void>;
  onCreateInvitation: (data: CreateInvitationInput) => Promise<Invitation | null>;
  onRevokeInvitation: (invitation: Invitation) => Promise<void>;
}

/** Hook options for useOrganizationInvitationTableLogic. */
export interface UseOrganizationInvitationTableLogicOptions {
  t: EnhancedTranslationFunction;
  onCreateInvitation: UseOrganizationInvitationTableResult['onCreateInvitation'];
  onRevokeInvitation: UseOrganizationInvitationTableResult['onRevokeInvitation'];
  fetchInvitations: UseOrganizationInvitationTableResult['fetchInvitations'];
}

/** Hook result for useOrganizationInvitationTableLogic. */
export interface UseOrganizationInvitationTableLogicResult {
  showCreateModal: boolean;
  showDetailsModal: boolean;
  showRevokeModal: boolean;
  selectedInvitation: Invitation | null;
  setShowCreateModal: (show: boolean) => void;
  setShowDetailsModal: (show: boolean) => void;
  setShowRevokeModal: (show: boolean) => void;
  handleCreateClick: () => void;
  handleCreate: (data: CreateInvitationInput) => Promise<void>;
  handleDetailsClick: (invitation: Invitation) => void;
  handleRevokeClick: (invitation: Invitation) => void;
  handleRevoke: (invitation: Invitation) => Promise<void>;
}
