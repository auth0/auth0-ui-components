import { getComponentStyles } from '@auth0-web-ui-components/core';
import * as React from 'react';

import { OrgDetails } from '@/components/my-org/org-management/org-details';
import { Header } from '@/components/ui/header';
import { Spinner } from '@/components/ui/spinner';
import { withMyOrgService } from '@/hoc';
import { useTheme, useTranslator, useOrgDetailsEdit } from '@/hooks';
import type { OrgDetailsEditProps } from '@/types/my-org/org-management';

/**
 * OrgDetailsEdit Component
 *
 * A comprehensive organization editing component that combines organization details
 * editing and deletion capabilities in a single interface. This component provides
 * a complete editing experience with form validation, lifecycle hooks, and user feedback.
 */
function OrgDetailsEditComponent({
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

  const {
    organization,
    isFetchLoading,
    formActions: enhancedFormActions,
  } = useOrgDetailsEdit({
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
    return <Spinner />;
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
        <OrgDetails
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

export const OrgDetailsEdit = withMyOrgService(OrgDetailsEditComponent);
