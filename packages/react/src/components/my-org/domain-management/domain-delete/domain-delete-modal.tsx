import type { Domain } from '@auth0-web-ui-components/core';
import React from 'react';

import { useTranslator } from '../../../../hooks/use-translator';
import { cn } from '../../../../lib';
import type { DomainDeleteModalProps } from '../../../../types/my-org/domain-management/domain-delete-types';
import { Modal } from '../../../ui/modal';

const getDescriptionKey = (domain: Domain | null) => {
  return domain?.status === 'pending' ? 'description.pending' : 'description.verified';
};

export function DomainDeleteModal({
  className,
  customMessages,
  domain,
  isOpen,
  isLoading,
  onClose,
  onDelete,
}: DomainDeleteModalProps) {
  const { t } = useTranslator('domain_management.domain_delete.modal', customMessages);

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
          <p className="text-sm text-muted-foreground">
            {t(getDescriptionKey(domain), { domainName: domain?.domain })}
          </p>
        </div>
      }
      modalActions={{
        nextAction: {
          type: 'button',
          label: t('actions.delete_button_text'),
          variant: 'primary',
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
