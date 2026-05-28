/**
 * Passkey management logic hook.
 * @module use-user-passkey
 */

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useUserPasskeyService } from '@/hooks/my-account/shared/services/use-user-passkey-service';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  Passkey,
  UseUserPasskeyOptions,
  UseUserPasskeyReturn,
} from '@/types/my-account/passkey/passkey-types';

type ActiveModal =
  | { mode: 'revoke'; passkey: Passkey }
  | { mode: 'rename'; passkey: Passkey }
  | null;

/**
 * Hook for passkey management UI state and handlers.
 * @param options - UseUserPasskeyOptions
 * @returns State and handlers for UserPasskeyMgmt.
 */
export function useUserPasskey({
  customMessages,
  addAction,
  revokeAction,
  renameAction,
  onFetch,
  onErrorAction,
}: UseUserPasskeyOptions): UseUserPasskeyReturn {
  const { t } = useTranslator('passkey', customMessages);
  const handleError = useErrorHandler();

  const { passkeysQuery, enrollMutation, revokeMutation, renameMutation } = useUserPasskeyService();

  const disableAdd = !!addAction?.disabled;
  const disableRename = !!renameAction?.disabled;
  const disableRevoke = !!revokeAction?.disabled;
  const readOnly = !passkeysQuery.isLoading && disableAdd && disableRename && disableRevoke;

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const isRevokeModalOpen = activeModal?.mode === 'revoke';
  const isRenameModalOpen = activeModal?.mode === 'rename';
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
      toast.success(t('success.add'), { duration: 2000 });
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
      toast.success(t('success.revoke'), { duration: 2000 });
    } catch (err) {
      handleError(err);
      onErrorAction?.(err as Error, 'revoke');
    } finally {
      setActiveModal(null);
    }
  }, [currentPasskey, revokeAction, revokeMutation, onErrorAction, t, handleError]);

  const handleRenamePasskey = useCallback(
    (passkey: Passkey) => {
      if (disableRename) return;
      if (renameAction?.onBefore && !renameAction.onBefore(passkey)) return;
      setActiveModal({ mode: 'rename', passkey });
    },
    [disableRename, renameAction],
  );

  const handleConfirmRename = useCallback(
    async (newName?: string) => {
      if (!currentPasskey || !newName) return;
      try {
        await renameMutation.mutateAsync({ id: currentPasskey.id, name: newName });
        renameAction?.onAfter?.(currentPasskey, newName);
        toast.success(t('success.rename'), { duration: 2000 });
      } catch (err) {
        handleError(err);
        onErrorAction?.(err as Error, 'rename');
      } finally {
        setActiveModal(null);
      }
    },
    [currentPasskey, renameAction, renameMutation, onErrorAction, t, handleError],
  );

  return {
    passkeys: passkeysQuery.data ?? [],
    isLoading: passkeysQuery.isLoading,
    isEnrolling: enrollMutation.isPending,
    isRevoking: revokeMutation.isPending,
    isRenaming: renameMutation.isPending,
    error: passkeysQuery.error?.message ?? null,
    disableAdd,
    disableRename,
    disableRevoke,
    readOnly,
    isRevokeModalOpen,
    isRenameModalOpen,
    currentPasskey,
    setIsRevokeModalOpen: closeModal,
    setIsRenameModalOpen: closeModal,
    handleAddPasskey,
    handleRevokePasskey,
    handleRenamePasskey,
    handleConfirmRevoke,
    handleConfirmRename,
  };
}
