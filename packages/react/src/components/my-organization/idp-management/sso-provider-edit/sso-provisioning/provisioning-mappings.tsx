import { STRATEGY_DISPLAY_NAMES } from '@auth0/universal-components-core';
import { Info } from 'lucide-react';

import { useTranslator } from '../../../../../hooks/use-translator';
import type { ProvisioningFieldMappingsProps } from '../../../../../types/my-organization/idp-management/sso-provisioning/sso-provisioning-tab-types';
import { CopyableTextField } from '../../../../ui/copyable-text-field';
import type { Column } from '../../../../ui/data-table';
import { Label } from '../../../../ui/label';
import { Mapping } from '../../../../ui/mapping';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../../ui/tooltip';

export function ProvisioningFieldMappings({
  provisioningFieldMap,
  provisioningStrategy,
  customMessages,
  className,
}: ProvisioningFieldMappingsProps) {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.provisioning.content.details',
    customMessages,
  );

  const columns: Column<{ attribute: string; external: string; description: string }>[] = [
    {
      accessorKey: 'attribute',
      type: 'text',
      width: '30%',
      title: t('mappings.card.table.columns.attribute_name_label'),
      render: (provisioning) => (
        <div className="flex items-center justify-start gap-2 min-w-0">
          {provisioning.attribute}
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4" aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>{provisioning.description}</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
    {
      accessorKey: 'external',
      type: 'copy',
      width: '70%',
      title: t('mappings.card.table.columns.external_field_label'),
    },
  ];

  const items =
    provisioningFieldMap?.map((field) => ({
      attribute: field.label || '',
      external: field.provisioning_field,
      description: field.description || '',
    })) || [];

  let strategy = '';
  if (provisioningStrategy && provisioningStrategy in STRATEGY_DISPLAY_NAMES) {
    strategy = STRATEGY_DISPLAY_NAMES[provisioningStrategy];
  }
  return (
    <Mapping
      title={t('mappings.title')}
      description={t('mappings.description')}
      card={{
        title: t('mappings.card.title'),
        description: t('mappings.card.description', { strategy }),
        table: {
          items,
          columns,
        },
      }}
      content={
        <div className="space-y-2">
          <Label className="text-sm text-(length:--font-size-label) font-medium">
            {t('fields.external_namespace.label')}
          </Label>
          <CopyableTextField value="urn:ietf:params:scim:schemas:core:2.0:User" readOnly />
        </div>
      }
      className={className}
      expanded={true}
    />
  );
}
