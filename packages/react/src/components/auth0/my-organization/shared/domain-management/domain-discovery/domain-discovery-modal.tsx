/**
 * Modal shown after a domain is verified, asking whether to use it for discovery.
 * @module domain-discovery-modal
 * @internal
 */

import React from 'react';

import { Modal } from '@/components/ui/modal';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { DomainDiscoveryModalProps } from '@/types/my-organization/domain-management/domain-discovery-types';

/**
 *
 * @param props - Component props.
 * @param props.translatorKey - Translation namespace key
 * @param props.className - Optional CSS class name for styling
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.domain - The domain that was just verified
 * @param props.isOpen - Whether the modal/dialog is open
 * @param props.isLoading - Whether the component is in a loading state
 * @param props.onClose - Callback fired when the modal is dismissed ("Not now")
 * @param props.onEnable - Callback fired when the user opts in
 * @returns JSX element
 */
export function DomainDiscoveryModal({
  translatorKey = 'domain_management.domain_discovery.modal',
  className,
  customMessages,
  domain,
  isOpen,
  isLoading,
  onClose,
  onEnable,
}: DomainDiscoveryModalProps) {
  const { t } = useTranslator(translatorKey, customMessages);

  const handleUse = React.useCallback(() => {
    if (domain) {
      onEnable(domain);
    }
  }, [domain, onEnable]);

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={cn('p-10', className)}
      title={t('title')}
      description={t('description', { domainName: domain?.domain })}
      modalActions={{
        isLoading,
        nextAction: {
          type: 'button',
          label: t('actions.use_button_text'),
          variant: 'primary',
          disabled: isLoading,
          onClick: handleUse,
        },
        previousAction: {
          label: t('actions.not_now_button_text'),
          onClick: onClose,
        },
      }}
    />
  );
}
