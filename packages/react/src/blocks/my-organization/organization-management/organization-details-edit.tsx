import {
  getComponentStyles,
  MY_ORGANIZATION_DETAILS_EDIT_SCOPES,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { OrganizationDetails } from '../../../components/my-organization/organization-management/organization-details/organization-details';
import { Header } from '../../../components/ui/header';
import { Spinner } from '../../../components/ui/spinner';
import { withMyOrganizationService } from '../../../hoc/with-services';
import { useOrganizationDetailsEdit } from '../../../hooks/my-organization/organization-management/use-organization-details-edit';
import { useTheme } from '../../../hooks/use-theme';
import { useTranslator } from '../../../hooks/use-translator';
import type { OrganizationDetailsEditProps } from '../../../types/my-organization/organization-management/organization-details-edit-types';

/**
 * OrganizationDetailsEdit Component
 *
 * A comprehensive organization editing component that combines organization details
 * editing and deletion capabilities in a single interface. This component provides
 * a complete editing experience with form validation, lifecycle hooks, and user feedback.
 */
function OrganizationDetailsEditComponent({
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
}: OrganizationDetailsEditProps): React.JSX.Element {
  const { t } = useTranslator('org_management.org_details_edit', customMessages);
  const { isDarkMode } = useTheme();

  const {
    organization,
    isFetchLoading,
    formActions: enhancedFormActions,
  } = useOrganizationDetailsEdit({
    saveAction,
    cancelAction,
    readOnly,
    customMessages,
  });

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  if (isFetchLoading) {
    return (
      <div
        style={currentStyles.variables}
        className="flex items-center justify-center min-h-96 w-full"
      >
        <Spinner />
      </div>
    );
  }

  return (
    <div style={currentStyles.variables} className="w-full">
      {!hideHeader && (
        <div className="mb-8">
          <Header
            title={t('header.title', {
              orgName: organization.display_name || organization.name || '',
            })}
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
        <OrganizationDetails
          organization={organization}
          schema={schema?.details}
          customMessages={customMessages.details}
          styling={styling}
          readOnly={readOnly}
          formActions={enhancedFormActions}
        />
      </div>
    </div>
  );
}

export const OrganizationDetailsEdit = withMyOrganizationService(
  OrganizationDetailsEditComponent,
  MY_ORGANIZATION_DETAILS_EDIT_SCOPES,
);
