/**
 * Organization member management component.
 * @module organization-member-management
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { OrganizationInvitationCreateModal } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-create/organization-invitation-create-modal';
import { OrganizationInvitationDetailsModal } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-details/organization-invitation-details-modal';
import { OrganizationInvitationRevokeModal } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-revoke/organization-invitation-revoke-modal';
import { OrganizationInvitationTable } from '@/components/auth0/my-organization/shared/member-management/invitations/invitation-table/organization-invitation-table';
import { OrganizationMemberRemoveModal } from '@/components/auth0/my-organization/shared/member-management/members/member-remove/organization-member-remove-modal';
import { OrganizationMemberTable } from '@/components/auth0/my-organization/shared/member-management/members/member-table/organization-member-table';
import { Header } from '@/components/auth0/shared/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { withMyOrganizationService } from '@/hoc/with-services';
import { useOrganizationMemberManagement } from '@/hooks/my-organization/use-organization-member-management';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  MemberManagementState,
  MemberManagementHandlers,
  OrganizationMemberManagementProps,
} from '@/types';

// TODO: Import from @auth0/universal-components-core after building core package
const MY_ORGANIZATION_MEMBER_MANAGEMENT_SCOPES =
  'read:my_org:members delete:my_org:members read:my_org:member_invitations create:my_org:member_invitations delete:my_org:member_invitations';

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
        onValueChange={(value) => handlers.setActiveTab(value as 'members' | 'invitations')}
        className={currentStyles.classes?.['OrganizationMemberManagement-tabs']}
      >
        <TabsList>
          <TabsTrigger value="members">{t('tabs.members')}</TabsTrigger>
          <TabsTrigger value="invitations">{t('tabs.invitations')}</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <OrganizationMemberTable
            members={state.members}
            loading={state.isFetchingMembers}
            customMessages={state.customMessages?.member}
            onRemove={state.readOnly ? undefined : handlers.handleRemoveClick}
            className={currentStyles.classes?.['OrganizationMemberTab-table']}
          />
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

      <OrganizationMemberRemoveModal
        member={state.selectedMember}
        isOpen={state.showRemoveModal}
        isLoading={state.isRemovingMember}
        customMessages={state.customMessages?.member}
        onClose={handlers.handleRemoveCancel}
        onRemove={handlers.handleRemoveConfirm}
        className={currentStyles.classes?.['OrganizationMemberTab-removeModal']}
      />

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
function OrganizationMemberManagementContainer(props: OrganizationMemberManagementProps) {
  const {
    hideHeader = false,
    defaultTab = 'members',
    customMessages = {},
    styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    readOnly = false,
    createInvitationAction,
    revokeInvitationAction,
    resendInvitationAction,
    removeMemberAction,
  } = props;

  const { state, handlers } = useOrganizationMemberManagement({
    customMessages,
    defaultTab:
      defaultTab === 'member'
        ? 'members'
        : defaultTab === 'invitation'
          ? 'invitations'
          : defaultTab,
    readOnly,
    createInvitationAction,
    revokeInvitationAction,
    resendInvitationAction,
    removeMemberAction,
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

export const OrganizationMemberManagement: React.ComponentType<OrganizationMemberManagementProps> =
  withMyOrganizationService(
    OrganizationMemberManagementContainer,
    MY_ORGANIZATION_MEMBER_MANAGEMENT_SCOPES,
  );
