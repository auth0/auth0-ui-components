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

  const disableAdd = !!addAction?.disabled;
  const disableRename = !!renameAction?.disabled;
  const disableRevoke = !!revokeAction?.disabled;
  const readOnly = disableAdd && disableRename && disableRevoke;
  const { passkeysQuery, enrollMutation, revokeMutation, renameMutation } = useUserPasskeyService();

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const isRevokeDialogOpen = activeModal?.mode === 'revoke';
  const isRenameDialogOpen = activeModal?.mode === 'rename';
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
      await enrollMutation.mutateAsync();
      addAction?.onAfter?.();
      toast.success(t('add_success'), { duration: 2000 });
      await passkeysQuery.refetch();
    } catch (err) {
      handleError(err);
      onErrorAction?.(err as Error, 'add');
    }
  }, [disableAdd, addAction, enrollMutation, passkeysQuery, onErrorAction, t, handleError]);

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
      toast.success(t('revoke_success'), { duration: 2000 });
      await passkeysQuery.refetch();
    } catch (err) {
      handleError(err);
      onErrorAction?.(err as Error, 'revoke');
    } finally {
      setActiveModal(null);
    }
  }, [currentPasskey, revokeAction, revokeMutation, passkeysQuery, onErrorAction, t, handleError]);

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
        toast.success(t('rename_success'), { duration: 2000 });
        await passkeysQuery.refetch();
      } catch (err) {
        handleError(err);
        onErrorAction?.(err as Error, 'rename');
      } finally {
        setActiveModal(null);
      }
    },
    [currentPasskey, renameAction, renameMutation, passkeysQuery, onErrorAction, t, handleError],
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
    isRevokeDialogOpen,
    isRenameDialogOpen,
    currentPasskey,
    setIsRevokeDialogOpen: closeModal,
    setIsRenameDialogOpen: closeModal,
    handleAddPasskey,
    handleRevokePasskey,
    handleRenamePasskey,
    handleConfirmRevoke,
    handleConfirmRename,
  };
}
