import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { OrganizationDetails } from '@/components/auth0/my-organization/shared/organization-management/organization-details/organization-details';
import { GateKeeper } from '@/components/auth0/shared/gatekeeper';
import { Header } from '@/components/auth0/shared/header';
import { useOrganizationDetailsEdit } from '@/hooks/my-organization/use-organization-details-edit';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { OrganizationDetailsEditProps } from '@/types/my-organization/organization-management/organization-details-edit-types';

/**
 * OrganizationDetailsEdit Component
 *
 * A comprehensive organization editing component that combines organization details
 * editing and deletion capabilities in a single interface. This component provides
 * a complete editing experience with form validation, lifecycle hooks, and user feedback.
 */
export function OrganizationDetailsEdit({
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
  const { t } = useTranslator('organization_management.organization_details_edit', customMessages);
  const { isDarkMode } = useTheme();

  const {
    organization,
    error,
    retry,
    isLoading,
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

  return (
    <GateKeeper isLoading={isLoading} error={error} onRetry={retry}>
      <div style={currentStyles.variables} className="w-full">
        {!hideHeader && (
          <div className="mb-8">
            <Header
              title={t('header.title', {
                organizationName: organization.display_name || organization.name || '',
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
    </GateKeeper>
  );
}
