import type { Organization } from '@auth0-web-ui-components/core';
import { getComponentStyles } from '@auth0-web-ui-components/core';
import * as React from 'react';
import { Toaster } from 'sonner';

import { OrgDetails } from '@/components/my-org/org-management/org-details';
import { Header } from '@/components/ui/header';
import { showToast } from '@/components/ui/toast';
import { withCoreClient } from '@/hoc';
import { useTheme, useTranslator } from '@/hooks';
import type { OrgDetailsEditProps, OrgDetailsFormActions } from '@/types/my-org/org-management';

/**
 * OrgDetailsEdit Component
 *
 * A comprehensive organization editing component that combines organization details
 * editing and deletion capabilities in a single interface. This component provides
 * a complete editing experience with form validation, lifecycle hooks, and user feedback.
 */
function OrgDetailsEditComponent({
  organizationId,
  isLoading = false,
  schema,
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly = false,
  saveAction,
  cancelAction,
  hideHeader = false,
  backButton,
}: OrgDetailsEditProps): React.JSX.Element {
  const { t } = useTranslator('org_management.org_details_edit', customMessages);
  const { isDarkMode } = useTheme();

  //TODO:  fetch details from hook
  const organization = {
    id: organizationId || 'org_12345',
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

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const handleSubmit = React.useCallback(
    async (data: Organization): Promise<boolean> => {
      if (saveAction?.onBefore) {
        const canProceed = saveAction.onBefore(data);
        if (!canProceed) {
          return false;
        }
      }

      try {
        //TODO: await onSave(data); will be a hook
        showToast({
          type: 'success',
          message: t('save_org_changes_message', { orgName: organization.display_name }),
        });
        if (saveAction?.onAfter) {
          saveAction.onAfter(data);
        }
        return true;
      } catch (error) {
        showToast({
          type: 'error',
          message: t('org_changes_error_message'),
        });
        return false;
      }
    },
    [saveAction, t, organization.display_name],
  );

  const enhancedFormActions = React.useMemo(
    (): OrgDetailsFormActions => ({
      previousAction: cancelAction && { onClick: cancelAction },
      nextAction: {
        disabled: saveAction?.disabled || readOnly,
        onClick: handleSubmit,
      },
    }),
    [handleSubmit, readOnly, cancelAction, saveAction?.disabled],
  );

  return (
    <div style={currentStyles.variables} className="w-full">
      <Toaster position="top-right" />
      {!hideHeader && (
        <div className="mb-8">
          <Header
            title={t('header.title', { orgName: organization.display_name })}
            backButton={
              backButton && {
                ...backButton,
                text: t('header.back_button_text'),
              }
            }
          />
        </div>
      )}

      <div className="mb-8">
        <OrgDetails
          organization={organization}
          isLoading={isLoading}
          schema={schema}
          customMessages={customMessages.details}
          styling={styling}
          readOnly={readOnly}
          formActions={enhancedFormActions}
        />
      </div>
    </div>
  );
}

export const OrgDetailsEdit = withCoreClient(OrgDetailsEditComponent);
