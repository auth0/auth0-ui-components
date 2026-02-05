import type { Domain } from '@auth0/universal-components-core';
import React from 'react';

import { Modal } from '@/components/ui/modal';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { DomainDeleteModalProps } from '@/types/my-organization/domain-management/domain-delete-types';

const getDescriptionKey = (domain: Domain | null) => {
  return domain?.status === 'pending' ? 'description.pending' : 'description.verified';
};

export function DomainDeleteModal({
  translatorKey = 'domain_management.domain_delete.modal',
  className,
  customMessages,
  domain,
  isOpen,
  isLoading,
  onClose,
  onDelete,
}: DomainDeleteModalProps) {
  const { t } = useTranslator(translatorKey, customMessages);

  const handleDelete = React.useCallback(() => {
    if (domain) {
      onDelete(domain);
    }
  }, [onDelete, domain]);

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className={cn('p-10', className)}
      title={t('title')}
      content={
        <div className={'space-y-6'}>
          <p className="text-sm text-muted-foreground text-(length:--font-size-paragraph)">
            {t(getDescriptionKey(domain), { domainName: domain?.domain })}
          </p>
        </div>
      }
      modalActions={{
        isLoading,
        nextAction: {
          type: 'button',
          label: t('actions.delete_button_text'),
          variant: 'destructive',
          disabled: isLoading,
          onClick: handleDelete,
        },
        previousAction: {
          label: t('actions.cancel_button_text'),
          onClick: onClose,
        },
      }}
    />
  );
}
