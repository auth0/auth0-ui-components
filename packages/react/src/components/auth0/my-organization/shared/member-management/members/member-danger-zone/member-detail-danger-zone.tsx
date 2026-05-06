/**
 * Member detail danger zone component — remove from org and delete member actions.
 * @module member-detail-danger-zone
 * @internal
 */

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { MemberDetailDangerZoneProps } from '@/types/my-organization/member-management/organization-member-detail-types';

/**
 * Renders a single danger zone action card with a title, description, and destructive button.
 * @param props - Component props
 * @returns The rendered danger zone card element
 */
function DangerCard({
  title,
  description,
  buttonLabel,
  isLoading,
  disabled,
  onClick,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  isLoading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}): React.JSX.Element {
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
        {buttonLabel}
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
