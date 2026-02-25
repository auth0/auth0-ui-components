/**
 * Organization invitation tab component.
 * @module organization-invitation-tab
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import {
  OrganizationInvitationTable,
  OrganizationInvitationCreateModal,
  OrganizationInvitationDetailsModal,
  OrganizationInvitationRevokeModal,
} from '@/components/auth0/my-organization/shared/invitation-management';
import { Header } from '@/components/auth0/shared/header';
import { useOrganizationInvitationTable } from '@/hooks/my-organization/use-organization-invitation-table';
import { useOrganizationInvitationTableLogic } from '@/hooks/my-organization/use-organization-invitation-table-logic';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { OrganizationInvitationTabProps } from '@/types';

export interface OrganizationInvitationTabFullProps extends OrganizationInvitationTabProps {
  hideHeader?: boolean;
}

/**
 * Tab component for managing organization invitations.
 * @param root0 - The component props.
 * @param root0.createAction - Action configuration for creating invitations.
 * @param root0.revokeAction - Action configuration for revoking invitations.
 * @param root0.customMessages - Custom translation messages.
 * @param root0.styling - Custom styling configuration.
 * @param root0.readOnly - Whether the component is read-only.
 * @param root0.hideHeader - Whether to hide the header.
 * @returns The tab component.
 */
export function OrganizationInvitationTab({
  createAction,
  revokeAction,
  customMessages = {},
  styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  readOnly = false,
  hideHeader = false,
}: OrganizationInvitationTabFullProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);
  const { isDarkMode } = useTheme();

  const invitationTableState = useOrganizationInvitationTable({
    createAction,
    revokeAction,
    customMessages,
  });

  const invitationTableHandlers = useOrganizationInvitationTableLogic({
    t,
    onCreateInvitation: invitationTableState.onCreateInvitation,
    onRevokeInvitation: invitationTableState.onRevokeInvitation,
    fetchInvitations: invitationTableState.fetchInvitations,
  });

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  return (
    <div
      style={currentStyles.variables}
      className={currentStyles.classes?.['OrganizationInvitationTab-root']}
    >
      {!hideHeader && (
        <Header
          title=""
          description=""
          actions={[
            {
              type: 'button',
              label: t('invitation.create.submit_button'),
              onClick: invitationTableHandlers.handleCreateClick,
              icon: Plus,
              disabled: createAction?.disabled || readOnly || invitationTableState.isFetching,
            },
          ]}
        />
      )}

      <OrganizationInvitationTable
        invitations={invitationTableState.invitations}
        loading={invitationTableState.isFetching}
        customMessages={customMessages}
        onView={invitationTableHandlers.handleDetailsClick}
        onRevoke={readOnly ? undefined : invitationTableHandlers.handleRevokeClick}
        className={currentStyles.classes?.['OrganizationInvitationTab-table']}
      />

      <OrganizationInvitationCreateModal
        isOpen={invitationTableHandlers.showCreateModal}
        isLoading={invitationTableState.isCreating}
        customMessages={customMessages}
        onClose={() => invitationTableHandlers.setShowCreateModal(false)}
        onCreate={invitationTableHandlers.handleCreate}
        className={currentStyles.classes?.['OrganizationInvitationTab-createModal']}
      />

      <OrganizationInvitationDetailsModal
        invitation={invitationTableHandlers.selectedInvitation}
        isOpen={invitationTableHandlers.showDetailsModal}
        customMessages={customMessages}
        onClose={() => invitationTableHandlers.setShowDetailsModal(false)}
        className={currentStyles.classes?.['OrganizationInvitationTab-detailsModal']}
      />

      <OrganizationInvitationRevokeModal
        invitation={invitationTableHandlers.selectedInvitation}
        isOpen={invitationTableHandlers.showRevokeModal}
        isLoading={invitationTableState.isRevoking}
        customMessages={customMessages}
        onClose={() => invitationTableHandlers.setShowRevokeModal(false)}
        onRevoke={invitationTableHandlers.handleRevoke}
        className={currentStyles.classes?.['OrganizationInvitationTab-revokeModal']}
      />
    </div>
  );
}
