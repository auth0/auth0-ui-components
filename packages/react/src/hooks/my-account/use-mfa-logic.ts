/**
 * MFA management logic hook.
 * @module use-mfa-logic
 * @internal
 */
import {
  FACTOR_TYPE_PUSH_NOTIFICATION,
  type MFAType,
  type Authenticator,
} from '@auth0/universal-components-core';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useTranslator } from '@/hooks/shared/use-translator';
import { ENROLL, type CONFIRM } from '@/lib/constants/my-account/mfa/mfa-constants';
import type { UseMFALogicOptions, UseMFALogicResult } from '@/types/my-account/mfa/mfa-types';

/**
 * Hook for MFA management logic (factor loading, enroll, delete, dialog state, etc).
 * @param options - UseMFALogicOptions
 * @returns logic state and handlers for UserMFAMgmt
 */
export function useMFALogic({
  readOnly,
  disableDelete,
  customMessages,
  factorConfig,
  fetchFactors,
  deleteMfa,
  showActiveOnly,
  onFetch,
  onEnroll,
  onDelete,
  onErrorAction,
  onBeforeAction,
}: UseMFALogicOptions): UseMFALogicResult {
  const { t } = useTranslator('mfa', customMessages);
  const [factorsByType, setFactorsByType] = useState<Record<MFAType, Authenticator[]>>(
    {} as Record<MFAType, Authenticator[]>,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingFactor, setIsDeletingFactor] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enrollFactor, setEnrollFactor] = useState<MFAType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [factorToDelete, setFactorToDelete] = useState<{ id: string; type: MFAType } | null>(null);

  /**
   * Loads the available MFA factors from the API and updates the state.
   * This is called on initial load and when factors need to be refreshed.
   */
  const loadFactors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const factors = await fetchFactors(showActiveOnly);
      setFactorsByType(factors as Record<MFAType, Authenticator[]>);
      onFetch?.();
    } catch (err) {
      setError(t('errors.factors_loading_error'));
    }

    setLoading(false);
  }, [fetchFactors, showActiveOnly, onFetch, onErrorAction]);

  /**
   * Get visible factor types based on configuration
   */
  const visibleFactorTypes = useMemo(() => {
    return (Object.keys(factorsByType) as MFAType[]).filter(
      (factorType) => factorConfig?.[factorType]?.visible !== false,
    );
  }, [factorsByType, factorConfig]);

  /**
   * Check if there are no active factors across all visible factor types
   */
  const hasNoActiveFactors = useMemo(() => {
    return visibleFactorTypes.every((type) => !factorsByType[type]?.some((f) => f.enrolled));
  }, [visibleFactorTypes, factorsByType]);

  /**
   * Handles the enrollment button click for a specific MFA factor.
   * Opens the enrollment dialog for the chosen factor.
   *
   * @param factor - The MFA factor type to be enrolled.
   */
  const handleEnroll = (factor: MFAType) => {
    setEnrollFactor(factor);
    setDialogOpen(true);
  };

  /**
   * Handles closing the enrollment dialog.
   * Reloads factors if closing a push notification enrollment to ensure
   * the latest enrollment state is reflected.
   */
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);

    // Reload factors if closing push notification enrollment
    if (enrollFactor === FACTOR_TYPE_PUSH_NOTIFICATION) {
      loadFactors();
    }

    setEnrollFactor(null);
  }, [enrollFactor, loadFactors]);

  /**
   * Handles the initial click on the delete button for an MFA factor.
   * This function either:
   * 1. Triggers the onBeforeAction callback and proceeds with deletion if approved
   * 2. Opens a confirmation dialog if no onBeforeAction is provided
   *
   * The function prevents deletion if:
   * - Component is in readonly mode
   * - Delete action is disabled
   * - onBeforeAction returns false
   *
   * @param factorId - The unique identifier of the MFA factor to delete
   * @param factorType - The type of MFA factor being deleted (e.g., 'sms', 'email', 'otp')
   * @returns A promise that resolves when the delete action completes
   */
  const handleDeleteFactor = useCallback(
    async (factorId: string, factorType: MFAType) => {
      if (readOnly || disableDelete) return;

      if (onBeforeAction) {
        // If onBeforeAction exists, proceed directly
        const canProceed = await onBeforeAction('delete', factorType);
        if (!canProceed) return;
        await handleConfirmDelete(factorId);
      } else {
        setFactorToDelete({ id: factorId, type: factorType });
        setIsDeleteDialogOpen(true);
      }
    },
    [readOnly, disableDelete, onBeforeAction],
  );

  /**
   * Handles the confirmation and execution of MFA factor deletion.
   * This callback is triggered when a user confirms the deletion in the confirmation dialog
   * or when deletion is approved through onBeforeAction.
   *
   * The function:
   * 1. Deletes the MFA factor
   * 2. Reloads the factors list
   * 3. Shows success/error notifications
   * 4. Handles cleanup of dialog and loading states
   *
   * @param factorId - The unique identifier of the MFA factor to delete
   * @throws When deletion fails or factors cannot be reloaded
   */
  const handleConfirmDelete = useCallback(
    async (factorId: string) => {
      setIsDeletingFactor(true);

      const cleanUp = () => {
        setIsDeletingFactor(false);
        setIsDeleteDialogOpen(false);
        setFactorToDelete(null);
      };

      try {
        await deleteMfa(factorId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(t('errors.delete_factor'));
        toast.error(t('errors.delete_factor'));
        onErrorAction?.(error, 'delete');
        cleanUp();
        return;
      }

      toast.success(t('remove_factor'), {
        duration: 2000,
        onAutoClose: () => onDelete?.(),
      });

      try {
        await loadFactors();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(t('errors.factors_loading_error'));
        onErrorAction?.(error, 'delete');
      } finally {
        cleanUp();
      }
    },
    [deleteMfa, loadFactors, onDelete, onErrorAction, t],
  );

  /**
   * Handles the successful enrollment of an MFA factor.
   * Displays a success toast notification, invokes the onEnroll callback,
   * and reloads the factors list to reflect the new enrollment.
   *
   * @returns A promise that resolves when the success handling is complete.
   */
  const handleEnrollSuccess = useCallback(async () => {
    setDialogOpen(false);
    setEnrollFactor(null);
    try {
      toast.success(t('enroll_factor'), {
        duration: 2000,
        onAutoClose: () => {
          onEnroll?.();
        },
      });
      await loadFactors();
    } catch {
      toast.dismiss();
      toast.error(t('errors.factors_loading_error'));
    }
  }, [loadFactors, onEnroll, t]);

  /**
   * Handles errors during the enrollment or confirmation process.
   * Displays an error toast notification and invokes the onErrorAction callback.
   *
   * @param error - The error object containing the failure message.
   * @param stage - The stage of the process where the error occurred ('enroll' or 'confirm').
   */
  const handleEnrollError = useCallback(
    (error: Error, stage: typeof ENROLL | typeof CONFIRM) => {
      toast.error(
        `${stage === ENROLL ? t('enrollment') : t('confirmation')} ${t('errors.failed', { message: error.message })}`,
      );
      onErrorAction?.(error, stage);
    },
    [onErrorAction, t],
  );
  return {
    // State
    factorsByType,
    loading,
    error,
    isDeletingFactor,
    dialogOpen,
    enrollFactor,
    isDeleteDialogOpen,
    factorToDelete,
    visibleFactorTypes,
    hasNoActiveFactors,

    // Setters
    setIsDeleteDialogOpen,
    setFactorToDelete,

    // Handlers
    loadFactors,
    handleEnroll,
    handleCloseDialog,
    handleDeleteFactor,
    handleConfirmDelete,
    handleEnrollSuccess,
    handleEnrollError,
  };
}
