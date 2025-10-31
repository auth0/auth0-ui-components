import { useTranslator } from '../../../../../hooks/use-translator';
import type { ProvisioningFieldMappingsProps } from '../../../../../types/my-org/idp-management/sso-provisioning/sso-provisioning-tab-types';
import type { Column } from '../../../../ui/data-table';
import { Mapping } from '../../../../ui/mapping';

export function ProvisioningFieldMappings({
  provisioningFieldMap,
  customMessages,
  className,
}: ProvisioningFieldMappingsProps) {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.provisioning.content.details.mappings',
    customMessages,
  );

  const columns: Column<{ attribute: string; external: string }>[] = [
    {
      accessorKey: 'attribute',
      type: 'text',
      width: '40%',
      title: t('card.table.columns.attribute_name_label'),
    },
    {
      accessorKey: 'external',
      type: 'copy',
      width: '60%',
      title: t('card.table.columns.external_field_label'),
    },
  ];

  const items =
    provisioningFieldMap?.map((field) => ({
      attribute: field.provisioning_field,
      external: field.user_attribute,
    })) || [];

  return (
    <Mapping
      title={t('title')}
      description={t('description')}
      card={{
        title: t('card.title'),
        description: t('card.description'),
        table: {
          items,
          columns,
        },
      }}
      className={className}
      expanded={true}
    />
  );
}
