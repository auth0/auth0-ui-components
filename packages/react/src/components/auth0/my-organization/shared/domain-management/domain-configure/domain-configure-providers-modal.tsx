import type { IdentityProviderAssociatedWithDomain } from '@auth0/universal-components-core';
import React from 'react';

import { Button } from '@/components/ui/button';
import { type Column, DataTable } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { DomainConfigureProvidersModalProps } from '@/types/my-organization/domain-management/domain-configure-types';

export function DomainConfigureProvidersModal({
  className,
  customMessages,
  domain,
  providers,
  isOpen,
  isLoading,
  isLoadingSwitch,
  onClose,
  onToggleSwitch,
  onOpenProvider,
  onCreateProvider,
}: DomainConfigureProvidersModalProps) {
  const { t } = useTranslator('domain_management.domain_configure_providers.modal', customMessages);

  const handleToggleSwitch = React.useCallback(
    (provider: IdentityProviderAssociatedWithDomain, newCheckedValue: boolean) => {
      onToggleSwitch(domain!, provider, newCheckedValue); // Switch component is not rendered if domain is null
    },
    [domain, onToggleSwitch],
  );

  const columns: Column<IdentityProviderAssociatedWithDomain>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'display_name',
        title: t('table.columns.name'),
        width: '25%',
        render: (provider) => <div className="font-medium">{provider.display_name}</div>,
      },
      {
        type: 'text',
        accessorKey: 'strategy',
        title: t('table.columns.provider'),
        width: '40%',
        render: (provider) => <div className="text-muted-foreground">{provider.strategy}</div>,
      },
      {
        type: 'actions',
        title: '',
        width: '30%',
        render: (provider) => (
          <div className="flex items-center justify-end gap-4 min-w-0">
            {onOpenProvider && (
              <Button
                type="button"
                variant={'outline'}
                size={'sm'}
                onClick={() => onOpenProvider(provider)}
              >
                {t('table.actions.view_provider_button_text')}
              </Button>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Switch
                  checked={provider.is_associated ?? false}
                  onCheckedChange={(checked) => handleToggleSwitch(provider, checked)}
                  disabled={isLoadingSwitch}
                />
              </TooltipTrigger>
              <TooltipContent>
                {provider.is_associated
                  ? t('table.actions.disable_provider_tooltip')
                  : t('table.actions.enable_provider_tooltip')}
              </TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [t, onOpenProvider, isLoadingSwitch, handleToggleSwitch],
  );

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="p-10"
      title={t('title', { domain: domain?.domain ?? '' })}
      content={
        domain && (
          <div className={cn('space-y-6', className)}>
            <p className="text-sm text-muted-foreground text-(length:--font-size-paragraph)">
              {t('description', { domain: domain?.domain ?? '' })}
            </p>
            <DataTable
              columns={columns}
              data={providers}
              loading={isLoading}
              emptyState={{
                title: t('table.empty_message'),
                action: onCreateProvider
                  ? {
                      label: t('table.actions.add_provider_button_text'),
                      variant: 'outline',
                      onClick: onCreateProvider,
                    }
                  : undefined,
              }}
            />
          </div>
        )
      }
      modalActions={{
        showNext: false,
        previousAction: {
          label: t('actions.close_button_text'),
          onClick: onClose,
        },
      }}
    />
  );
}
