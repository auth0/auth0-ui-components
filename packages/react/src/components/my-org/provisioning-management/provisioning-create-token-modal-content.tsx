import React from 'react';

import { CopyableTextField } from '../../../components/ui/copyable-text-field';
import { Label } from '../../../components/ui/label';
import { useTranslator } from '../../../hooks';
import { cn } from '../../../lib/theme-utils';
import type { ProvisioningCreateTokenModalContentProps } from '../../../types/my-org/provisioning-management/provisioning-token-types';

/**
 * ProvisioningCreateTokenModalContent Component
 *
 * A presentational component that displays a disabled input field with a copy button
 * to show a newly created provisioning token. This component is designed to be used
 * inside a modal to display token information that needs to be copied.
 */
export function ProvisioningCreateTokenModalContent({
  token,
  tokenId,
  customMessages = {},
  className,
}: ProvisioningCreateTokenModalContentProps) {
  const { t } = useTranslator('provisioning_management.create_token.modal_content', customMessages);

  return (
    <div className={cn('space-y-4', className)}>
      <p className="text-sm text-muted-foreground">{t('description')}</p>
      <div className="space-y-2">
        <Label htmlFor="provisioning-token" className="text-sm font-medium text-foreground">
          {t('field.label')} {tokenId}
        </Label>
        <CopyableTextField
          id="provisioning-token"
          type="text"
          value={token}
          readOnly
          className="w-full"
          aria-label={`${t('field.label')} ${tokenId}`}
        />
      </div>
    </div>
  );
}
