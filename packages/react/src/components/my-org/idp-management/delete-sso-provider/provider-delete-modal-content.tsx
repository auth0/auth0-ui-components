import React from 'react';

import { Label } from '@/components/ui/label';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks';
import { cn } from '@/lib/theme-utils';
import type { SsoProviderDeleteModalContentProps } from '@/types/my-org/idp-management/delete-sso-provider-types';

export function SsoProviderDeleteModalContent({
  onChange,
  customMessages = {},
  className,
}: SsoProviderDeleteModalContentProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange('providerName', event.target.value);
  };

  const { t } = useTranslator('idp_management.delete_sso_provider.model_content', customMessages);

  return (
    <div className={className}>
      <p
        id="delete-modal-content-description"
        className={cn(
          'font-normal block text-sm text-left text-(length:--font-size-paragraph) text-muted-foreground mt-6 mb-6',
        )}
      >
        {t('description')}
      </p>
      <Label
        htmlFor="provider-name"
        className="text-sm text-(length:--font-size-label) font-medium"
      >
        {t('field.label')}
      </Label>
      <TextField
        id="provider-name"
        type="text"
        placeholder={t('field.placeholder')}
        onChange={handleInputChange}
        className="mt-2 mb-6"
      />
    </div>
  );
}
