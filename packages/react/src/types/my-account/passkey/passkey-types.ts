/**
 * Passkey management types.
 * @module passkey-types
 */

import type {
  BlockComponentSharedProps,
  ComponentAction,
  PasskeyMessages,
  PasskeyRevokeModalMessages,
  SharedComponentProps,
} from '@auth0/universal-components-core';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

export interface PasskeyActionModalProps
  extends SharedComponentProps<PasskeyRevokeModalMessages, UserPasskeyManagementClasses> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: () => Promise<void>;
  name?: string;
}

export interface Passkey {
  id: string;
  name?: string;
  createdAt?: string;
  lastUsedAt?: string;
  deviceInfo?: string;
}

export interface UserPasskeyManagementClasses {
  'UserPasskeyManagement-root'?: string;
  'UserPasskeyManagement-item'?: string;
  'PasskeyActionModal-modalContent'?: string;
}

export interface UserPasskeyManagementProps
  extends BlockComponentSharedProps<PasskeyMessages, UserPasskeyManagementClasses> {
  addAction?: ComponentAction<void>;
  revokeAction?: ComponentAction<Passkey>;
  onFetch?: () => void;
  onErrorAction?: (error: Error, action: 'add' | 'revoke') => void;
}

export interface UserPasskeyManagementViewProps {
  passkeys: Passkey[];
  isRevoking: boolean;
  isEnrolling: boolean;
  styling: UserPasskeyManagementProps['styling'];
  customMessages: UserPasskeyManagementProps['customMessages'];
  hideHeader: boolean;
  disableAdd: boolean;
  disableRevoke: boolean;
  isRevokeModalOpen: boolean;
  currentPasskey: Passkey | null;
  handleAddPasskey: () => void;
  handleRevokePasskey: (passkey: Passkey) => void;
  handleConfirmRevoke: () => Promise<void>;
  setIsRevokeModalOpen: (open: boolean) => void;
}

export interface UseUserPasskeyOptions {
  customMessages?: UserPasskeyManagementProps['customMessages'];
  addAction?: ComponentAction<void>;
  revokeAction?: ComponentAction<Passkey>;
  onFetch?: () => void;
  onErrorAction?: (error: Error, action: 'add' | 'revoke') => void;
}

export interface UseUserPasskeyReturn {
  passkeys: Passkey[];
  isLoading: boolean;
  isEnrolling: boolean;
  isRevoking: boolean;
  disableAdd: boolean;
  disableRevoke: boolean;
  readOnly: boolean;
  isRevokeModalOpen: boolean;
  currentPasskey: Passkey | null;
  setIsRevokeModalOpen: (open: boolean) => void;
  handleAddPasskey: () => Promise<void>;
  handleRevokePasskey: (passkey: Passkey) => void;
  handleConfirmRevoke: () => Promise<void>;
}

export interface UseUserPasskeyServiceResult {
  passkeysQuery: UseQueryResult<Passkey[]>;
  enrollMutation: UseMutationResult<boolean, Error, void>;
  revokeMutation: UseMutationResult<void, Error, string>;
}
