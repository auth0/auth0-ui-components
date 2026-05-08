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
  type Authenticator,
  type CreateAuthenticationMethodResponseContent,
  type MFAType,
} from '@auth0/universal-components-core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useUserMFAService } from '@/hooks/my-account/use-user-mfa-service';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import {
  CONFIRM,
  ENTER_CONTACT,
  ENTER_QR,
  ENROLL,
  QR_PHASE_INSTALLATION,
  SHOW_RECOVERY_CODE,
} from '@/lib/constants/my-account/mfa/mfa-constants';
import type {
  EnrollmentPhase,
  UserMFAOptions,
  UseUserMFAReturn,
} from '@/types/my-account/mfa/mfa-types';

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
  onFetch,
  onEnroll,
  onDelete,
  onErrorAction,
  onBeforeAction,
}: UserMFAOptions = {}): UseUserMFAReturn {
  const { t } = useTranslator('mfa', customMessages);
  const handleError = useErrorHandler();
  const { factorsQuery, enrollMutation, deleteMutation, verifyMutation } =
    useUserMFAService(showActiveOnly);

  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [enrollFactor, setEnrollFactor] = useState<MFAType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [factorToDelete, setFactorToDelete] = useState<{ id: string; type: MFAType } | null>(null);

  const [enrollmentPhase, setEnrollmentPhase] = useState<EnrollmentPhase>(null);
  const [enrollmentSession, setEnrollmentSession] = useState(EMPTY_SESSION);
  const [contact, setContact] = useState('');
  const [otpData, setOtpData] = useState({ barcodeUri: '', manualInputCode: '' });
  const [recoveryCode, setRecoveryCode] = useState('');

  const factorsByType = (factorsQuery.data ?? {}) as Record<MFAType, Authenticator[]>;

  useEffect(() => {
    if (factorsQuery.isSuccess) onFetch?.();
  }, [factorsQuery.dataUpdatedAt, onFetch]);

  useEffect(() => {
    if (factorsQuery.isError) {
      handleError(factorsQuery.error, { fallbackMessage: t('errors.factors_loading_error') });
    }
  }, [factorsQuery.isError, factorsQuery.error, handleError, t]);

  useEffect(() => {
    if (!isEnrollDialogOpen) {
      setEnrollmentPhase(null);
      setEnrollmentSession(EMPTY_SESSION);
      setContact('');
      setOtpData({ barcodeUri: '', manualInputCode: '' });
      setRecoveryCode('');
    }
  }, [isEnrollDialogOpen]);

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
    (err: unknown, stage: typeof ENROLL | typeof CONFIRM) => {
      if (!isNotifiableError(err)) {
        handleError(err);
        return;
      }
      const label = stage === ENROLL ? t('enrollment') : t('confirmation');
      const error = normalizeError(err, {
        resolver: (code) => t(`errors.${enrollFactor}.${code}`, {}, t('errors.unexpected')),
      });
      toast.error(`${label} ${t('errors.failed', { message: error.message })}`);
      onErrorAction?.(error, stage);
    },
    [enrollFactor, handleError, onErrorAction, t],
  );

  const handleEnrollSuccess = useCallback(async () => {
    toast.success(t('enroll_factor'), {
      duration: 2000,
      onAutoClose: () => onEnroll?.(),
    });
    setIsEnrollDialogOpen(false);
    setEnrollFactor(null);
    await factorsQuery.refetch();
  }, [factorsQuery, onEnroll, t]);

  const verifyAndComplete = useCallback(
    async (params: Parameters<typeof verifyMutation.mutateAsync>[0]) => {
      try {
        await verifyMutation.mutateAsync(params);
        await handleEnrollSuccess();
      } catch (err) {
        handleEnrollError(err, CONFIRM);
      }
    },
    [verifyMutation, handleEnrollSuccess, handleEnrollError],
  );

  const handleRefreshFactors = useCallback(() => {
    factorsQuery.refetch();
  }, [factorsQuery]);

  const handleEnroll = useCallback(
    async (factor: MFAType) => {
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
        handleEnrollError(err, ENROLL);
        setIsEnrollDialogOpen(false);
        setEnrollFactor(null);
      }
    },
    [enrollMutation, handleEnrollError],
  );

  const handleCancelDelete = useCallback(() => {
    if (deleteMutation.isPending) return;
    setIsDeleteDialogOpen(false);
    setFactorToDelete(null);
  }, [deleteMutation.isPending]);

  const handleCloseEnrollDialog = useCallback(() => {
    setIsEnrollDialogOpen(false);
    if (enrollFactor === FACTOR_TYPE_PUSH_NOTIFICATION) {
      factorsQuery.refetch();
    }
    setEnrollFactor(null);
  }, [enrollFactor, factorsQuery]);

  const handleConfirmDelete = useCallback(
    async (factorId: string) => {
      try {
        await deleteMutation.mutateAsync(factorId);
        await factorsQuery.refetch();
        toast.success(t('remove_factor'), {
          duration: 2000,
          onAutoClose: () => onDelete?.(),
        });
      } catch (err) {
        onErrorAction?.(
          err instanceof Error ? err : new Error(t('errors.delete_factor')),
          'delete',
        );
        handleError(err, { fallbackMessage: t('errors.delete_factor') });
      } finally {
        setIsDeleteDialogOpen(false);
        setFactorToDelete(null);
      }
    },
    [deleteMutation, handleError, onDelete, onErrorAction, t],
  );

  const handleDeleteFactor = useCallback(
    async (factorId: string, factorType: MFAType) => {
      if (readOnly || disableDelete) return;
      if (onBeforeAction) {
        const canProceed = await onBeforeAction('delete', factorType);
        if (!canProceed) return;
        await handleConfirmDelete(factorId);
      } else {
        setFactorToDelete({ id: factorId, type: factorType });
        setIsDeleteDialogOpen(true);
      }
    },
    [readOnly, disableDelete, onBeforeAction, handleConfirmDelete],
  );

  const handleSendCode = useCallback(
    async (options: Record<string, string>) => {
      try {
        const enrollment = await enrollMutation.mutateAsync({ factorType: enrollFactor!, options });
        setContact(options.email ?? options.phone_number ?? '');
        setEnrollmentSession(extractSession(enrollment));
      } catch (err) {
        handleEnrollError(err, ENROLL);
      }
    },
    [enrollFactor, enrollMutation, handleEnrollError],
  );

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
      handleEnrollError(err, ENROLL);
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
    isEnrolling: enrollMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isConfirming: verifyMutation.isPending,
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
    handleRefreshFactors,
    handleEnroll,
    handleCloseEnrollDialog,
    handleDeleteFactor,
    handleConfirmDelete,
    handleSendCode,
    handleConfirmOtp,
    handleConfirmPush,
    handleConfirmRecoveryCode,
    handleEnterQRPhase,
  };
}
