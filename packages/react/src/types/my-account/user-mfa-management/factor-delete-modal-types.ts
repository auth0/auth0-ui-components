/**
 * Factor delete modal types.
 * @module factor-delete-modal-types
 */

import type {
  MFAType,
  UserMfaManagementMessages,
  SharedComponentProps,
} from '@auth0/universal-components-core';

import type { UserMFAManagementClasses } from './user-mfa-management-types';

/** Props for FactorDeleteModal component. */
export interface FactorDeleteModalProps
  extends SharedComponentProps<UserMfaManagementMessages, UserMFAManagementClasses> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  factorToDelete: {
    id: string;
    type: MFAType;
  } | null;
  isDeletingFactor: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}
