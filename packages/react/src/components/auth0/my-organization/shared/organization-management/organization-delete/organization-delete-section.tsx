/**
 * Organization delete section component.
 * @module organization-delete-section
 * @internal
 */

import * as React from 'react';

import { OrganizationDeleteModal } from '@/components/auth0/my-organization/shared/organization-management/organization-delete/organization-delete-modal';
import { PermissionDeniedTooltip } from '@/components/auth0/shared/permission-denied-tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type { OrganizationDeleteSectionProps } from '@/types/my-organization/organization-management/organization-delete-types';

/**
 * Danger-zone card with a delete button that opens the confirmation modal.
 * @param props - Component props.
 * @param props.organization - Organization to delete
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.canDelete - Whether the delete action is available
 * @param props.permissionDenied - Whether the delete scope is missing
 * @param props.deletionBehavior - How the API restricts deletion
 * @param props.isDeleteLoading - Whether the delete request is in flight
 * @param props.onDelete - Callback fired when deletion is confirmed
 * @returns JSX element
 */
export function OrganizationDeleteSection({
  organization,
  customMessages = {},
  styling,
  readOnly = false,
  canDelete,
  permissionDenied,
  deletionBehavior,
  isDeleteLoading,
  onDelete,
}: OrganizationDeleteSectionProps) {
  const { t } = useTranslator('organization_management.organization_delete', customMessages);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const openModal = React.useCallback(() => setIsModalOpen(true), []);
  const closeModal = React.useCallback(() => setIsModalOpen(false), []);

  return (
    <>
      <Card className={cn('p-6', styling?.classes?.['OrganizationDelete-root'])}>
        <CardContent className="flex items-start justify-between gap-6 p-0">
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-left text-subtitle">
              {t('title', { organizationName: organization.name })}
            </h3>
            <p className="text-muted-foreground text-left text-paragraph">{t('description')}</p>
            {deletionBehavior === 'allow_if_empty' && (
              <p className="text-muted-foreground text-left text-paragraph">
                {t('allow_if_empty_hint')}
              </p>
            )}
          </div>

          <PermissionDeniedTooltip
            customMessages={customMessages}
            enabled={permissionDenied}
            className="shrink-0"
          >
            <Button
              variant="destructive"
              onClick={openModal}
              disabled={readOnly || !canDelete || !organization.name}
            >
              {t('delete_button_label')}
            </Button>
          </PermissionDeniedTooltip>
        </CardContent>
      </Card>

      <OrganizationDeleteModal
        className={styling?.classes?.['OrganizationDelete-modal']}
        isOpen={isModalOpen}
        onClose={closeModal}
        organization={organization}
        customMessages={customMessages}
        isLoading={isDeleteLoading}
        onDelete={onDelete}
      />
    </>
  );
}
