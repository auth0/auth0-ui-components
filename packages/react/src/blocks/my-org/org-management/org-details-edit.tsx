import * as React from 'react';
import { useTheme, useTranslator } from '@/hooks';
import { getComponentStyles, OrganizationDetailFormValues } from '@auth0-web-ui-components/core';
import { OrgDetailsEditProps } from '@/types/my-org/org-management/ord-details-edit-types';
import { withCoreClient } from '@/hoc';
import { OrgDetails } from '@/components/my-org/org-management/org-details';
import { OrgDelete } from '@/components/my-org/org-management/org-delete';
import { Header } from '@/components/ui/header';
import { toast } from 'sonner';
import { OrgDetailsFormActions } from '@/types/my-org/org-management/org-details-types';

/**
 * OrgDetailsEdit Component
 *
 * A comprehensive organization editing component that combines organization details
 * editing and deletion capabilities in a single interface. This component provides
 * a complete editing experience with form validation, lifecycle hooks, and user feedback.
 */
function OrgDetailsEditComponent({
  isLoading = false,
  schemaValidation,
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly = false,
  formActions,
  hideHeader = false,
  backButton,
}: OrgDetailsEditProps): React.JSX.Element {
  const { t } = useTranslator('org_management', customMessages);
  const { isDarkMode } = useTheme();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const organization = {
    id: 'org_12345',
    name: 'acme-corp',
    display_name: 'Acme Corporation',
    branding: {
      logo_url: 'https://picsum.photos/200',
      colors: {
        primary: '#007bff',
        page_background: '#ffffff',
      },
    },
  };
  // fetch details from hook

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const handleSubmit = React.useCallback(
    async (data: OrganizationDetailFormValues & { id?: string }) => {
      const saveAction = formActions.saveAction;
      if (saveAction?.onBefore) {
        const canProceed = saveAction.onBefore(
          data as OrganizationDetailFormValues & { id: string },
        );
        if (!canProceed) {
          return;
        }
      }

      try {
        //await onSave(data); will be a hook
        toast.success(t('messages.organization_saved'));
        if (saveAction?.onAfter) {
          saveAction.onAfter(data as OrganizationDetailFormValues & { id: string });
        }
      } catch (error) {
        toast.error(t('errors.save_organization'));
        throw error;
      }
    },
    [formActions.saveAction, t],
  );

  const handleDelete = React.useCallback(
    async (orgId: string) => {
      const deleteAction = formActions.deleteAction;
      if (deleteAction?.onBefore) {
        const canProceed = deleteAction.onBefore(
          organization as OrganizationDetailFormValues & { id: string },
        );
        if (!canProceed) {
          return;
        }
      }

      setIsDeleting(true);
      try {
        //await onDelete(orgId); will be a hook
        console.log(orgId);
        toast.success(t('messages.organization_deleted'));

        if (deleteAction?.onAfter) {
          deleteAction.onAfter(organization as OrganizationDetailFormValues & { id: string });
        }
      } catch (error) {
        toast.error(t('errors.delete_organization'));
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [formActions.deleteAction, organization, t],
  );

  const enhancedFormActions = React.useMemo(
    (): OrgDetailsFormActions => ({
      previousAction: formActions.cancelAction,
      showPrevious: formActions.showCancel,
      nextAction: {
        label: t('save_organization'),
        disabled: formActions.saveAction?.disable || readOnly,
        onClick: handleSubmit,
      },
      ...formActions,
    }),
    [formActions, handleSubmit, readOnly, t],
  );

  return (
    <div style={currentStyles.variables} className="w-full">
      {!hideHeader && (
        <div className="mb-8">
          <Header
            title={t('header.title')}
            backButton={
              backButton && {
                ...backButton,
                text: backButton.text || t('header.backButtonText'),
              }
            }
          />
        </div>
      )}

      <div className="mb-8">
        <OrgDetails
          organization={organization}
          isLoading={isLoading}
          schemaValidation={schemaValidation}
          customMessages={customMessages.details}
          styling={styling}
          readOnly={readOnly}
          formActions={enhancedFormActions}
        />
      </div>

      <OrgDelete
        organization={organization}
        onDelete={handleDelete}
        isLoading={isDeleting}
        schemaValidation={schemaValidation}
        styling={styling}
        customMessages={customMessages.delete}
      />
    </div>
  );
}

export const OrgDetailsEdit = withCoreClient(OrgDetailsEditComponent);
