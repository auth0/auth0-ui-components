/**
 * Organization member detail component.
 * @module organization-member-detail
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import { ArrowLeft } from 'lucide-react';
import * as React from 'react';

import { GateKeeper } from '../shared/gate-keeper/gate-keeper';

import { MemberRemoveFromOrgModal } from '@/components/auth0/my-organization/shared/member-management/members/member-danger-zone/member-remove-from-org-modal';
import { OrganizationMemberEditDetailsTab } from '@/components/auth0/my-organization/shared/member-management/organization-member-detail/organization-member-details-tab';
import { OrganizationMemberEditRolesTab } from '@/components/auth0/my-organization/shared/member-management/organization-member-detail/organization-member-roles-tab';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrganizationMemberDetail } from '@/hooks/my-organization/use-member-detail';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
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
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground text-xl font-semibold shrink-0">
          {initials}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-2xl font-bold text-primary truncate">{displayName}</h1>
          {userId && (
            <Badge variant="secondary" className="w-fit font-mono text-xs">
              {userId}
            </Badge>
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
    isRemovingFromOrg,
    setActiveTab,
    closeModal,
    handleRemoveFromOrgConfirm,
  } = props;

  const { isDarkMode } = useTheme();
  const { t } = useTranslator('member_management', customMessages);

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

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
          className={currentStyles.classes?.['OrganizationMemberDetail-tabs']}
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
              isRemovingFromOrg={isRemovingFromOrg}
              onRemoveFromOrgClick={() => props.openModal({ type: 'removeFromOrg' })}
            />
          </TabsContent>

          <TabsContent
            value="roles"
            className={currentStyles.classes?.['OrganizationMemberDetail-rolesTab']}
          >
            <OrganizationMemberEditRolesTab
              customMessages={customMessages}
              memberRoles={props.memberRoles}
              availableRoles={props.availableRoles}
              isFetchingRoles={props.isFetchingRoles}
              removingRoleIds={props.removingRoleIds}
              modalState={modalState}
              isAssigningRoles={props.isAssigningRoles}
              onAssignRolesClick={() => props.openModal({ type: 'assignRoles' })}
              onAssignRolesCancel={closeModal}
              onAssignRolesSubmit={props.handleAssignRolesSubmit}
              onRemoveRolesClick={(roles) => props.openModal({ type: 'removeRoles', roles })}
              onRemoveRolesCancel={closeModal}
              onRemoveRolesConfirm={props.handleRemoveRolesConfirm}
            />
          </TabsContent>
        </Tabs>

        <MemberRemoveFromOrgModal
          isOpen={modalState.type === 'removeFromOrg'}
          isLoading={isRemovingFromOrg}
          customMessages={customMessages}
          onClose={closeModal}
          onConfirm={handleRemoveFromOrgConfirm}
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
    removeFromOrgAction,
    assignRolesAction,
    removeRolesAction,
  } = props;

  const memberDetail = useOrganizationMemberDetail({
    userId,
    onBack,
    customMessages,
    removeFromOrgAction,
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
