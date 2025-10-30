import React from 'react';

import { useTranslator } from '../../../../../../hooks';
import { cn } from '../../../../../../lib/theme-utils';
import type { ProvisioningCreateTokenModalContentProps } from '../../../../../../types/my-org/idp-management/sso-provisioning/provisioning-token-types';
import { CopyableTextField } from '../../../../../ui/copyable-text-field';
import { Label } from '../../../../../ui/label';

export function ProvisioningCreateTokenModalContent({
  token,
  tokenId,
  customMessages = {},
  className,
}: ProvisioningCreateTokenModalContentProps) {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.provisioning.content.manage_tokens.create_modal.content',
    customMessages,
  );

  return (
    <div className={cn('space-y-4', className)}>
      <p className={cn('text-sm text-muted-foreground text-(length:--font-size-paragraph)')}>
        {t('description')}
      </p>
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
