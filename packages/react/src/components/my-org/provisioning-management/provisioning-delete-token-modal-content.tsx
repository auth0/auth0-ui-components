import React from 'react';

import { useTranslator } from '../../../hooks';
import { cn } from '../../../lib/theme-utils';
import type { ProvisioningDeleteTokenModalContentProps } from '../../../types/my-org/provisioning-management/provisioning-token-types';

/**
 * ProvisioningDeleteTokenModalContent Component
 *
 * A presentational component that displays informational text about deleting
 * a provisioning token. This component is designed to be used inside a modal
 * to provide context and warnings before the user confirms token deletion.
 */
export function ProvisioningDeleteTokenModalContent({
  customMessages = {},
  className,
  tokenId,
}: ProvisioningDeleteTokenModalContentProps) {
  const { t } = useTranslator('provisioning_management.delete_token.modal_content', customMessages);

  return (
    <div className={cn('space-y-4', className)}>
      <p className={cn('font-normal block text-sm text-left text-muted-foreground')}>
        {t('confirmation', { tokenId })}
      </p>
      <p className={cn('font-normal block text-sm text-left text-muted-foreground')}>
        {t('description')}
      </p>
    </div>
  );
}
