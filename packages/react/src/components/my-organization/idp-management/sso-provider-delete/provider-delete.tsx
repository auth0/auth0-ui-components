import * as React from 'react';

import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { useTranslator } from '../../../../hooks/use-translator';
import { cn } from '../../../../lib/theme-utils';
import type { SsoProviderDeleteProps } from '../../../../types/my-org/idp-management/sso-provider/sso-provider-delete-types';

import { SsoProviderDeleteModal } from './provider-delete-modal';

export function SsoProviderDelete({
  provider,
  onDelete,
  customMessages = {},
  isLoading,
  readOnly,
}: SsoProviderDeleteProps) {
  const { t } = useTranslator('idp_management.delete_sso_provider', customMessages);
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
                {t('title', { providerName: provider.name })}
              </h3>
              <p
                className={cn(
                  'text-sm text-muted-foreground text-left text-(length:--font-size-paragraph)',
                )}
              >
                {t('description')}
              </p>
            </div>

            <Button
              variant="destructive"
              onClick={openModal}
              disabled={readOnly}
              className="shrink-0"
            >
              {t('delete_button_label')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <SsoProviderDeleteModal
        isOpen={isModalOpen}
        onClose={closeModal}
        provider={provider}
        onDelete={onDelete}
        isLoading={isLoading}
        customMessages={customMessages.modal}
      />
    </>
  );
}
