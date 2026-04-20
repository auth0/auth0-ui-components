/**
 * Organization member detail component.
 * @module organization-member-detail
 */

import { getComponentStyles } from '@auth0/universal-components-core';
import { ArrowLeft } from 'lucide-react';
import * as React from 'react';

import { GateKeeper } from '../shared/gate-keeper/gate-keeper';

import { MemberDeleteModal } from '@/components/auth0/my-organization/shared/member-management/members/member-danger-zone/member-delete-modal';
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
import type {
  OrganizationMemberDetailProps,
  OrganizationMemberDetailViewProps,
} from '@/types/my-organization/member-management/organization-member-detail-types';

export type { OrganizationMemberDetailViewProps };

/**
 * Returns the initials (up to 2 chars) from a display name.
 * @param name - The display name to extract initials from
 * @returns Up to 2 uppercase initials, or '?' if the name is empty
 */
function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? '';
  if (parts.length === 1) return first.charAt(0).toUpperCase();
  const last = parts[parts.length - 1] ?? '';
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

/**
 * Member detail header component
 * @param root0 - Component props containing state and handlers
 * @returns The rendered header element
 */
function Header({ state, handlers }: OrganizationMemberDetailViewProps): React.JSX.Element {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('member_management', state.customMessages as Record<string, unknown>);
  const currentStyles = React.useMemo(
    () => getComponentStyles(state.styling, isDarkMode),
    [state.styling, isDarkMode],
  );

  const memberRecord = state.member as Record<string, unknown> | null;
  const userId = (memberRecord?.user_id as string | undefined) ?? '';
  const displayName = (memberRecord?.name as string | undefined) ?? userId;
  const initials = getInitials(displayName || undefined);

  return (
    <div className={currentStyles.classes?.['OrganizationMemberDetail-header']}>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2 text-muted-foreground hover:text-primary"
        onClick={handlers.handleBack}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {t('member.detail.back_button')}
      </Button>

      <div className="flex items-center gap-4 mb-6">
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
 * @param root0 - Component props containing state and handlers
 * @returns The rendered member detail view element
 */
export function OrganizationMemberDetailView({
  state,
  handlers,
}: OrganizationMemberDetailViewProps): React.JSX.Element {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('member_management', state.customMessages as Record<string, unknown>);

  const currentStyles = React.useMemo(
    () => getComponentStyles(state.styling, isDarkMode),
    [state.styling, isDarkMode],
  );

  return (
    <StyledScope style={currentStyles.variables}>
      <div className={currentStyles.classes?.['OrganizationMemberDetail-root']}>
        <Header state={state} handlers={handlers} />
        <Tabs
          value={state.activeTab}
          onValueChange={(value) => handlers.setActiveTab(value as 'details' | 'roles')}
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
            <OrganizationMemberEditDetailsTab state={state} handlers={handlers} />
          </TabsContent>

          <TabsContent
            value="roles"
            className={currentStyles.classes?.['OrganizationMemberDetail-rolesTab']}
          >
            <OrganizationMemberEditRolesTab state={state} handlers={handlers} />
          </TabsContent>
        </Tabs>

        <MemberRemoveFromOrgModal
          isOpen={state.showRemoveFromOrgModal}
          isLoading={state.isRemovingFromOrg}
          customMessages={state.customMessages}
          onClose={handlers.handleRemoveFromOrgCancel}
          onConfirm={handlers.handleRemoveFromOrgConfirm}
        />

        <MemberDeleteModal
          isOpen={state.showDeleteMemberModal}
          isLoading={state.isDeletingMember}
          customMessages={state.customMessages}
          onClose={handlers.handleDeleteMemberCancel}
          onConfirm={handlers.handleDeleteMemberConfirm}
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
    deleteMemberAction,
    assignRoleAction,
    removeRoleAction,
  } = props;

  const { state, handlers } = useOrganizationMemberDetail({
    userId,
    onBack,
    customMessages,
    removeFromOrgAction,
    deleteMemberAction,
    assignRoleAction,
    removeRoleAction,
  });

  const extendedState = {
    ...state,
    styling,
    customMessages,
  };

  return (
    <GateKeeper isLoading={state.isLoading} styling={styling}>
      <OrganizationMemberDetailView state={extendedState} handlers={handlers} />
    </GateKeeper>
  );
}
