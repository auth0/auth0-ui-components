import {
  STRATEGY_DISPLAY_NAMES,
  type IdpBaseUserAttributeItem,
} from '@auth0/universal-components-core';
import { Info } from 'lucide-react';
import * as React from 'react';

import { useTranslator } from '../../../../hooks/use-translator';
import type { SsoProviderAttributeMappingsProps } from '../../../../types/my-organization/idp-management/sso-provider/sso-provider-edit-types';
import { Badge } from '../../../ui/badge';
import { CopyableTextField } from '../../../ui/copyable-text-field';
import type { Column } from '../../../ui/data-table';
import { Label } from '../../../ui/label';
import { Mapping } from '../../../ui/mapping';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../ui/tooltip';

const SCIM_NAMESPACE = 'urn:ietf:params:scim:schemas:core:2.0:User';

const CHANGE_STATUS = {
  CHANGED: 'changed',
  REMOVED: 'removed',
  NEW: 'new',
} as const;

type ChangeStatus = (typeof CHANGE_STATUS)[keyof typeof CHANGE_STATUS];

const STATUS_VARIANTS: Record<ChangeStatus, 'warning' | 'default'> = {
  [CHANGE_STATUS.CHANGED]: 'warning',
  [CHANGE_STATUS.REMOVED]: 'warning',
  [CHANGE_STATUS.NEW]: 'default',
};

const getChangeStatus = (item: IdpBaseUserAttributeItem): ChangeStatus | null => {
  const { is_extra: isRemoved, is_missing: isNew } = item;

  if (isRemoved && isNew) return CHANGE_STATUS.CHANGED;
  if (isRemoved) return CHANGE_STATUS.REMOVED;
  if (isNew) return CHANGE_STATUS.NEW;

  return null;
};

const AttributeNameCell = ({
  item,
  section,
  t,
}: {
  item: IdpBaseUserAttributeItem;
  section: 'required' | 'optional';
  t: (key: string) => string;
}) => {
  const status = getChangeStatus(item);

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="truncate text-sm font-medium">{item.label}</span>

      {item.description && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info
              className="h-4 w-4 text-muted-foreground shrink-0 cursor-help"
              aria-hidden="true"
            />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            {item.description}
          </TooltipContent>
        </Tooltip>
      )}

      {status && (
        <Badge
          variant={STATUS_VARIANTS[status]}
          size="sm"
          className="shrink-0 uppercase tracking-tight"
        >
          {t(`mappings.${section}.table.tags.${status}`)}
        </Badge>
      )}
    </div>
  );
};

export function SsoProviderAttributeMappings({
  userAttributeMap = [],
  strategy,
  isProvisioning = false,
  customMessages,
  className,
}: SsoProviderAttributeMappingsProps) {
  const { t } = useTranslator('idp_management.edit_sso_provider', customMessages);

  const strategyLabel = React.useMemo(() => {
    if (!strategy) return '';
    const knownStrategy = (STRATEGY_DISPLAY_NAMES as Record<string, string>)[strategy];
    return knownStrategy || strategy;
  }, [strategy]);

  const { requiredItems, optionalItems } = React.useMemo(() => {
    const required: IdpBaseUserAttributeItem[] = [];
    const optional: IdpBaseUserAttributeItem[] = [];

    userAttributeMap?.forEach((item) => {
      if (item.is_required) required.push(item);
      else optional.push(item);
    });

    return { requiredItems: required, optionalItems: optional };
  }, [userAttributeMap]);

  const getColumns = React.useCallback(
    (section: 'required' | 'optional'): Column<IdpBaseUserAttributeItem>[] => [
      {
        accessorKey: 'label',
        type: 'text',
        width: '30%',
        title: t(`mappings.${section}.table.columns.attribute_name_label`),
        render: (item) => <AttributeNameCell item={item} section={section} t={t} />,
      },
      {
        accessorKey: 'user_attribute',
        type: 'copy',
        width: '70%',
        title: t(`mappings.${section}.table.columns.external_field_label`),
      },
    ],
    [t],
  );

  return (
    <div className={className}>
      <Mapping
        title={t('mappings.title')}
        description={t(
          isProvisioning ? 'mappings.description' : 'mappings.description_provider_tab',
        )}
        expanded
        card={{
          title: t('mappings.required.title'),
          description: t('mappings.required.description', { strategy: strategyLabel }),
          table: {
            items: requiredItems,
            columns: getColumns('required'),
          },
        }}
        content={
          isProvisioning ? (
            <div className="space-y-1.5 pt-2">
              <Label className="text-sm font-medium">
                {t('mappings.external_namespace.label')}
              </Label>
              <CopyableTextField value={SCIM_NAMESPACE} readOnly />
            </div>
          ) : null
        }
      />

      {optionalItems.length > 0 && (
        <Mapping
          expanded
          card={{
            title: t('mappings.optional.title'),
            description: t('mappings.optional.description'),
            table: {
              items: optionalItems,
              columns: getColumns('optional'),
            },
          }}
          content={null}
        />
      )}
    </div>
  );
}
