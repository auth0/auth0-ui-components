/**
 * Passkey management types.
 * @module passkey-types
 */

import type {
  BlockComponentSharedProps,
  ComponentAction,
  PasskeyMessages,
  PasskeyRenameDialogMessages,
  PasskeyRevokeDialogMessages,
  SharedComponentProps,
  UpdatePasskeyResponse,
} from '@auth0/universal-components-core';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

export interface PasskeyActionModalProps
  extends SharedComponentProps<
    PasskeyRenameDialogMessages & PasskeyRevokeDialogMessages,
    UserPasskeyMgmtClasses
  > {
  mode: 'rename' | 'revoke';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: (newName?: string) => Promise<void>;
  onCancel: () => void;
  name?: string;
}

export interface Passkey {
  id: string;
  name?: string;
  createdAt?: string;
}

export interface UserPasskeyMgmtClasses {
  'UserPasskeyMgmt-root'?: string;
  'UserPasskeyMgmt-item'?: string;
  'PasskeyActionModal-modalContent'?: string;
}
export interface UserPasskeyMgmtProps
  extends BlockComponentSharedProps<PasskeyMessages, UserPasskeyMgmtClasses> {
  addAction?: ComponentAction<void>;
  revokeAction?: ComponentAction<Passkey>;
  renameAction?: ComponentAction<Passkey, string>;
  onFetch?: () => void;
  onErrorAction?: (error: Error, action: 'add' | 'rename' | 'revoke') => void;
}

export interface UserPasskeyMgmtViewProps {
  passkeys: Passkey[];
  isRevoking: boolean;
  isEnrolling: boolean;
  isRenaming: boolean;
  error: string | null;
  styling: UserPasskeyMgmtProps['styling'];
  customMessages: UserPasskeyMgmtProps['customMessages'];
  hideHeader: boolean;
  disableAdd: boolean;
  disableRename: boolean;
  disableRevoke: boolean;
  isRevokeDialogOpen: boolean;
  isRenameDialogOpen: boolean;
  currentPasskey: Passkey | null;
  handleAddPasskey: () => void;
  handleRenamePasskey: (passkey: Passkey) => void;
  handleRevokePasskey: (passkey: Passkey) => void;
  handleConfirmRevoke: () => Promise<void>;
  handleConfirmRename: (newName?: string) => Promise<void>;
  setIsRevokeDialogOpen: (open: boolean) => void;
  setIsRenameDialogOpen: (open: boolean) => void;
}
export interface UseUserPasskeyOptions {
  customMessages: UserPasskeyMgmtProps['customMessages'];
  addAction?: ComponentAction<void>;
  revokeAction?: ComponentAction<Passkey>;
  renameAction?: ComponentAction<Passkey, string>;
  onFetch?: () => void;
  onErrorAction?: (error: Error, action: 'add' | 'rename' | 'revoke') => void;
}
export interface UseUserPasskeyReturn {
  passkeys: Passkey[];
  isLoading: boolean;
  isEnrolling: boolean;
  isRevoking: boolean;
  isRenaming: boolean;
  error: string | null;
  disableAdd: boolean;
  disableRename: boolean;
  disableRevoke: boolean;
  readOnly: boolean;
  isRevokeDialogOpen: boolean;
  isRenameDialogOpen: boolean;
  currentPasskey: Passkey | null;
  setIsRevokeDialogOpen: (open: boolean) => void;
  setIsRenameDialogOpen: (open: boolean) => void;
  handleAddPasskey: () => Promise<void>;
  handleRenamePasskey: (passkey: Passkey) => void;
  handleRevokePasskey: (passkey: Passkey) => void;
  handleConfirmRevoke: () => Promise<void>;
  handleConfirmRename: (newName?: string) => Promise<void>;
}
export interface UseUserPasskeyServiceResult {
  passkeysQuery: UseQueryResult<Passkey[]>;
  enrollMutation: UseMutationResult<void, Error, void>;
  revokeMutation: UseMutationResult<void, Error, string>;
  renameMutation: UseMutationResult<UpdatePasskeyResponse, Error, { id: string; name: string }>;
}
