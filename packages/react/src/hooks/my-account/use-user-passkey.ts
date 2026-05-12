/**
 * Passkey management logic hook.
 * @module use-user-passkey
 */

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  Passkey,
  UseUserPasskeyOptions,
  UseUserPasskeyResult,
} from '@/types/my-account/passkey/passkey-types';

/**
 * Hook for passkey management UI state and handlers.
 * @param options - UseUserPasskeyOptions
 * @returns State and handlers for UserPasskeyMgmt.
 */
export function useUserPasskey({
  readOnly,
  disableRevoke,
  disableRename,
  customMessages,
  fetchPasskeys,
  enrollPasskey,
  revokePasskey,
  renamePasskey,
  onFetch,
  onSuccess,
  onError,
}: UseUserPasskeyOptions): UseUserPasskeyResult {
  const { t } = useTranslator('passkey', customMessages);
  const handleError = useErrorHandler();

  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [passkeyToRevoke, setPasskeyToRevoke] = useState<Passkey | null>(null);

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [passkeyToRename, setPasskeyToRename] = useState<Passkey | null>(null);

  const loadPasskeys = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchPasskeys();
      setPasskeys(result);
      onFetch?.();
    } catch (err) {
      setError(t('component_error_description'));
      handleError(err, { fallbackMessage: t('errors.loading_error') });
    } finally {
      setIsLoading(false);
    }
  }, [fetchPasskeys, onFetch, t, handleError]);

  const onAddPasskey = useCallback(async () => {
    if (readOnly) return;
    setIsEnrolling(true);
    try {
      await enrollPasskey();
      toast.success(t('add_success'), {
        duration: 2000,
        onAutoClose: () => onSuccess?.('add'),
      });
      await loadPasskeys();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(t('errors.add_failed'));
      handleError(err, { fallbackMessage: t('errors.add_failed') });
      onError?.(error, 'add');
    } finally {
      setIsEnrolling(false);
    }
  }, [readOnly, enrollPasskey, loadPasskeys, onSuccess, onError, t, handleError]);

  const onRevokePasskey = useCallback(
    (passkey: Passkey) => {
      if (readOnly || disableRevoke) return;
      setPasskeyToRevoke(passkey);
      setIsRevokeDialogOpen(true);
    },
    [readOnly, disableRevoke],
  );

  const handleConfirmRevoke = useCallback(async () => {
    if (!passkeyToRevoke) return;
    setIsRevoking(true);
    try {
      await revokePasskey(passkeyToRevoke.id);
      toast.success(t('revoke_success'), {
        duration: 2000,
        onAutoClose: () => onSuccess?.('revoke'),
      });
      await loadPasskeys();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(t('errors.revoke_failed'));
      handleError(err, { fallbackMessage: t('errors.revoke_failed') });
      onError?.(error, 'revoke');
    } finally {
      setIsRevoking(false);
      setIsRevokeDialogOpen(false);
      setPasskeyToRevoke(null);
    }
  }, [passkeyToRevoke, revokePasskey, loadPasskeys, onSuccess, onError, t, handleError]);

  const onRenamePasskey = useCallback(
    (passkey: Passkey) => {
      if (readOnly || disableRename) return;
      setPasskeyToRename(passkey);
      setIsRenameDialogOpen(true);
    },
    [readOnly, disableRename],
  );

  const handleConfirmRename = useCallback(
    async (newName: string) => {
      if (!passkeyToRename) return;
      setIsRenaming(true);
      try {
        await renamePasskey(passkeyToRename.id, newName);
        toast.success(t('rename_success'), {
          duration: 2000,
          onAutoClose: () => onSuccess?.('rename'),
        });
        await loadPasskeys();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(t('errors.rename_failed'));
        handleError(err, { fallbackMessage: t('errors.rename_failed') });
        onError?.(error, 'rename');
      } finally {
        setIsRenaming(false);
        setIsRenameDialogOpen(false);
        setPasskeyToRename(null);
      }
    },
    [passkeyToRename, renamePasskey, loadPasskeys, onSuccess, onError, t, handleError],
  );

  return {
    passkeys,
    isLoading,
    isEnrolling,
    isRevoking,
    isRenaming,
    error,
    isRevokeDialogOpen,
    passkeyToRevoke,
    isRenameDialogOpen,
    passkeyToRename,
    setIsRevokeDialogOpen,
    setIsRenameDialogOpen,
    loadPasskeys,
    onAddPasskey,
    onRevokePasskey,
    onRenamePasskey,
    handleConfirmRevoke,
    handleConfirmRename,
  };
}
