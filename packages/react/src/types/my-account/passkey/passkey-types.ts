/**
 * Passkey management types.
 * @module passkey-types
 */

import type { SharedComponentProps } from '@auth0/universal-components-core';

/** Props for the PasskeyActionDialog in rename mode. */
export interface PasskeyActionDialogRenameProps {
  mode: 'rename';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: (newName: string) => Promise<void>;
  onCancel: () => void;
  initialName?: string;
  styling?: UserPasskeyMgmtProps['styling'];
  customMessages?: UserPasskeyMgmtProps['customMessages'];
}

/** Props for the PasskeyActionDialog in revoke mode. */
export interface PasskeyActionDialogRevokeProps {
  mode: 'revoke';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  passKeyName?: string;
  styling?: UserPasskeyMgmtProps['styling'];
  customMessages?: UserPasskeyMgmtProps['customMessages'];
}

/** Combined props for PasskeyActionDialog. */
export type PasskeyActionDialogProps =
  | PasskeyActionDialogRenameProps
  | PasskeyActionDialogRevokeProps;

/** A single enrolled passkey. */
export interface Passkey {
  id: string;
  name?: string;
  createdAt?: string;
}

/** CSS class overrides for UserPasskeyMgmt. */
export interface UserPasskeyMgmtClasses {
  'UserPasskeyMgmt-card'?: string;
  'RenamePasskey-dialogContent'?: string;
  'RevokePasskeyConfirmation-dialogContent'?: string;
}

/** Props for UserPasskeyMgmt component. */
export interface UserPasskeyMgmtProps
  extends SharedComponentProps<Record<string, string>, UserPasskeyMgmtClasses> {
  /** Hide the header section. */
  hideHeader?: boolean;

  /** Disable adding new passkeys. */
  disableAdd?: boolean;

  /** Disable renaming passkeys. */
  disableRename?: boolean;

  /** Disable revoking passkeys. */
  disableRevoke?: boolean;

  /** Called after a passkey action succeeds. */
  onSuccess?: (action: 'add' | 'rename' | 'revoke') => void;

  /** Called after passkeys are fetched. */
  onFetch?: () => void;

  /** Called when an action errors. */
  onError?: (error: Error, action: 'add' | 'rename' | 'revoke') => void;
}

/** Props for UserPasskeyMgmtView. */
export interface UserPasskeyMgmtViewProps {
  passkeys: Passkey[];
  isLoading: boolean;
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
  readOnly: boolean;
  isRevokeDialogOpen: boolean;
  passkeyToRevoke: Passkey | null;
  isRenameDialogOpen: boolean;
  passkeyToRename: Passkey | null;
  onAddPasskey: () => void;
  onRenamePasskey: (passkey: Passkey) => void;
  onRevokePasskey: (passkey: Passkey) => void;
  handleConfirmRevoke: () => Promise<void>;
  handleConfirmRename: (newName: string) => Promise<void>;
  setIsRevokeDialogOpen: (open: boolean) => void;
  setIsRenameDialogOpen: (open: boolean) => void;
}

/** Options for useUserPasskey. */
export interface UseUserPasskeyOptions {
  readOnly: boolean;
  disableAdd: boolean;
  disableRename: boolean;
  disableRevoke: boolean;
  customMessages: UserPasskeyMgmtProps['customMessages'];
  fetchPasskeys: () => Promise<Passkey[]>;
  enrollPasskey: () => Promise<void>;
  revokePasskey: (id: string) => Promise<void>;
  renamePasskey: (id: string, name: string) => Promise<void>;
  onFetch?: () => void;
  onSuccess?: (action: 'add' | 'rename' | 'revoke') => void;
  onError?: (error: Error, action: 'add' | 'rename' | 'revoke') => void;
}

/** Return type of useUserPasskey. */
export interface UseUserPasskeyResult {
  passkeys: Passkey[];
  isLoading: boolean;
  isEnrolling: boolean;
  isRevoking: boolean;
  isRenaming: boolean;
  error: string | null;
  isRevokeDialogOpen: boolean;
  passkeyToRevoke: Passkey | null;
  isRenameDialogOpen: boolean;
  passkeyToRename: Passkey | null;
  setIsRevokeDialogOpen: (open: boolean) => void;
  setIsRenameDialogOpen: (open: boolean) => void;
  loadPasskeys: () => Promise<void>;
  onAddPasskey: () => Promise<void>;
  onRenamePasskey: (passkey: Passkey) => void;
  onRevokePasskey: (passkey: Passkey) => void;
  handleConfirmRevoke: () => Promise<void>;
  handleConfirmRename: (newName: string) => Promise<void>;
}

/** Return type of useUserPasskeyService. */
export interface UseUserPasskeyServiceResult {
  fetchPasskeys: () => Promise<Passkey[]>;
  enrollPasskey: () => Promise<void>;
  revokePasskey: (id: string) => Promise<void>;
  renamePasskey: (id: string, name: string) => Promise<void>;
}
