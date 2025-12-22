import type { Domain, DomainTableState, DomainTableStateActions } from '@react/types';
import { useState } from 'react';

/**
 * Hook for managing Domain Table internal state
 * Use this hook when you want to manage the state yourself
 */
export function useDomainTableState(): DomainTableState & DomainTableStateActions {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [verifyError, setVerifyError] = useState<string | undefined>(undefined);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  return {
    verifyError,
    selectedDomain,
    showCreateModal,
    showConfigureModal,
    showVerifyModal,
    showDeleteModal,
    setShowCreateModal,
    setShowConfigureModal,
    setShowVerifyModal,
    setShowDeleteModal,
    setVerifyError,
    setSelectedDomain,
  };
}
