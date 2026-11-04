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
  PasskeyActionModel,
  UseUserPasskeyModelOptions,
  UseUserPasskeyOptions,
  UseUserPasskeyReturn,
  UserPasskeyModel,
} from '@/types/my-account/user-passkey-management/user-passkey-management-types';

type ActiveModal = { mode: 'revoke'; passkey: Passkey } | null;

/**
 * Hook for passkey management UI state and handlers.
 * @param options - UseUserPasskeyOptions
 * @returns State and handlers for UserPasskeyManagement.
 */
export function useUserPasskey({
  customMessages,
  addAction,
  revokeAction,
  onFetch,
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
    }
  }, [disableAdd, addAction, enrollMutation, t, handleError]);

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
    } finally {
      setActiveModal(null);
    }
  }, [currentPasskey, revokeAction, revokeMutation, t, handleError]);

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

/**
 * Adds prop getters to passkey state. Pure, so the presentational view can build
 * the same model from props as `useUserPasskeyModel` builds from the API.
 * @param state - Passkey state and handlers.
 * @returns The headless passkey model.
 * @internal
 */
export function createUserPasskeyModel(state: UseUserPasskeyReturn): UserPasskeyModel {
  const action = (
    model: Omit<PasskeyActionModel, 'onClick'>,
    run: () => void,
  ): PasskeyActionModel => ({
    ...model,
    onClick: () => {
      if (!model.hidden && !model.disabled && !model.pending) run();
    },
  });

  return {
    ...state,
    hasPasskeys: state.passkeys.length > 0,
    getAddActionProps: () =>
      action(
        { hidden: state.disableAdd, disabled: state.isLoading, pending: state.isEnrolling },
        () => void state.handleAddPasskey(),
      ),
    getItemProps: (passkey: Passkey) => ({
      passkey,
      revokeAction: action(
        {
          hidden: state.disableRevoke,
          disabled: false,
          pending: state.isRevoking && state.currentPasskey?.id === passkey.id,
        },
        () => state.handleRevokePasskey(passkey),
      ),
    }),
  };
}

/**
 * Headless passkey management model: data, mutations, state flags, prop getters
 * and the revoke confirmation state. The host owns all markup.
 *
 * @param options - {@link UseUserPasskeyModelOptions}
 * @returns The passkey model, see {@link UserPasskeyModel}.
 *
 * @example
 * ```tsx
 * const model = useUserPasskeyModel({ revokeAction: { onAfter: track } });
 * const add = model.getAddActionProps();
 * return add.hidden ? null : (
 *   <HostButton onClick={add.onClick} disabled={add.disabled} loading={add.pending} />
 * );
 * ```
 */
export function useUserPasskeyModel(options: UseUserPasskeyModelOptions = {}): UserPasskeyModel {
  return createUserPasskeyModel(useUserPasskey(options));
}
