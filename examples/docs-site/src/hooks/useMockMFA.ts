import { useContext } from 'react';

import { MockMFAContext } from '../components/MockMFAProvider';

// Hook to use mock MFA context
export function useMockMFA() {
  const context = useContext(MockMFAContext);
  if (!context) {
    throw new Error('useMockMFA must be used within a MockMFAProvider');
  }
  return context;
}
