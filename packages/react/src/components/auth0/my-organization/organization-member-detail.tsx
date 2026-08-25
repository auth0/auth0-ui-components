/**
 * Organization member detail component.
 * @module organization-member-detail
 */

import { getComponentStyles, type Role } from '@auth0/universal-components-core';
import { ArrowLeft } from 'lucide-react';
import * as React from 'react';

import { GateKeeper } from '../shared/gate-keeper/gate-keeper';

import { MemberRemoveFromOrganizationModal } from '@/components/auth0/my-organization/shared/member-management/members/member-danger-zone/member-remove-from-organization-modal';
import { OrganizationMemberEditDetailsTab } from '@/components/auth0/my-organization/shared/member-management/organization-member-detail/organization-member-details-tab';
import { OrganizationMemberEditRolesTab } from '@/components/auth0/my-organization/shared/member-management/organization-member-detail/organization-member-roles-tab';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrganizationMemberDetail } from '@/hooks/my-organization/use-member-detail';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils/my-organization/member-management/member-management-utils';
import type {
  MemberDetailHeaderProps,
  OrganizationMemberDetailProps,
  OrganizationMemberDetailViewProps,
} from '@/types/my-organization/member-management/organization-member-detail-types';

/**
 * Member detail header component.
 * @param props - Component props containing state and handlers
 * @returns The rendered header element
 */
function Header({
  member,
  styling,
  customMessages,
  handleBack,
}: MemberDetailHeaderProps): React.JSX.Element {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('member_management', customMessages);
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const userId = member?.user_id ?? '';
  const displayName = member?.name ?? userId;
  const initials = getInitials(displayName);

  return (
    <div className={currentStyles.classes?.['OrganizationMemberDetail-header']}>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2 text-muted-foreground hover:text-primary"
        onClick={handleBack}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {t('member.detail.back_button')}
      </Button>

      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16 shrink-0">
          <AvatarFallback className="text-xl font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-heading font-bold text-primary truncate">{displayName}</h1>
          {userId && (
            <span className="text-sm flex items-center gap-2">
              {t('member.detail.user_id_label')}
              <Badge variant="secondary" className="w-fit font-mono text-xs">
                {userId}
              </Badge>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * View component for organization member detail.
 * @param props - Component props containing state and handlers
 * @returns The rendered member detail view element
 */
export function OrganizationMemberDetailView(
  props: OrganizationMemberDetailViewProps,
): React.JSX.Element {
  const {
    styling,
    customMessages,
    activeTab,
    modalState,
    isRemovingFromOrganization,
    setActiveTab,
    closeModal,
    openModal,
    handleRemoveFromOrganizationConfirm,
  } = props;

  const { isDarkMode } = useTheme();
  const { t } = useTranslator('member_management', customMessages);

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const handleRemoveFromOrganizationClick = React.useCallback(
    () => openModal({ type: 'removeFromOrganization' }),
    [openModal],
  );

  const handleAssignRolesClick = React.useCallback(
    () => openModal({ type: 'assignRoles' }),
    [openModal],
  );

  const handleRemoveRolesClick = React.useCallback(
    (roles: Role[]) => openModal({ type: 'removeRoles', roles }),
    [openModal],
  );

  if (props.memberError) {
    return (
      <StyledScope style={currentStyles.variables}>
        <div className={currentStyles.classes?.['OrganizationMemberDetail-root']}>
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 -ml-2 text-muted-foreground hover:text-primary"
            onClick={props.handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('member.detail.back_button')}
          </Button>
          <div
            className="flex flex-col items-center justify-center p-8 space-y-2"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-xl text-center">{props.memberError}</p>
          </div>
        </div>
      </StyledScope>
    );
  }

  return (
    <StyledScope style={currentStyles.variables}>
      <div className={currentStyles.classes?.['OrganizationMemberDetail-root']}>
        <Header
          member={props.member}
          styling={styling}
          customMessages={customMessages}
          handleBack={props.handleBack}
        />
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'details' | 'roles')}
          className={cn('gap-8', currentStyles.classes?.['OrganizationMemberDetail-tabs'])}
        >
          <TabsList>
            <TabsTrigger value="details">{t('member.detail.tabs.details')}</TabsTrigger>
            <TabsTrigger value="roles">{t('member.detail.tabs.roles')}</TabsTrigger>
          </TabsList>

          <TabsContent
            value="details"
            className={currentStyles.classes?.['OrganizationMemberDetail-detailsTab']}
          >
            <OrganizationMemberEditDetailsTab
              member={props.member}
              customMessages={customMessages}
              isRemovingFromOrganization={isRemovingFromOrganization}
              onRemoveFromOrganizationClick={handleRemoveFromOrganizationClick}
            />
          </TabsContent>

          <TabsContent
            value="roles"
            className={currentStyles.classes?.['OrganizationMemberDetail-rolesTab']}
          >
            <OrganizationMemberEditRolesTab
              customMessages={customMessages}
              organizationName={props.organizationDisplayName}
              memberName={props.member?.name}
              selectedMember={props.member}
              memberRoles={props.memberRoles}
              searchedRoles={props.searchedRoles}
              onRoleSearch={props.onRoleSearch}
              selectedRoles={props.selectedRoles}
              isFetchingMemberRoles={props.isFetchingMemberRoles}
              removingRoleIds={props.removingRoleIds}
              isRemovingRoles={props.isRemovingRoles}
              modalState={modalState}
              isAssigningRoles={props.isAssigningRoles}
              classes={currentStyles.classes}
              style={currentStyles.variables}
              onSelectedRolesChange={props.setSelectedRoles}
              onAssignRolesClick={handleAssignRolesClick}
              onAssignRolesCancel={closeModal}
              onAssignRolesSubmit={props.handleAssignRolesSubmit}
              onRemoveRolesClick={handleRemoveRolesClick}
              onRemoveRolesCancel={props.handleRemoveRolesCancel}
              onRemoveRolesConfirm={props.handleRemoveRolesConfirm}
            />
          </TabsContent>
        </Tabs>

        <MemberRemoveFromOrganizationModal
          isOpen={modalState.type === 'removeFromOrganization'}
          isLoading={isRemovingFromOrganization || props.isLoadingOrganization}
          memberName={props.member?.name}
          memberUserId={props.member?.user_id}
          organizationName={props.organizationDisplayName}
          customMessages={customMessages}
          classes={currentStyles.classes}
          style={currentStyles.variables}
          onClose={closeModal}
          onConfirm={handleRemoveFromOrganizationConfirm}
        />
      </div>
    </StyledScope>
  );
}

/**
 * Container component for organization member detail.
 * @param props - {@link OrganizationMemberDetailProps}
 * @returns The rendered member detail container element
 */
export function OrganizationMemberDetail(props: OrganizationMemberDetailProps) {
  const {
    userId,
    onBack,
    customMessages = {},
    styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    initialTab,
    removeFromOrganizationAction,
    assignRolesAction,
    removeRolesAction,
  } = props;

  const memberDetail = useOrganizationMemberDetail({
    userId,
    onBack,
    customMessages,
    initialTab,
    removeFromOrganizationAction,
    assignRolesAction,
    removeRolesAction,
  });

  return (
    <GateKeeper isLoading={memberDetail.isLoading} styling={styling}>
      <OrganizationMemberDetailView
        {...memberDetail}
        styling={styling}
        customMessages={customMessages}
      />
    </GateKeeper>
  );
}
