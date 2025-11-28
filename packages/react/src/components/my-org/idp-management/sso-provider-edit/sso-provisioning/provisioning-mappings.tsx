import { STRATEGY_DISPLAY_NAMES } from '@auth0/web-ui-components-core';

import { useTranslator } from '../../../../../hooks/use-translator';
import type { ProvisioningFieldMappingsProps } from '../../../../../types/my-org/idp-management/sso-provisioning/sso-provisioning-tab-types';
import { CopyableTextField } from '../../../../ui/copyable-text-field';
import type { Column } from '../../../../ui/data-table';
import { Label } from '../../../../ui/label';
import { Mapping } from '../../../../ui/mapping';

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

  const columns: Column<{ attribute: string; external: string }>[] = [
    {
      accessorKey: 'attribute',
      type: 'text',
      width: '40%',
      title: t('mappings.card.table.columns.attribute_name_label'),
    },
    {
      accessorKey: 'external',
      type: 'copy',
      width: '60%',
      title: t('mappings.card.table.columns.external_field_label'),
    },
  ];

  const items =
    provisioningFieldMap?.map((field) => ({
      attribute: field.provisioning_field,
      external: field.user_attribute,
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
