/**
 * Organization connection group detail component.
 * @module organization-connection-group-detail
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import { ArrowLeft } from 'lucide-react';
import * as React from 'react';

import { OrganizationConnectionGroupAssignRolesModal } from '@/components/auth0/my-organization/shared/connection-group-management/connection-group-detail/organization-connection-group-assign-roles-modal';
import { OrganizationConnectionGroupRemoveRolesModal } from '@/components/auth0/my-organization/shared/connection-group-management/connection-group-detail/organization-connection-group-remove-roles-modal';
import { OrganizationConnectionGroupRolesTab } from '@/components/auth0/my-organization/shared/connection-group-management/connection-group-detail/organization-connection-group-roles-tab';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOrganizationConnectionGroupDetail } from '@/hooks/my-organization/use-organization-connection-group-detail';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  ConnectionGroupDetailRole,
  OrganizationConnectionGroupDetailProps,
  OrganizationConnectionGroupDetailViewProps,
} from '@/types/my-organization/connection-group-management/organization-connection-group-detail-types';

const EMPTY_MESSAGES: NonNullable<OrganizationConnectionGroupDetailProps['customMessages']> = {};

const DEFAULT_STYLING = {
  variables: { common: {}, light: {}, dark: {} },
  classes: {},
};

/**
 * View component for the organization connection group detail.
 * @param props - {@link OrganizationConnectionGroupDetailViewProps}
 * @returns The rendered connection group detail view element
 */
export function OrganizationConnectionGroupDetailView(
  props: OrganizationConnectionGroupDetailViewProps,
): React.JSX.Element {
  const {
    styling,
    customMessages,
    group,
    roles,
    availableRoles,
    selectedRoles,
    permissions,
    modalState,
    readOnly,
    isFetchingRoles,
    isSearchingRoles,
    isAssigningRoles,
    isRemovingRoles,
    setSelectedRoles,
    onRoleSearch,
    handleBack,
    openModal,
    closeModal,
    handleAssignRolesSubmit,
    handleRemoveRolesConfirm,
  } = props;

  const { isDarkMode } = useTheme();
  const { t } = useTranslator('connection_group_management.detail', customMessages);
  const { t: tCommon } = useTranslator('common');
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const handleAssignClick = React.useCallback(
    () => openModal({ type: 'assignRoles' }),
    [openModal],
  );
  const handleRemoveClick = React.useCallback(
    (rolesToRemove: ConnectionGroupDetailRole[]) =>
      openModal({ type: 'removeRoles', roles: rolesToRemove }),
    [openModal],
  );

  // Keep the last roles to remove so the dialog body doesn't empty during the close animation.
  const lastRemoveRolesRef = React.useRef<ConnectionGroupDetailRole[]>([]);
  if (modalState?.type === 'removeRoles') {
    lastRemoveRolesRef.current = modalState.roles;
  }

  const backButton = (
    <Button
      variant="ghost"
      size="sm"
      className="mb-4 -ml-2 text-muted-foreground hover:text-primary"
      onClick={handleBack}
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      {t('back_button')}
    </Button>
  );

  return (
    <StyledScope style={currentStyles.variables}>
      <div className={currentStyles.classes?.['OrganizationConnectionGroupDetail-root']}>
        <div className={currentStyles.classes?.['OrganizationConnectionGroupDetail-header']}>
          {backButton}
          <div className="flex flex-col gap-1 min-w-0 mb-8">
            <h1 className="text-heading font-bold text-primary truncate">{group.name}</h1>
            {group.source && (
              <span className="text-sm flex items-center gap-2">
                {t('sources_label')}
                <Badge variant="secondary" className="w-fit text-xs">
                  {group.source}
                </Badge>
              </span>
            )}
          </div>
        </div>

        <section className={currentStyles.classes?.['OrganizationConnectionGroupDetail-rolesTab']}>
          {permissions.canViewRoles ? (
            <OrganizationConnectionGroupRolesTab
              roles={roles}
              selectedRoles={selectedRoles}
              permissions={permissions}
              readOnly={readOnly}
              isLoading={isFetchingRoles}
              customMessages={customMessages}
              classes={currentStyles.classes}
              onSelectedRowsChange={setSelectedRoles}
              onAssignClick={handleAssignClick}
              onRemoveClick={handleRemoveClick}
            />
          ) : (
            <div
              className="flex flex-col items-center justify-center p-8"
              role="alert"
              aria-live="polite"
            >
              <p className="text-center text-muted-foreground">{tCommon('error.forbidden')}</p>
            </div>
          )}
        </section>

        <OrganizationConnectionGroupAssignRolesModal
          isOpen={modalState?.type === 'assignRoles'}
          isLoading={isAssigningRoles}
          isSearchingRoles={isSearchingRoles}
          availableRoles={availableRoles}
          assignedRoles={roles}
          customMessages={customMessages}
          classes={currentStyles.classes}
          style={currentStyles.variables}
          onClose={closeModal}
          onAssign={handleAssignRolesSubmit}
          onRoleSearch={onRoleSearch}
        />

        <OrganizationConnectionGroupRemoveRolesModal
          isOpen={modalState?.type === 'removeRoles'}
          isLoading={isRemovingRoles}
          roles={lastRemoveRolesRef.current}
          groupName={group.name}
          customMessages={customMessages}
          classes={currentStyles.classes}
          style={currentStyles.variables}
          onClose={closeModal}
          onConfirm={handleRemoveRolesConfirm}
        />
      </div>
    </StyledScope>
  );
}

/**
 * Smart component for the organization connection group detail. Loads the group's
 * roles, and renders {@link OrganizationConnectionGroupDetailView}.
 * @param props - {@link OrganizationConnectionGroupDetailProps}
 * @returns The rendered connection group detail element
 * @example
 * ```tsx
 * <OrganizationConnectionGroupDetail group={group} onBack={() => router.back()} />
 * ```
 */
export function OrganizationConnectionGroupDetail(
  props: OrganizationConnectionGroupDetailProps,
): React.JSX.Element {
  useTelemetry('connection-group-detail');

  const {
    group,
    onBack,
    customMessages = EMPTY_MESSAGES,
    styling = DEFAULT_STYLING,
    readOnly = false,
    assignRolesAction,
    removeRolesAction,
  } = props;

  const detail = useOrganizationConnectionGroupDetail({
    groupId: group.id,
    onBack,
    customMessages,
    readOnly,
    assignRolesAction,
    removeRolesAction,
  });

  return (
    <GateKeeper styling={styling}>
      <OrganizationConnectionGroupDetailView
        {...detail}
        group={group}
        styling={styling}
        readOnly={readOnly}
        customMessages={customMessages}
      />
    </GateKeeper>
  );
}
