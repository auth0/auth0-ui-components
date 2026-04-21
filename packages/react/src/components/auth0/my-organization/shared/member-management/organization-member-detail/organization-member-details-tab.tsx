/**
 * Organization member edit details tab.
 * @module organization-member-details-tab
 */

import * as React from 'react';

import { MemberDetailUserDetails } from '@/components/auth0/my-organization/shared/member-management/members/member-user-details/member-detail-user-details';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { OrganizationMemberDetailViewProps } from '@/types/my-organization/member-management/organization-member-detail-types';

/**
 * Renders the user details section of the member detail view.
 * @param root0 - Component props containing state and handlers
 * @returns The rendered member user details element, or null if no member
 */
function OrganizationMemberUserDetails({
  state,
}: OrganizationMemberDetailViewProps): React.JSX.Element | null {
  if (!state.member) return null;
  return <MemberDetailUserDetails member={state.member} customMessages={state.customMessages} />;
}

/**
 * Renders the remove from organization danger zone card.
 * @param root0 - Component props containing state and handlers
 * @returns The rendered remove from organization card element
 */
function RemoveFromOrganizationCard({
  state,
  handlers,
}: OrganizationMemberDetailViewProps): React.JSX.Element {
  const { t } = useTranslator('member_management', state.customMessages as Record<string, unknown>);
  return (
    <Card className="flex-row items-center justify-between gap-4 p-6">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-primary">
          {t('member.detail.actions.remove_from_org.title')}
        </span>
        <span className="text-sm text-muted-foreground">
          {t('member.detail.actions.remove_from_org.description')}
        </span>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={handlers.handleRemoveFromOrgClick}
        disabled={state.isRemovingFromOrg}
        className="shrink-0"
      >
        {t('member.detail.actions.remove_from_org.delete_button')}
      </Button>
    </Card>
  );
}

/**
 * Details tab — user details + danger zone actions.
 * @param root0 - Component props containing state and handlers
 * @returns The rendered details tab element
 */
export function OrganizationMemberEditDetailsTab({
  state,
  handlers,
}: OrganizationMemberDetailViewProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <OrganizationMemberUserDetails state={state} handlers={handlers} />
      <RemoveFromOrganizationCard state={state} handlers={handlers} />
    </div>
  );
}
