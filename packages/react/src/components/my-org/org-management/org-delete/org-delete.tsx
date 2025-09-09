import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme, useTranslator } from '@/hooks';
import { getComponentStyles } from '@auth0-web-ui-components/core';
import { OrgDeleteProps } from '@/types';
import { cn } from '@/lib/theme-utils';
import { withCoreClient } from '@/hoc';
import { OrgDeleteModal } from './org-delete-modal';

/**
 * OrgDelete Component
 *
 * A component for deleting an organization with a confirmation warning.
 * Displays a card with delete warning message and a destructive action button.
 * Opens a modal with organization name confirmation before deletion.
 */
function OrgDeleteComponent({
  styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  customMessages = {},
  onDelete,
  isLoading = false,
  organization,
}: OrgDeleteProps): React.JSX.Element {
  const { t } = useTranslator('org_management.org_delete', customMessages);
  const { isDarkMode } = useTheme();

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const organizationName = React.useMemo(
    () => organization.display_name || organization.name || '',
    [organization.display_name, organization.name],
  );

  const openModal = React.useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleDelete = React.useCallback(async () => {
    await onDelete(organization.id);
    closeModal();
  }, [onDelete, organization.id, closeModal]);

  return (
    <>
      <div style={currentStyles.variables} className="w-full">
        <Card className={cn('p-6', currentStyles.classes?.['OrgDelete-card'])}>
          <CardContent className="flex items-start justify-between gap-6 p-0">
            <div className="flex-1 space-y-2">
              <h3
                className={cn('text-lg font-semibold text-left text-(length:--font-size-subtitle)')}
              >
                {t('title', { orgName: organizationName })}
              </h3>
              <p
                className={cn(
                  'text-sm text-muted-foreground text-left text-(length:--font-size-paragraph)',
                )}
              >
                {t('description')}
              </p>
            </div>

            <Button
              variant="destructive"
              onClick={openModal}
              disabled={isLoading}
              className={cn('shrink-0', currentStyles.classes?.['OrgDelete-button'])}
            >
              {t('delete_button_label')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <OrgDeleteModal
        isOpen={isModalOpen}
        onClose={closeModal}
        organizationName={organizationName}
        onDelete={handleDelete}
        isLoading={isLoading}
        styling={styling}
        customMessages={customMessages}
      />
    </>
  );
}

export const OrgDelete = withCoreClient(OrgDeleteComponent);
