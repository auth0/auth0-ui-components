/**
 * User MFA management hook.
 * @module use-user-mfa
 */

import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_PHONE,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_RECOVERY_CODE,
  FACTOR_TYPE_TOTP,
  isNotifiableError,
  normalizeError,
  type Authenticator,
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

const INITIAL_PHASE_MAP: Partial<Record<MFAType, EnrollmentPhase>> = {
  [FACTOR_TYPE_EMAIL]: ENTER_CONTACT,
  [FACTOR_TYPE_PHONE]: ENTER_CONTACT,
  [FACTOR_TYPE_PUSH_NOTIFICATION]: QR_PHASE_INSTALLATION,
  [FACTOR_TYPE_TOTP]: ENTER_QR,
  [FACTOR_TYPE_RECOVERY_CODE]: SHOW_RECOVERY_CODE,
};

const EMPTY_SESSION = { authSession: '', authenticationMethodId: '' };

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
  const { factorsQuery, enrollMutation, deleteMutation, confirmEnrollmentMutation } =
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
    } else if (enrollFactor) {
      setEnrollmentPhase(INITIAL_PHASE_MAP[enrollFactor] ?? null);
    }
  }, [isEnrollDialogOpen, enrollFactor]);

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

  const notifyEnrollError = useCallback(
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

  const completeEnrollment = useCallback(async () => {
    toast.success(t('enroll_factor'), {
      duration: 2000,
      onAutoClose: () => onEnroll?.(),
    });
    setIsEnrollDialogOpen(false);
    setEnrollFactor(null);
    await factorsQuery.refetch();
  }, [factorsQuery, onEnroll, t]);

  const confirmAndComplete = useCallback(
    async (params: Parameters<typeof confirmEnrollmentMutation.mutateAsync>[0]) => {
      try {
        await confirmEnrollmentMutation.mutateAsync(params);
        await completeEnrollment();
      } catch (err) {
        notifyEnrollError(err, CONFIRM);
      }
    },
    [confirmEnrollmentMutation, completeEnrollment, notifyEnrollError],
  );

  // Auto-fetch enrollment data when entering SHOW_RECOVERY_CODE or ENTER_QR
  useEffect(() => {
    if (enrollmentPhase !== SHOW_RECOVERY_CODE && enrollmentPhase !== ENTER_QR) return;
    if (!enrollFactor) return;
    if (enrollmentPhase === ENTER_QR && otpData.barcodeUri) return;

    const fetchEnrollmentData = async () => {
      try {
        const enrollment = await enrollMutation.mutateAsync({
          factorType: enrollFactor!,
          options: {},
        });
        setEnrollmentSession({
          authSession: 'auth_session' in enrollment ? enrollment.auth_session : '',
          authenticationMethodId: 'id' in enrollment ? enrollment.id : '',
        });
        if (enrollmentPhase === SHOW_RECOVERY_CODE) {
          setRecoveryCode('recovery_code' in enrollment ? enrollment.recovery_code : '');
        } else {
          setOtpData({
            barcodeUri: 'barcode_uri' in enrollment ? enrollment.barcode_uri : '',
            manualInputCode:
              'manual_input_code' in enrollment ? (enrollment.manual_input_code ?? '') : '',
          });
        }
      } catch (err) {
        notifyEnrollError(err, ENROLL);
        setIsEnrollDialogOpen(false);
        setEnrollFactor(null);
      }
    };

    fetchEnrollmentData();
  }, [enrollmentPhase]);

  const refreshFactors = useCallback(() => {
    factorsQuery.refetch();
  }, [factorsQuery]);

  const handleEnroll = useCallback((factor: MFAType) => {
    setEnrollFactor(factor);
    setIsEnrollDialogOpen(true);
  }, []);

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

  const handleSubmitContact = useCallback(
    async (options: Record<string, string>) => {
      try {
        const enrollment = await enrollMutation.mutateAsync({ factorType: enrollFactor!, options });
        setContact(options.email ?? options.phone_number ?? '');
        setEnrollmentSession({
          authSession: 'auth_session' in enrollment ? enrollment.auth_session : '',
          authenticationMethodId: 'id' in enrollment ? enrollment.id : '',
        });
      } catch (err) {
        notifyEnrollError(err, ENROLL);
      }
    },
    [enrollFactor, enrollMutation, notifyEnrollError],
  );

  const handleConfirmOtp = useCallback(
    (otpCode: string) =>
      confirmAndComplete({
        factorType: enrollFactor!,
        authSession: enrollmentSession.authSession,
        authenticationMethodId: enrollmentSession.authenticationMethodId,
        options: { userOtpCode: otpCode },
      }),
    [enrollFactor, enrollmentSession, confirmAndComplete],
  );

  const handleContinueQR = useCallback(async () => {
    if (enrollFactor !== FACTOR_TYPE_PUSH_NOTIFICATION) return;
    await confirmAndComplete({
      factorType: enrollFactor,
      authSession: enrollmentSession.authSession,
      authenticationMethodId: enrollmentSession.authenticationMethodId,
      options: {},
    });
  }, [enrollFactor, enrollmentSession, confirmAndComplete]);

  const handleConfirmRecoveryCode = useCallback(
    () =>
      confirmAndComplete({
        factorType: enrollFactor!,
        authSession: enrollmentSession.authSession,
        authenticationMethodId: enrollmentSession.authenticationMethodId,
        options: {},
      }),
    [enrollFactor, enrollmentSession, confirmAndComplete],
  );

  const handleAdvanceToQR = useCallback(() => {
    setEnrollmentPhase(ENTER_QR);
  }, []);

  return {
    factorsByType,
    isLoadingFactors: factorsQuery.isLoading,
    isEnrolling: enrollMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isConfirming: confirmEnrollmentMutation.isPending,
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
    refreshFactors,
    handleEnroll,
    handleCloseEnrollDialog,
    handleDeleteFactor,
    handleConfirmDelete,
    handleSubmitContact,
    handleConfirmOtp,
    handleContinueQR,
    handleConfirmRecoveryCode,
    handleAdvanceToQR,
  };
}
