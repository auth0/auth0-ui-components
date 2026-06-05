/**
 * Passkey management logic hook.
 * @module use-user-passkey
 */

import { useCallback, useEffect, useState } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useUserPasskeyService } from '@/hooks/my-account/shared/services/use-user-passkey-service';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  Passkey,
  UseUserPasskeyOptions,
  UseUserPasskeyReturn,
} from '@/types/my-account/passkey/passkey-types';

type ActiveModal = { mode: 'revoke'; passkey: Passkey } | null;

/**
 * Hook for passkey management UI state and handlers.
 * @param options - UseUserPasskeyOptions
 * @returns State and handlers for UserPasskeyMgmt.
 */
export function useUserPasskey({
  customMessages,
  addAction,
  revokeAction,
  onFetch,
  onErrorAction,
}: UseUserPasskeyOptions): UseUserPasskeyReturn {
  const { t } = useTranslator('passkey', customMessages);
  const handleError = useErrorHandler();

  const { passkeysQuery, enrollMutation, revokeMutation } = useUserPasskeyService();

  const disableAdd = !!addAction?.disabled;
  const disableRevoke = !!revokeAction?.disabled;
  const readOnly = !passkeysQuery.isLoading && disableAdd && disableRevoke;

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const isRevokeModalOpen = activeModal?.mode === 'revoke';
  const currentPasskey = activeModal?.passkey ?? null;

  const closeModal = useCallback((open: boolean) => {
    if (!open) setActiveModal(null);
  }, []);

  useEffect(() => {
    if (passkeysQuery.isSuccess) onFetch?.();
  }, [passkeysQuery.isSuccess, onFetch]);

  useEffect(() => {
    if (passkeysQuery.isError) {
      handleError(passkeysQuery.error);
    }
  }, [passkeysQuery.isError, passkeysQuery.error, handleError]);

  const handleAddPasskey = useCallback(async () => {
    if (disableAdd) return;
    if (addAction?.onBefore && !addAction.onBefore()) return;
    try {
      const enrolled = await enrollMutation.mutateAsync();
      if (!enrolled) return;
      addAction?.onAfter?.();
      showToast({ type: 'success', message: t('success.add') });
    } catch (err) {
      handleError(err);
      onErrorAction?.(err as Error, 'add');
    }
  }, [disableAdd, addAction, enrollMutation, onErrorAction, t, handleError]);

  const handleRevokePasskey = useCallback(
    (passkey: Passkey) => {
      if (disableRevoke) return;
      if (revokeAction?.onBefore && !revokeAction.onBefore(passkey)) return;
      setActiveModal({ mode: 'revoke', passkey });
    },
    [disableRevoke, revokeAction],
  );

  const handleConfirmRevoke = useCallback(async () => {
    if (!currentPasskey) return;
    try {
      await revokeMutation.mutateAsync(currentPasskey.id);
      revokeAction?.onAfter?.(currentPasskey);
      showToast({ type: 'success', message: t('success.revoke') });
    } catch (err) {
      handleError(err);
      onErrorAction?.(err as Error, 'revoke');
    } finally {
      setActiveModal(null);
    }
  }, [currentPasskey, revokeAction, revokeMutation, onErrorAction, t, handleError]);

  return {
    passkeys: passkeysQuery.data ?? [],
    isLoading: passkeysQuery.isLoading,
    isEnrolling: enrollMutation.isPending,
    isRevoking: revokeMutation.isPending,
    disableAdd,
    disableRevoke,
    readOnly,
    isRevokeModalOpen,
    currentPasskey,
    setIsRevokeModalOpen: closeModal,
    handleAddPasskey,
    handleRevokePasskey,
    handleConfirmRevoke,
  };
}
