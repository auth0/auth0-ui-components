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
import {
  useOrganizationMemberManagementLogic,
  type MemberManagementLogicState,
  type MemberManagementHandlers,
} from '@/hooks/my-organization/use-organization-member-management-logic';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { OrganizationMemberManagementProps } from '@/types';

// TODO: Import from @auth0/universal-components-core after building core package
const MY_ORGANIZATION_MEMBER_MANAGEMENT_SCOPES =
  'read:my_org:members delete:my_org:members read:my_org:member_invitations create:my_org:member_invitations delete:my_org:member_invitations';

/**
 * Props for the OrganizationMemberManagementView component.
 */
export interface OrganizationMemberManagementViewProps {
  logic: MemberManagementLogicState & {
    styling: OrganizationMemberManagementProps['styling'];
    customMessages: OrganizationMemberManagementProps['customMessages'];
    hideHeader: boolean;
    readOnly: boolean;
  };
  handlers: MemberManagementHandlers;
}

/**
 * OrganizationMemberManagementView Component (View)
 *
 * Stateless view component that receives logic and handlers from props.
 * @param props - The component props.
 * @returns The component.
 */
export function OrganizationMemberManagementView({
  logic,
  handlers,
}: OrganizationMemberManagementViewProps) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('member_management', logic.customMessages as Record<string, unknown>);

  const currentStyles = React.useMemo(
    () => getComponentStyles(logic.styling, isDarkMode),
    [logic.styling, isDarkMode],
  );

  return (
    <div
      style={currentStyles.variables}
      className={currentStyles.classes?.['OrganizationMemberManagement-root']}
    >
      {!logic.hideHeader && (
        <div className={currentStyles.classes?.['OrganizationMemberManagement-header']}>
          <Header
            title={t('header.title')}
            description={t('header.description')}
            actions={
              !logic.readOnly
                ? [
                    {
                      type: 'button',
                      label: t('invitation.create.submit_button'),
                      onClick: handlers.handleCreateClick,
                      icon: Plus,
                      disabled: logic.readOnly,
                    },
                  ]
                : []
            }
          />
        </div>
      )}

      <Tabs
        value={logic.activeTab}
        onValueChange={(value) => handlers.setActiveTab(value as 'members' | 'invitations')}
        className={currentStyles.classes?.['OrganizationMemberManagement-tabs']}
      >
        <TabsList>
          <TabsTrigger value="members">{t('tabs.members')}</TabsTrigger>
          <TabsTrigger value="invitations">{t('tabs.invitations')}</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <OrganizationMemberTable
            members={logic.members}
            loading={logic.isFetchingMembers}
            customMessages={logic.customMessages?.member}
            onRemove={logic.readOnly ? undefined : handlers.handleRemoveClick}
            className={currentStyles.classes?.['OrganizationMemberTab-table']}
          />
        </TabsContent>

        <TabsContent value="invitations">
          <OrganizationInvitationTable
            invitations={logic.invitations}
            loading={logic.isFetchingInvitations}
            customMessages={logic.customMessages?.invitation}
            pagination={logic.invitationPagination}
            filters={logic.invitationFilters}
            availableRoles={logic.availableRoles}
            readOnly={logic.readOnly}
            onView={handlers.handleDetailsClick}
            onCopyUrl={handlers.handleCopyUrl}
            onRevokeAndResend={logic.readOnly ? undefined : handlers.handleRevokeResendClick}
            onRevoke={logic.readOnly ? undefined : handlers.handleRevokeClick}
            onPageChange={handlers.handlePageChange}
            onPageSizeChange={handlers.handlePageSizeChange}
            onSearchChange={handlers.handleSearchChange}
            onRoleFilterChange={handlers.handleRoleFilterChange}
            className={currentStyles.classes?.['OrganizationInvitationTab-table']}
          />
        </TabsContent>
      </Tabs>

      {/* Member Remove Modal */}
      <OrganizationMemberRemoveModal
        member={logic.selectedMember}
        isOpen={logic.showRemoveModal}
        isLoading={logic.isRemovingMember}
        customMessages={logic.customMessages?.member}
        onClose={handlers.handleRemoveCancel}
        onRemove={handlers.handleRemoveConfirm}
        className={currentStyles.classes?.['OrganizationMemberTab-removeModal']}
      />

      {/* Invitation Create Modal */}
      <OrganizationInvitationCreateModal
        isOpen={logic.showCreateModal}
        isLoading={logic.isCreatingInvitation}
        customMessages={logic.customMessages?.invitation}
        availableRoles={logic.availableRoles}
        availableProviders={logic.availableProviders}
        onClose={handlers.handleCreateCancel}
        onCreate={handlers.handleCreateSubmit}
        className={currentStyles.classes?.['OrganizationInvitationTab-createModal']}
      />

      {/* Invitation Details Modal */}
      <OrganizationInvitationDetailsModal
        invitation={logic.selectedInvitation}
        isOpen={logic.showDetailsModal}
        customMessages={logic.customMessages?.invitation}
        availableRoles={logic.availableRoles}
        availableProviders={logic.availableProviders}
        readOnly={logic.readOnly}
        onClose={handlers.handleDetailsClose}
        onCopyUrl={handlers.handleCopyUrl}
        onRevoke={handlers.handleRevokeClick}
        onResend={handlers.handleRevokeResendClick}
        className={currentStyles.classes?.['OrganizationInvitationTab-detailsModal']}
      />

      {/* Invitation Revoke Modal */}
      <OrganizationInvitationRevokeModal
        invitation={logic.selectedInvitation}
        isOpen={logic.showRevokeModal}
        isLoading={logic.isRevokingInvitation}
        customMessages={logic.customMessages?.invitation}
        onClose={handlers.handleRevokeCancel}
        onConfirm={handlers.handleRevokeConfirm}
        className={currentStyles.classes?.['OrganizationInvitationTab-revokeModal']}
      />

      {/* Invitation Revoke and Resend Modal */}
      <OrganizationInvitationRevokeModal
        invitation={logic.selectedInvitation}
        isOpen={logic.showRevokeResendModal}
        isLoading={logic.isRevokingInvitation || logic.isResendingInvitation}
        isRevokeAndResend
        customMessages={logic.customMessages?.invitation}
        onClose={handlers.handleRevokeResendCancel}
        onConfirm={handlers.handleRevokeResendConfirm}
        className={currentStyles.classes?.['OrganizationInvitationTab-revokeResendModal']}
      />
    </div>
  );
}

/**
 * OrganizationMemberManagement Container Component
 *
 * Manages state and passes logic/handlers to the view component.
 * @param props - The component props.
 * @returns The component.
 */
function OrganizationMemberManagementContainer(props: OrganizationMemberManagementProps) {
  const {
    hideHeader = false,
    defaultTab = 'members',
    invitationProps = {},
    customMessages = {},
    styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    readOnly = false,
  } = props;

  // API hook - handles all data fetching and mutations
  const api = useOrganizationMemberManagement({
    customMessages,
    availableRoles: invitationProps.availableRoles,
    availableProviders: invitationProps.availableProviders,
  });

  // Logic hook - handles UI state and business logic
  const { logic, handlers } = useOrganizationMemberManagementLogic({
    api,
    defaultTab:
      defaultTab === 'member'
        ? 'members'
        : defaultTab === 'invitation'
          ? 'invitations'
          : defaultTab,
    readOnly,
  });

  // Extend logic with component props
  const extendedLogic = {
    ...logic,
    styling,
    customMessages,
    hideHeader,
    readOnly,
  };

  return <OrganizationMemberManagementView logic={extendedLogic} handlers={handlers} />;
}

/**
 * OrganizationMemberManagement — Public component
 * Wrapped with HOC for OAuth scope management.
 */
export const OrganizationMemberManagement: React.ComponentType<OrganizationMemberManagementProps> =
  withMyOrganizationService(
    OrganizationMemberManagementContainer,
    MY_ORGANIZATION_MEMBER_MANAGEMENT_SCOPES,
  );
