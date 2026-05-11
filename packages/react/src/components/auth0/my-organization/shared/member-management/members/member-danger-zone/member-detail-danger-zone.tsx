/**
 * Member detail danger zone component — remove from org and delete member actions.
 * @module member-detail-danger-zone
 * @internal
 */

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  MemberDetailDangerCardProps,
  MemberDetailDangerZoneProps,
} from '@/types/my-organization/member-management/organization-member-detail-types';

/**
 * Renders a single danger zone action card with a title, description, and destructive button.
 * @param props - Component props
 * @param props.title - Card title text
 * @param props.description - Card description text
 * @param props.buttonLabel - Label for the action button
 * @param props.isLoading - Whether the action is in progress
 * @param props.disabled - Whether the button is disabled
 * @param props.onClick - Click handler for the action button
 * @returns The rendered danger card element
 */
function DangerCard({
  title,
  description,
  buttonLabel,
  isLoading,
  disabled,
  onClick,
}: MemberDetailDangerCardProps): React.JSX.Element {
  return (
    <Card className="flex items-center justify-between gap-4 p-6">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-primary">{title}</span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={onClick}
        disabled={disabled || isLoading}
        className="shrink-0"
      >
        {isLoading ? <Spinner size="sm" /> : buttonLabel}
      </Button>
    </Card>
  );
}

/**
 * Renders the danger zone section with remove from org and delete member actions.
 * @param props - Component props
 * @returns The rendered danger zone section element
 */
export function MemberDetailDangerZone({
  readOnly = false,
  isRemovingFromOrg = false,
  isDeletingMember = false,
  customMessages,
  onRemoveFromOrgClick,
  onDeleteMemberClick,
}: MemberDetailDangerZoneProps): React.JSX.Element {
  const { t } = useTranslator('member_management', customMessages);

  return (
    <div className="flex flex-col gap-4 mt-4">
      <DangerCard
        title={t('member.detail.danger_zone.remove_from_org.title')}
        description={t('member.detail.danger_zone.remove_from_org.description')}
        buttonLabel={t('member.detail.danger_zone.remove_from_org.button')}
        isLoading={isRemovingFromOrg}
        disabled={readOnly}
        onClick={onRemoveFromOrgClick}
      />
      <DangerCard
        title={t('member.detail.danger_zone.delete_member.title')}
        description={t('member.detail.danger_zone.delete_member.description')}
        buttonLabel={t('member.detail.danger_zone.delete_member.button')}
        isLoading={isDeletingMember}
        disabled={readOnly}
        onClick={onDeleteMemberClick}
      />
    </div>
  );
}
