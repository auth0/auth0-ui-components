/** @module organization-details-edit */

import {
  getComponentStyles,
  MY_ORGANIZATION_DETAILS_EDIT_SCOPES,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { OrganizationDetails } from '@/components/auth0/my-organization/shared/organization-management/organization-details/organization-details';
import { Header } from '@/components/auth0/shared/header';
import { Spinner } from '@/components/ui/spinner';
import { withMyOrganizationService } from '@/hoc/with-services';
import { useOrganizationDetailsEdit } from '@/hooks/my-organization/use-organization-details-edit';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  OrganizationDetailsEditProps,
  OrganizationDetailsEditLogicProps,
  OrganizationDetailsEditHandlerProps,
  OrganizationDetailsEditViewProps,
} from '@/types/my-organization/organization-management/organization-details-edit-types';

/**
 * Internal organization details edit container component.
 * @param props - Component props
 * @param props.schema - Zod validation schema
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.saveAction - Configuration for the save action
 * @param props.cancelAction - Configuration for the cancel action
 * @param props.hideHeader - Whether to hide the header
 * @param props.backButton - Configuration for the back button
 * @returns JSX element
 * @internal
 */
function OrganizationDetailsEditContainer(props: OrganizationDetailsEditProps): React.JSX.Element {
  const {
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
  } = props;

  const { organization, isFetchLoading, formActions } = useOrganizationDetailsEdit({
    saveAction,
    cancelAction,
    readOnly,
    customMessages,
  });

  const orgDetailsEditLogicProps: OrganizationDetailsEditLogicProps = {
    organization,
    isFetchLoading,
    schema,
    styling,
    customMessages,
    readOnly,
    hideHeader,
    backButton,
  };

  const orgDetailsEditHandlerProps: OrganizationDetailsEditHandlerProps = {
    formActions,
  };

  return (
    <OrganizationDetailsEditView
      logic={orgDetailsEditLogicProps}
      handlers={orgDetailsEditHandlerProps}
    />
  );
}

/**
 * OrganizationDetailsEditView — Presentational component.
 * @param props - View props with logic and handlers
 * @returns Organization Details Edit view element
 * @internal
 */
function OrganizationDetailsEditView({ logic, handlers }: OrganizationDetailsEditViewProps) {
  const {
    organization,
    isFetchLoading,
    schema,
    styling,
    customMessages,
    readOnly,
    hideHeader,
    backButton,
  } = logic;
  const { formActions } = handlers;
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('organization_management.organization_details_edit', customMessages);

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
const OrganizationDetailsEdit: React.ComponentType<OrganizationDetailsEditProps> =
  withMyOrganizationService(OrganizationDetailsEditContainer, MY_ORGANIZATION_DETAILS_EDIT_SCOPES);

export { OrganizationDetailsEdit, OrganizationDetailsEditView };
