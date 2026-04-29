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
  member,
  customMessages,
}: OrganizationMemberDetailViewProps): React.JSX.Element | null {
  if (!member) return null;
  return <MemberDetailUserDetails member={member} customMessages={customMessages} />;
}

/**
 * Renders the remove from organization danger zone card.
 * @param root0 - Component props containing state and handlers
 * @returns The rendered remove from organization card element
 */
function RemoveFromOrganizationCard({
  customMessages,
  isRemovingFromOrg,
  handleRemoveFromOrgClick,
}: OrganizationMemberDetailViewProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages as Record<string, unknown>);
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
        onClick={handleRemoveFromOrgClick}
        disabled={isRemovingFromOrg}
        className="shrink-0"
      >
        {t('member.detail.actions.remove_from_org.delete_button')}
      </Button>
    </Card>
  );
}

/**
 * Details tab — user details + danger zone actions.
 * @param props - Component props containing state and handlers
 * @returns The rendered details tab element
 */
export function OrganizationMemberEditDetailsTab(
  props: OrganizationMemberDetailViewProps,
): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <OrganizationMemberUserDetails {...props} />
      <RemoveFromOrganizationCard {...props} />
    </div>
  );
}
