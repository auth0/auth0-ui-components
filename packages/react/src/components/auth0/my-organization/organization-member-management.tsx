/**
 * Organization member management component.
 * @module organization-member-management
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { OrganizationInvitationDetailsModal } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-details/organization-invitation-details-modal';
import { OrganizationInvitationRevokeModal } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-revoke/organization-invitation-revoke-modal';
import { OrganizationInvitationTable } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-table/organization-invitation-table';
import { OrganizationInvitationCreateModal } from '@/components/auth0/my-organization/shared/member-management/shared/invitation-create/organization-invitation-create-modal';
import { Header } from '@/components/auth0/shared/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrganizationMemberManagement } from '@/hooks/my-organization/use-organization-member-management';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  MemberManagementState,
  MemberManagementHandlers,
  OrganizationMemberManagementProps,
} from '@/types/my-organization/member-management/organization-member-management-types';

/**
 * Props for the OrganizationMemberManagementView component.
 */
export interface OrganizationMemberManagementViewProps {
  state: MemberManagementState & {
    styling: OrganizationMemberManagementProps['styling'];
    customMessages: OrganizationMemberManagementProps['customMessages'];
    hideHeader: boolean;
    readOnly: boolean;
  };
  handlers: MemberManagementHandlers;
}

/**
 * View component for organization member management.
 * @param props - The component props.
 * @returns The component.
 */
export function OrganizationMemberManagementView({
  state,
  handlers,
}: OrganizationMemberManagementViewProps) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('member_management', state.customMessages as Record<string, unknown>);

  const currentStyles = React.useMemo(
    () => getComponentStyles(state.styling, isDarkMode),
    [state.styling, isDarkMode],
  );

  return (
    <div
      style={currentStyles.variables}
      className={currentStyles.classes?.['OrganizationMemberManagement-root']}
    >
      {!state.hideHeader && (
        <div className={currentStyles.classes?.['OrganizationMemberManagement-header']}>
          <Header
            title={t('header.title')}
            description={t('header.description')}
            actions={
              !state.readOnly
                ? [
                    {
                      type: 'button',
                      label: t('invite_button'),
                      onClick: handlers.handleCreateClick,
                      icon: Plus,
                      disabled: state.readOnly,
                    },
                  ]
                : []
            }
          />
        </div>
      )}

      <Tabs
        value={state.activeTab}
        onValueChange={(value: string) => handlers.setActiveTab(value as 'members' | 'invitations')}
        className={currentStyles.classes?.['OrganizationMemberManagement-tabs']}
      >
        <TabsList>
          <TabsTrigger value="members">{t('tabs.members')}</TabsTrigger>
          <TabsTrigger value="invitations">{t('tabs.invitations')}</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          {/* <OrganizationMemberTable
          /> */}
        </TabsContent>

        <TabsContent value="invitations">
          <OrganizationInvitationTable
            invitations={state.invitations}
            loading={state.isFetchingInvitations}
            customMessages={state.customMessages?.invitation}
            pagination={state.invitationPagination}
            filters={state.invitationFilters}
            availableRoles={state.availableRoles}
            readOnly={state.readOnly}
            sortConfig={state.invitationSortConfig}
            onSortChange={handlers.handleSortChange}
            onView={handlers.handleDetailsClick}
            onCopyUrl={handlers.handleCopyUrl}
            onRevokeAndResend={state.readOnly ? undefined : handlers.handleRevokeResendClick}
            onRevoke={state.readOnly ? undefined : handlers.handleRevokeClick}
            onNextPage={handlers.handleNextPage}
            onPreviousPage={handlers.handlePreviousPage}
            onPageSizeChange={handlers.handlePageSizeChange}
            onRoleFilterChange={handlers.handleRoleFilterChange}
            className={currentStyles.classes?.['OrganizationInvitationTab-table']}
          />
        </TabsContent>
      </Tabs>

      <OrganizationInvitationCreateModal
        isOpen={state.showCreateModal}
        isLoading={state.isCreatingInvitation}
        customMessages={state.customMessages?.invitation}
        availableRoles={state.availableRoles}
        availableProviders={state.availableProviders}
        onClose={handlers.handleCreateCancel}
        onCreate={handlers.handleCreateSubmit}
        className={currentStyles.classes?.['OrganizationInvitationTab-createModal']}
      />

      <OrganizationInvitationDetailsModal
        invitation={state.selectedInvitation}
        isOpen={state.showDetailsModal}
        isRevoking={state.isRevokingInvitation}
        isResending={state.isResendingInvitation}
        customMessages={state.customMessages?.invitation}
        availableRoles={state.availableRoles}
        availableProviders={state.availableProviders}
        readOnly={state.readOnly}
        onClose={handlers.handleDetailsClose}
        onCopyUrl={handlers.handleCopyUrl}
        onRevoke={(invitation) => invitation && handlers.handleRevokeClick(invitation)}
        onResend={(invitation) => invitation && handlers.handleRevokeResendClick(invitation)}
        className={currentStyles.classes?.['OrganizationInvitationTab-detailsModal']}
      />

      <OrganizationInvitationRevokeModal
        invitation={state.selectedInvitation}
        isOpen={state.showRevokeModal}
        isLoading={state.isRevokingInvitation}
        customMessages={state.customMessages?.invitation}
        onClose={handlers.handleRevokeCancel}
        onConfirm={() => handlers.handleRevokeConfirm()}
        className={currentStyles.classes?.['OrganizationInvitationTab-revokeModal']}
      />

      <OrganizationInvitationRevokeModal
        invitation={state.selectedInvitation}
        isOpen={state.showRevokeResendModal}
        isLoading={state.isResendingInvitation}
        isRevokeAndResend
        customMessages={state.customMessages?.invitation}
        onClose={handlers.handleRevokeResendCancel}
        onConfirm={() => handlers.handleRevokeResendConfirm()}
        className={currentStyles.classes?.['OrganizationInvitationTab-revokeResendModal']}
      />
    </div>
  );
}

/**
 * Container component for organization member management.
 * @param props - The component props.
 * @returns The component.
 */
export function OrganizationMemberManagement(props: OrganizationMemberManagementProps) {
  const {
    hideHeader = false,
    defaultTab = 'members',
    customMessages = {},
    styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    readOnly = false,
    createInvitationAction,
    revokeInvitationAction,
    resendInvitationAction,
  } = props;

  const { state, handlers } = useOrganizationMemberManagement({
    customMessages,
    defaultTab,
    readOnly,
    createInvitationAction,
    revokeInvitationAction,
    resendInvitationAction,
  });

  const extendedState = {
    ...state,
    styling,
    customMessages,
    hideHeader,
    readOnly,
  };

  return <OrganizationMemberManagementView state={extendedState} handlers={handlers} />;
}
