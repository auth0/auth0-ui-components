/**
 * SSO provider delete section component.
 * @module provider-delete
 * @internal
 */

import * as React from 'react';

import { SsoProviderDeleteModal } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-delete/provider-delete-modal';
import { PermissionDeniedTooltip } from '@/components/auth0/shared/permission-denied-tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { SsoProviderDeleteProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-delete-types';

/**
 *
 * @param props - Component props.
 * @param props.provider - SSO provider object
 * @param props.onDelete - Callback fired when delete action is triggered
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.isLoading - Whether the component is in a loading state
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.permissionDenied - Whether the action is unavailable for lack of a scope
 * @returns JSX element
 */
export function SsoProviderDelete({
  provider,
  onDelete,
  customMessages = {},
  isLoading,
  readOnly,
  permissionDenied = false,
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
              <h3 className={cn('font-semibold text-left text-subtitle')}>
                {t('title', { providerName: provider.name })}
              </h3>
              <p className={cn('text-muted-foreground text-left text-paragraph')}>
                {t('description')}
              </p>
            </div>

            <PermissionDeniedTooltip
              customMessages={customMessages}
              enabled={permissionDenied}
              className="shrink-0"
            >
              <Button variant="destructive" onClick={openModal} disabled={readOnly}>
                {t('delete_button_label')}
              </Button>
            </PermissionDeniedTooltip>
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
