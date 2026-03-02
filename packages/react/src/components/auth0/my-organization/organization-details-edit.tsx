/** @module organization-details-edit */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { OrganizationDetails } from '@/components/auth0/my-organization/shared/organization-management/organization-details/organization-details';
import { GateKeeper } from '@/components/auth0/shared/gatekeeper';
import { Header } from '@/components/auth0/shared/header';
import { useOrganizationDetailsEdit } from '@/hooks/my-organization/use-organization-details-edit';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  OrganizationDetailsEditProps,
  OrganizationDetailsEditViewProps,
} from '@/types/my-organization/organization-management/organization-details-edit-types';

/**
 * Organization details editing form.
 *
 * A comprehensive component for editing organization details including name,
 * display name, branding, and metadata. Provides form validation, lifecycle
 * hooks for save/cancel actions, and user feedback.
 *
 * @param props - {@link OrganizationDetailsEditProps}
 * @param props.schema - Validation schema overrides
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.readOnly - Render in read-only mode
 * @param props.saveAction - Lifecycle hooks for save operation
 * @param props.cancelAction - Lifecycle hooks for cancel operation
 * @param props.hideHeader - Hide the header section
 * @param props.backButton - Back button configuration
 * @returns Organization details edit component
 *
 * @see {@link OrganizationDetailsEditProps} for full props documentation
 *
 * @example
 * ```tsx
 * <OrganizationDetailsEdit
 *   saveAction={{
 *     onBefore: () => true,
 *     onAfter: (org) => console.log('Saved:', org),
 *   }}
 *   cancelAction={{
 *     onAfter: () => navigate(-1),
 *   }}
 * />
 * ```
 */
export function OrganizationDetailsEdit({
  schema,
  customMessages = {},
  styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  readOnly = false,
  saveAction,
  cancelAction,
  hideHeader = false,
  backButton,
}: OrganizationDetailsEditProps): React.JSX.Element {
  const { error, retry, ...hook } = useOrganizationDetailsEdit({
    saveAction,
    cancelAction,
    readOnly,
    customMessages,
  });

  return (
    <GateKeeper error={error} onRetry={retry} isLoading={hook.isFetchLoading}>
      <OrganizationDetailsEditView
        {...hook}
        schema={schema}
        customMessages={customMessages}
        styling={styling}
        readOnly={readOnly}
        hideHeader={hideHeader}
        backButton={backButton}
      />
    </GateKeeper>
  );
}

/**
 * Presentational view for organization details edit.
 * @param props - Flat view props
 * @returns Organization details edit view element
 * @internal
 */
export function OrganizationDetailsEditView({
  organization,
  formActions,
  schema,
  customMessages,
  styling,
  readOnly,
  hideHeader,
  backButton,
}: OrganizationDetailsEditViewProps): React.JSX.Element {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('organization_management.organization_details_edit', customMessages);

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  return (
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
          customMessages={customMessages?.details}
          styling={styling}
          readOnly={readOnly}
          formActions={formActions}
        />
      </div>
    </div>
  );
}
