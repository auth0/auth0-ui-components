'use client';

import { hasApiErrorBody, isBusinessError } from '@auth0/universal-components-core';
import * as React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { showToast } from '../components/ui/toast';

export interface ErrorHandlerContextValue {
  handleError: (
    error: unknown,
    options?: { fallbackMessage?: string; onRetry?: () => void },
  ) => void;
  isStepUpModalOpen: boolean;
  mfaToken: string | null;
  closeStepUpModal: () => void;
  completeStepUp: () => void;
}

export const ErrorHandlerContext = React.createContext<ErrorHandlerContextValue | null>(null);

export const ErrorHandlerProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = React.useState<{
    open: boolean;
    token: string | null;
    onRetry?: () => void;
  }>({
    open: false,
    token: null,
  });

  const handleError = React.useCallback(
    (error: unknown, options?: { fallbackMessage?: string; onRetry?: () => void }) => {
      if (
        hasApiErrorBody(error) &&
        (error.body as Record<string, unknown>)?.error === 'mfa_required'
      ) {
        setState({
          open: true,
          token: (error.body as { mfa_token: string }).mfa_token,
          onRetry: options?.onRetry,
        });
        return;
      }
      const msg = isBusinessError(error)
        ? error.message
        : hasApiErrorBody(error) && error.body?.detail
          ? error.body.detail
          : error instanceof Error
            ? error.message
            : (options?.fallbackMessage ?? 'An error occurred');
      showToast({ type: 'error', message: msg });
    },
    [],
  );

  const closeStepUpModal = React.useCallback(() => setState({ open: false, token: null }), []);
  const completeStepUp = React.useCallback(() => {
    state.onRetry?.();
    setState({ open: false, token: null });
  }, [state.onRetry]);

  return (
    <ErrorHandlerContext.Provider
      value={{
        handleError,
        isStepUpModalOpen: state.open,
        mfaToken: state.token,
        closeStepUpModal,
        completeStepUp,
      }}
    >
      {children}
      <Dialog open={state.open} onOpenChange={(open) => !open && closeStepUpModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Step-up Authentication Required</DialogTitle>
            <DialogDescription>Please verify your identity to continue.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </ErrorHandlerContext.Provider>
  );
};
