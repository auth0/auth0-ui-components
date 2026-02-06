import * as React from 'react';

import { SsoProviderRemoveFromOrganizationModal } from './provider-remove-modal';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { SsoProviderRemoveFromOrganizationProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-delete-types';

export function SsoProviderRemoveFromOrganization({
  provider,
  organizationName,
  onRemove,
  customMessages = {},
  isLoading,
  readOnly,
}: SsoProviderRemoveFromOrganizationProps) {
  const { t } = useTranslator('idp_management.remove_sso_provider', customMessages);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const openModal = React.useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <>
      <div className={cn('w-full')}>
        <Card className="p-6">
          <CardContent className="flex items-start justify-between gap-6 p-0">
            <div className="flex-1 space-y-2">
              <h3
                className={cn('text-lg font-semibold text-left text-(length:--font-size-subtitle)')}
              >
                {t('title', {
                  providerName: provider.name,
                  organizationName: organizationName,
                })}
              </h3>
              <p
                className={cn(
                  'text-sm text-muted-foreground text-left text-(length:--font-size-paragraph)',
                )}
              >
                {t('description', { providerName: provider.name })}
              </p>
            </div>

            <Button
              variant="destructive"
              onClick={openModal}
              disabled={readOnly}
              className="shrink-0"
            >
              {t('remove_button_label')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <SsoProviderRemoveFromOrganizationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        provider={provider}
        organizationName={organizationName}
        onRemove={onRemove}
        isLoading={isLoading}
        customMessages={customMessages.modal}
      />
    </>
  );
}
