/**
 * MFA factors list types.
 * @module factors-list-types
 */

import type {
  Authenticator,
  MFAType,
  UserMfaManagementMessages,
  SharedComponentProps,
} from '@auth0/universal-components-core';

/** Props for FactorsList component. */
export interface FactorsListProps extends SharedComponentProps<UserMfaManagementMessages> {
  factors: Authenticator[];
  factorType: MFAType;
  readOnly: boolean;
  isEnabledFactor: boolean;
  onDeleteFactor: (factorId: string, factorType: MFAType) => void;
  isDeletingFactor: boolean;
  disableDelete: boolean;
}
