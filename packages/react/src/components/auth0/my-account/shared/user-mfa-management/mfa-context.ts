/**
 * Contexts shared by the `UserMFAManagement` parts.
 * @module mfa-context
 * @internal
 */

import { createCompoundContext } from '@/lib/composability/create-compound-context';
import type {
  MFAFactorModel,
  UserMFAEnrolledFactorContextValue,
  UserMFAEnrollDialogContextValue,
  UserMFAManagementContextValue,
} from '@/types/my-account/user-mfa-management/user-mfa-management-types';

export const COMPONENT = 'UserMFAManagement';

export const [MFAProvider, useMFAContext] =
  createCompoundContext<UserMFAManagementContextValue>(COMPONENT);

export const [FactorProvider, useFactorContext] = createCompoundContext<MFAFactorModel>(
  COMPONENT,
  'Factor',
);

export const [EnrolledFactorProvider, useEnrolledFactorContext] =
  createCompoundContext<UserMFAEnrolledFactorContextValue>(COMPONENT, 'FactorList');

export const [EnrollDialogProvider, useEnrollDialogContext] =
  createCompoundContext<UserMFAEnrollDialogContextValue>(COMPONENT, 'EnrollDialog');
