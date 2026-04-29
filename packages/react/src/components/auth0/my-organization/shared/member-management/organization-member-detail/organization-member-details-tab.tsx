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

type OrganizationMemberEditDetailsTabProps = Pick<
  OrganizationMemberDetailViewProps,
  'member' | 'customMessages' | 'isRemovingFromOrg' | 'handleRemoveFromOrgClick'
>;

/**
 * Renders user details for the selected member.
 * @param root0 - Component props containing member and customMessages
 * @returns The rendered user details element, or null if member is not set
 */
function OrganizationMemberUserDetails({
  member,
  customMessages,
}: OrganizationMemberEditDetailsTabProps): React.JSX.Element | null {
  if (!member) return null;
  return <MemberDetailUserDetails member={member} customMessages={customMessages} />;
}

/**
 * Card with a button to remove the member from the organization.
 * @param root0 - Component props containing handlers and loading state
 * @returns The rendered remove-from-org card element
 */
function RemoveFromOrganizationCard({
  customMessages,
  isRemovingFromOrg,
  handleRemoveFromOrgClick,
}: OrganizationMemberEditDetailsTabProps): React.JSX.Element {
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
 * @param props - Component props
 * @returns The rendered details tab element
 */
export function OrganizationMemberEditDetailsTab(
  props: OrganizationMemberEditDetailsTabProps,
): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <OrganizationMemberUserDetails {...props} />
      <RemoveFromOrganizationCard {...props} />
    </div>
  );
}
