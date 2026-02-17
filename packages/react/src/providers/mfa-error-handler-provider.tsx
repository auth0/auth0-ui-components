import type { MfaRequiredError } from '@auth0/universal-components-core';
import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface MfaErrorHandlerContextValue {
  handleMfaError: (error: MfaRequiredError, onRetry: () => void) => void;
}

const MfaErrorHandlerContext = createContext<MfaErrorHandlerContextValue | null>(null);

export function useMfaErrorHandler() {
  const context = useContext(MfaErrorHandlerContext);
  if (!context) {
    throw new Error('useMfaErrorHandler must be used within MfaErrorHandlerProvider');
  }
  return context;
}

/**
 * Global provider that handles MFA step-up authentication.
 * Shows MFA modal when MFA is required and retries operation after success.
 */
export const MfaErrorHandlerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mfaError, setMfaError] = useState<MfaRequiredError | null>(null);
  const [onRetry, setOnRetry] = useState<(() => void) | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleMfaError = useCallback((error: MfaRequiredError, retry: () => void) => {
    setMfaError(error);
    setOnRetry(() => retry);
    setIsOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    setIsOpen(false);
    setMfaError(null);
    if (onRetry) {
      onRetry();
    }
    setOnRetry(null);
  }, [onRetry]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setMfaError(null);
    setOnRetry(null);
  }, []);

  const contextValue = React.useMemo(() => ({ handleMfaError }), [handleMfaError]);

  return (
    <MfaErrorHandlerContext.Provider value={contextValue}>
      {children}
      {/* TODO: Replace with actual MfaStepUpDialog when implemented */}
      {mfaError && isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 9999,
          }}
        >
          <h2>MFA Required</h2>
          <p>Multi-factor authentication is required.</p>
          <p>
            <strong>Token:</strong> {mfaError.mfa_token}
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleSuccess} style={{ padding: '0.5rem 1rem' }}>
              Verify (Mock)
            </button>
            <button onClick={handleClose} style={{ padding: '0.5rem 1rem' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </MfaErrorHandlerContext.Provider>
  );
};
