/**
 * SSO provider domains tab component.
 * @module sso-domain-tab
 * @internal
 */

import type { Domain } from '@auth0/universal-components-core';
import {
  DEFAULT_DOMAIN_VERIFICATION_MODE,
  getComponentStyles,
} from '@auth0/universal-components-core';
import { Info, Plus } from 'lucide-react';
import React from 'react';

import { SsoDomainAssignModal } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-domain-assign-modal';
import { SsoDomainTabActionsColumn } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-domain-tab-action-column';
import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { Header } from '@/components/auth0/shared/header';
import { RefreshIndicator } from '@/components/auth0/shared/refresh-indicator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useSsoDomainTab } from '@/hooks/my-organization/use-sso-domain-tab';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import {
  getAssociationBlockReason,
  getAssociationBlockReasonMessages,
  getStatusBadgeVariant,
  isDomainAssociationUnavailable,
  isLastRequiredDomainLocked,
  isRequiredDomainMissing,
} from '@/lib/utils/my-organization/domain-management/domain-management-utils';
import { getProviderAccess } from '@/lib/utils/my-organization/idp-management/idp-management-utils';
import type { SsoDomainsTabProps } from '@/types/my-organization/idp-management/sso-domain/sso-domain-tab-types';

/**
 * SsoDomainTab Component
 * @param props - Component props.
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.schema - Zod validation schema (unused; the tab no longer creates domains)
 * @param props.idpId - Identity provider ID
 * @param props.domains - Array of domains
 * @param props.provider - SSO provider object
 * @param props.domainVerificationMode - How the provider uses verified domains: `none` disables Assign, `required` keeps the last domain
 * @returns JSX element
 */
export function SsoDomainTab({
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  permissions,
  readOnly = false,
  idpId,
  domains,
  provider,
  domainVerificationMode = DEFAULT_DOMAIN_VERIFICATION_MODE,
}: SsoDomainsTabProps) {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.domains.content',
    customMessages,
  );
  const { t: tCommon } = useTranslator('common', customMessages?.common);

  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const {
    domainsList,
    availableDomains,
    isLoading,
    isRefetchingDomains,
    isDomainsStale,
    domainsUpdatedAt,
    refetchDomains,
    showAssignModal,
    setShowAssignModal,
    isAssigning,
    handleAssign,
    handleRemove,
    isUpdating,
    isUpdatingId,
  } = useSsoDomainTab(idpId, {
    customMessages,
    domains,
    provider,
    readOnly,
    domainVerificationMode,
  });

  const canManageProviderDomains = getProviderAccess(provider).canManageDomains;
  const lockLastDomain = isLastRequiredDomainLocked(domainVerificationMode, {
    is_enabled: provider?.is_enabled,
    domains: domainsList.map(({ domain }) => domain),
  });
  const isAssociationUnavailable = isDomainAssociationUnavailable(domainVerificationMode);
  const isVerifiedDomainMissing = isRequiredDomainMissing(domainVerificationMode, provider);

  const getAlertMessage = () => {
    if (isAssociationUnavailable) return t('alerts.domain_verification_none');
    if (isVerifiedDomainMissing) return t('alerts.domain_verification_required');
    if (lockLastDomain) return t('table.actions.last_verified_domain_tooltip');
    return null;
  };
  const alertMessage = getAlertMessage();

  const assignBlockReason = getAssociationBlockReason({
    hasPermission: permissions.canAssociateDomain,
    isProviderAccessRestricted: !canManageProviderDomains,
    isAssociationUnavailable,
    isLastDomainLocked: false,
  });
  const assignDisabledReason = assignBlockReason
    ? getAssociationBlockReasonMessages(t, tCommon)[assignBlockReason]
    : null;

  const columns: Column<Domain>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'domain',
        title: t('table.columns.name'),
        render: (domain) => (
          <div className="font-medium text-primary truncate">{domain.domain}</div>
        ),
      },
      {
        type: 'text',
        accessorKey: 'status',
        title: t('table.columns.status'),
        render: (domain) => (
          <Badge variant={getStatusBadgeVariant(domain.status)} size={'sm'}>
            {t(`table.domain_statuses.${domain.status}`)}
          </Badge>
        ),
      },
      {
        type: 'actions',
        title: '',
        render: (domain) => (
          <SsoDomainTabActionsColumn
            translatorKey="idp_management.edit_sso_provider.tabs.domains.content"
            permissions={permissions}
            readOnly={readOnly}
            isUpdating={isUpdating}
            isUpdatingId={isUpdatingId}
            customMessages={customMessages}
            idpName={provider?.display_name || provider?.name || undefined}
            onRemove={handleRemove}
            lockLastDomain={lockLastDomain}
            canManageProviderDomains={canManageProviderDomains}
            domain={domain}
          />
        ),
      },
    ],
    [
      t,
      permissions,
      readOnly,
      provider?.display_name,
      provider?.name,
      isUpdating,
      isUpdatingId,
      customMessages,
      handleRemove,
      lockLastDomain,
      canManageProviderDomains,
    ],
  );

  return (
    <div style={currentStyles.variables} className="space-y-8">
      {alertMessage && (
        <Alert variant="warning">
          <Info />
          <AlertDescription className="text-warning-foreground">{alertMessage}</AlertDescription>
        </Alert>
      )}
      <div className={currentStyles.classes?.['SsoDomainsTab-header']}>
        <Header
          title={t('title')}
          description={t('description')}
          actions={[
            {
              type: 'button',
              label: t('create_button_text'),
              onClick: () => setShowAssignModal(true),
              icon: Plus,
              hidden: readOnly,
              disabled: domains?.associateToProviderAction?.disabled || !!assignBlockReason,
              ...(assignDisabledReason
                ? {
                    description: assignDisabledReason,
                    tooltip: { content: assignDisabledReason },
                  }
                : {}),
            },
          ]}
        />
      </div>
      <div
        className={cn(
          'flex justify-end mb-8',
          currentStyles.classes?.['SsoDomainsTab-tableActions'],
        )}
      >
        <RefreshIndicator
          disabled={!permissions.canListDomains}
          isStale={isDomainsStale}
          isFetching={isRefetchingDomains}
          lastUpdatedAt={domainsUpdatedAt || undefined}
          customMessages={customMessages}
          onRefresh={refetchDomains}
        />
      </div>

      <DataTable
        columns={columns}
        data={domainsList}
        loading={isLoading}
        emptyState={{ title: t('table.empty_message') }}
        className={currentStyles.classes?.['SsoDomainsTab-table']}
      />

      <SsoDomainAssignModal
        className={currentStyles.classes?.['SsoDomainsTab-assignModal']}
        isOpen={showAssignModal}
        isLoading={isLoading}
        isAssigning={isAssigning}
        domains={availableDomains}
        onClose={() => setShowAssignModal(false)}
        onAssign={handleAssign}
        customMessages={customMessages.domain_assign}
      />
    </div>
  );
}
