/**
 * User MFA management hook.
 * @module use-user-mfa
 */

import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_PHONE,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_RECOVERY_CODE,
  isNotifiableError,
  normalizeError,
  ERROR_CODE_TRANSLATION_KEYS,
  type Authenticator,
  type CreateAuthenticationMethodResponseContent,
  type MFAType,
} from '@auth0/universal-components-core';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useUserMFAService } from '@/hooks/my-account/shared/services/use-user-mfa-service';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import {
  ENTER_CONTACT,
  ENTER_QR,
  QR_PHASE_INSTALLATION,
  SHOW_RECOVERY_CODE,
} from '@/lib/constants/my-account/user-mfa-management/user-mfa-constants';
import { isMutationLoading } from '@/lib/utils/tanstack-compat';
import type {
  EnrollmentPhase,
  FactorToDelete,
  OtpData,
  UseUserMFAOptions,
  UseUserMFAReturn,
} from '@/types/my-account/user-mfa-management/user-mfa-management-types';

const EMPTY_SESSION = { authSession: '', authenticationMethodId: '' };

const extractSession = (res: CreateAuthenticationMethodResponseContent) => ({
  authSession: res.auth_session,
  authenticationMethodId: 'id' in res ? res.id : '',
});

const extractOtpData = (res: CreateAuthenticationMethodResponseContent) => ({
  barcodeUri: 'barcode_uri' in res ? res.barcode_uri : '',
  manualInputCode: 'manual_input_code' in res ? (res.manual_input_code ?? '') : '',
});

/**
 * Hook for user MFA management — fetch, enroll, delete, confirm, and all UI state.
 * @param options - Hook options.
 * @returns MFA state, UI handlers, and API methods.
 */
export function useUserMFA({
  showActiveOnly = false,
  readOnly = false,
  disableDelete = false,
  factorConfig,
  customMessages = {},
  enrollAction,
  deleteAction,
}: UseUserMFAOptions = {}): UseUserMFAReturn {
  const { t } = useTranslator('user_mfa_management', customMessages);
  const handleError = useErrorHandler();
  const { factorsQuery, enrollMutation, deleteMutation, verifyMutation } =
    useUserMFAService(showActiveOnly);

  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [enrollFactor, setEnrollFactor] = useState<MFAType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [factorToDelete, setFactorToDelete] = useState<FactorToDelete | null>(null);

  const [enrollmentPhase, setEnrollmentPhase] = useState<EnrollmentPhase>(null);
  const [enrollmentSession, setEnrollmentSession] = useState(EMPTY_SESSION);
  const [contact, setContact] = useState('');
  const [otpData, setOtpData] = useState<OtpData>({ barcodeUri: '', manualInputCode: '' });
  const [recoveryCode, setRecoveryCode] = useState('');

  const factorsByType = factorsQuery.data ?? ({} as Record<MFAType, Authenticator[]>);

  useEffect(() => {
    if (factorsQuery.isError) {
      handleError(factorsQuery.error, { fallbackMessage: t('notifications.fetch_factors_error') });
    }
  }, [factorsQuery.isError, factorsQuery.error, handleError, t]);

  const visibleFactorTypes = useMemo(
    () =>
      (Object.keys(factorsByType) as MFAType[]).filter(
        (factorType) => factorConfig?.[factorType]?.visible !== false,
      ),
    [factorsByType, factorConfig],
  );

  const hasNoActiveFactors = useMemo(
    () => visibleFactorTypes.every((type) => !factorsByType[type]?.some((f) => f.enrolled)),
    [visibleFactorTypes, factorsByType],
  );

  const handleEnrollError = useCallback(
    (err: unknown, factor: MFAType | null) => {
      if (!isNotifiableError(err)) {
        handleError(err);
        return;
      }
      const error = normalizeError(err, {
        resolver: (code) => {
          const key = ERROR_CODE_TRANSLATION_KEYS[code];
          if (!key) return undefined;
          return t(`errors.${factor}.${key}`, {}, undefined);
        },
      });
      showToast({ type: 'error', message: error.message });
    },
    [handleError, t],
  );

  const handleEnrollSuccess = useCallback(async () => {
    showToast({ type: 'success', message: t('notifications.factor_enroll_success') });
    await enrollAction?.onAfter?.(enrollFactor!);
    setIsEnrollDialogOpen(false);
    setEnrollFactor(null);
    setEnrollmentPhase(null);
    setEnrollmentSession(EMPTY_SESSION);
    setContact('');
    setOtpData({ barcodeUri: '', manualInputCode: '' });
    setRecoveryCode('');
    await factorsQuery.refetch();
  }, [factorsQuery, enrollAction, enrollFactor, t]);

  const verifyAndComplete = useCallback(
    async (params: Parameters<typeof verifyMutation.mutateAsync>[0]) => {
      try {
        await verifyMutation.mutateAsync(params);
        await handleEnrollSuccess();
      } catch (err) {
        handleEnrollError(err, params.factorType);
      }
    },
    [verifyMutation, handleEnrollSuccess, handleEnrollError],
  );

  const handleEnroll = useCallback(
    async (factor: MFAType) => {
      if (enrollAction?.onBefore && !enrollAction.onBefore(factor)) return;
      setEnrollFactor(factor);
      setIsEnrollDialogOpen(true);

      if (factor === FACTOR_TYPE_EMAIL || factor === FACTOR_TYPE_PHONE) {
        setEnrollmentPhase(ENTER_CONTACT);
        return;
      }

      if (factor === FACTOR_TYPE_PUSH_NOTIFICATION) {
        setEnrollmentPhase(QR_PHASE_INSTALLATION);
        return;
      }

      try {
        const enrollment = await enrollMutation.mutateAsync({ factorType: factor, options: {} });
        setEnrollmentSession(extractSession(enrollment));
        if (factor === FACTOR_TYPE_RECOVERY_CODE) {
          setRecoveryCode('recovery_code' in enrollment ? enrollment.recovery_code : '');
          setEnrollmentPhase(SHOW_RECOVERY_CODE);
        } else {
          setOtpData(extractOtpData(enrollment));
          setEnrollmentPhase(ENTER_QR);
        }
      } catch (err) {
        handleEnrollError(err, factor);
        setIsEnrollDialogOpen(false);
        setEnrollFactor(null);
      }
    },
    [enrollMutation, handleEnrollError, enrollAction],
  );

  const handleCancelDelete = useCallback(() => {
    if (isMutationLoading(deleteMutation)) return;
    setIsDeleteDialogOpen(false);
    setFactorToDelete(null);
  }, [deleteMutation]);

  const handleCloseEnrollDialog = useCallback(async () => {
    setIsEnrollDialogOpen(false);
    setEnrollmentPhase(null);
    setEnrollmentSession(EMPTY_SESSION);
    setContact('');
    setOtpData({ barcodeUri: '', manualInputCode: '' });
    setRecoveryCode('');
    if (enrollFactor === FACTOR_TYPE_PUSH_NOTIFICATION && enrollmentSession.authSession) {
      await factorsQuery.refetch();
    }
    setEnrollFactor(null);
  }, [enrollFactor, enrollmentSession.authSession, factorsQuery]);

  const executeDelete = useCallback(
    async (factorId: string) => {
      try {
        await deleteMutation.mutateAsync(factorId);
        await factorsQuery.refetch();
        showToast({ type: 'success', message: t('notifications.factor_remove_success') });
        await deleteAction?.onAfter?.(factorToDelete!.type);
      } catch (err) {
        handleError(err, { fallbackMessage: t('notifications.factor_delete_error') });
      } finally {
        setIsDeleteDialogOpen(false);
        setFactorToDelete(null);
      }
    },
    [deleteMutation, factorsQuery, handleError, deleteAction, factorToDelete, t],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!factorToDelete) return;
    await executeDelete(factorToDelete.id);
  }, [factorToDelete, executeDelete]);

  const handleDeleteFactor = useCallback(
    async (factorId: string, factorType: MFAType) => {
      if (readOnly || disableDelete) return;
      if (deleteAction?.onBefore && !deleteAction.onBefore(factorType)) return;
      setFactorToDelete({ id: factorId, type: factorType });
      setIsDeleteDialogOpen(true);
    },
    [readOnly, disableDelete, deleteAction],
  );

  const handleSendCode = useCallback(
    async (options: Record<string, string>): Promise<boolean> => {
      try {
        const enrollment = await enrollMutation.mutateAsync({ factorType: enrollFactor!, options });
        setContact(options.email ?? options.phone_number ?? '');
        setEnrollmentSession(extractSession(enrollment));
        return true;
      } catch (err) {
        handleEnrollError(err, enrollFactor);
        return false;
      }
    },
    [enrollFactor, enrollMutation, handleEnrollError],
  );

  const handleResendCode = useCallback(async (): Promise<void> => {
    const options: Record<string, string> =
      enrollFactor === FACTOR_TYPE_EMAIL ? { email: contact } : { phone_number: contact };
    try {
      const enrollment = await enrollMutation.mutateAsync({ factorType: enrollFactor!, options });
      setEnrollmentSession(extractSession(enrollment));
    } catch (err) {
      handleEnrollError(err, enrollFactor);
    }
  }, [contact, enrollFactor, enrollMutation, handleEnrollError]);

  const handleConfirmOtp = useCallback(
    (otpCode: string) =>
      verifyAndComplete({
        factorType: enrollFactor!,
        authSession: enrollmentSession.authSession,
        authenticationMethodId: enrollmentSession.authenticationMethodId,
        options: { userOtpCode: otpCode },
      }),
    [enrollFactor, enrollmentSession, verifyAndComplete],
  );

  const handleEnterQRPhase = useCallback(async () => {
    if (!enrollFactor) return;
    try {
      const enrollment = await enrollMutation.mutateAsync({
        factorType: enrollFactor,
        options: {},
      });
      setEnrollmentSession(extractSession(enrollment));
      setOtpData(extractOtpData(enrollment));
      setEnrollmentPhase(ENTER_QR);
    } catch (err) {
      handleEnrollError(err, enrollFactor);
      setIsEnrollDialogOpen(false);
      setEnrollFactor(null);
    }
  }, [enrollFactor, enrollMutation, handleEnrollError]);

  const handleConfirmPush = useCallback(async () => {
    if (enrollFactor !== FACTOR_TYPE_PUSH_NOTIFICATION) return;
    await verifyAndComplete({
      factorType: enrollFactor,
      authSession: enrollmentSession.authSession,
      authenticationMethodId: enrollmentSession.authenticationMethodId,
      options: {},
    });
  }, [enrollFactor, enrollmentSession, verifyAndComplete]);

  const handleConfirmRecoveryCode = useCallback(
    () =>
      verifyAndComplete({
        factorType: enrollFactor!,
        authSession: enrollmentSession.authSession,
        authenticationMethodId: enrollmentSession.authenticationMethodId,
        options: {},
      }),
    [enrollFactor, enrollmentSession, verifyAndComplete],
  );

  return {
    factorsByType,
    isLoadingFactors: factorsQuery.isLoading,
    isEnrolling: isMutationLoading(enrollMutation),
    isDeleting: isMutationLoading(deleteMutation),
    isConfirming: isMutationLoading(verifyMutation),
    error: factorsQuery.isError ? t('errors.factors_loading_error') : null,
    isEnrollDialogOpen,
    enrollFactor,
    enrollmentPhase,
    isDeleteDialogOpen,
    factorToDelete,
    visibleFactorTypes,
    hasNoActiveFactors,
    contact,
    otpData,
    recoveryCode,
    handleCancelDelete,
    handleConfirmDelete,
    handleEnroll,
    handleCloseEnrollDialog,
    handleDeleteFactor,
    handleSendCode,
    handleResendCode,
    handleConfirmOtp,
    handleConfirmPush,
    handleConfirmRecoveryCode,
    handleEnterQRPhase,
  };
}
