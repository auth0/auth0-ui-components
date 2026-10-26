/** @module organization-create */

import {
  getComponentStyles,
  ORGANIZATION_CREATE_DISPLAY_NAME_MAX_LENGTH,
  ORGANIZATION_CREATE_LOGO_URL_REGEX,
  ORGANIZATION_CREATE_NAME_MAX_LENGTH,
  ORGANIZATION_CREATE_NAME_REGEX,
  type OrganizationDetailsMessages,
  type OrganizationDetailsSchemas,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { OrganizationDetails } from '@/components/auth0/my-organization/shared/organization-management/organization-details/organization-details';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { Header } from '@/components/auth0/shared/header';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { useOrganizationCreate } from '@/hooks/my-account/use-organization-create';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  OrganizationCreateProps,
  OrganizationCreateViewProps,
} from '@/types/my-account/organization-management/organization-create-types';

/**
 * Organization create component.
 * @param props - Component props
 * @param props.schema - Validation schema overrides
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.hideHeader - Whether to hide the header
 * @param props.backButton - Configuration for the back button
 * @param props.createAction - Lifecycle hooks for the create action
 * @returns JSX element
 * @internal
 */
function OrganizationCreate(props: OrganizationCreateProps): React.JSX.Element {
  useTelemetry('organization-create');

  const {
    schema,
    customMessages = {},
    styling = {
      variables: { common: {}, light: {}, dark: {} },
      classes: {},
    },
    readOnly = false,
    hideHeader = false,
    backButton,
    createAction,
  } = props;

  const { organization, formActions } = useOrganizationCreate({
    createAction,
    readOnly,
    customMessages,
  });

  return (
    <GateKeeper styling={styling}>
      <OrganizationCreateView
        organization={organization}
        schema={schema}
        styling={styling}
        customMessages={customMessages}
        readOnly={readOnly}
        hideHeader={hideHeader}
        backButton={backButton}
        formActions={formActions}
      />
    </GateKeeper>
  );
}

/**
 * @internal
 * @param props - View props
 * @returns Organization Create view element
 */
function OrganizationCreateView({
  organization,
  schema,
  styling,
  customMessages,
  readOnly,
  hideHeader,
  backButton,
  formActions,
}: OrganizationCreateViewProps) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('organization_management.organization_create', customMessages);

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  // Match the create endpoint's rules (underscores allowed, no `org_` prefix, length limits, https logo).
  const detailsSchema = React.useMemo(
    (): OrganizationDetailsSchemas => ({
      ...schema?.details,
      name: {
        regex: ORGANIZATION_CREATE_NAME_REGEX,
        maxLength: ORGANIZATION_CREATE_NAME_MAX_LENGTH,
        ...schema?.details?.name,
      },
      displayName: {
        maxLength: ORGANIZATION_CREATE_DISPLAY_NAME_MAX_LENGTH,
        ...schema?.details?.displayName,
      },
      logoURL: {
        regex: ORGANIZATION_CREATE_LOGO_URL_REGEX,
        ...schema?.details?.logoURL,
      },
    }),
    [schema?.details],
  );

  // Create-specific defaults for the shared form; `t` already applies overrides from `customMessages.details`.
  const detailsMessages = React.useMemo((): OrganizationDetailsMessages => {
    const details = customMessages?.details;
    const fields = details?.sections?.settings?.fields;
    return {
      ...details,
      submit_button_label: t('details.submit_button_label'),
      sections: {
        ...details?.sections,
        settings: {
          ...details?.sections?.settings,
          fields: {
            ...fields,
            name: {
              ...fields?.name,
              placeholder: t('details.sections.settings.fields.name.placeholder'),
            },
            display_name: {
              ...fields?.display_name,
              placeholder: t('details.sections.settings.fields.display_name.placeholder'),
            },
          },
        },
      },
    };
  }, [customMessages?.details, t]);

  return (
    <StyledScope style={currentStyles.variables}>
      <div className="w-full">
        {!hideHeader && (
          <div className={currentStyles.classes?.['OrganizationCreate-header'] ?? 'mb-8'}>
            <Header
              title={t('header.title')}
              backButton={backButton && { ...backButton, text: t('header.back_button_text') }}
            />
          </div>
        )}

        <OrganizationDetails
          organization={organization}
          schema={detailsSchema}
          customMessages={detailsMessages}
          styling={styling}
          readOnly={readOnly}
          formActions={formActions}
          showThirdPartyAccess={false}
          isThirdPartyAccessReadOnly={false}
          thirdPartyAccessDefaultValue={undefined}
        />
      </div>
    </StyledScope>
  );
}

/**
 * Organization creation form.
 *
 * Creates an organization the authenticated user belongs to (My Account API,
 * `POST /me/organizations`) with name, display name, and branding. The tenant must have
 * a default Organization Profile, and the user must be signed in with an allowed connection.
 * Requires the `create:me:organizations` scope on the My Account API token.
 *
 * @param props - {@link OrganizationCreateProps}
 * @param props.schema - Validation schema overrides
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.readOnly - Render in read-only mode
 * @param props.hideHeader - Hide the header section
 * @param props.backButton - Back button configuration
 * @param props.createAction - Lifecycle hooks for the create operation
 * @returns Organization create component
 *
 * @see {@link OrganizationCreateProps} for full props documentation
 *
 * @example
 * ```tsx
 * <OrganizationCreate
 *   backButton={{ onClick: () => navigate('/organizations') }}
 *   createAction={{
 *     onAfter: () => navigate('/organizations'),
 *   }}
 * />
 * ```
 */
export { OrganizationCreate, OrganizationCreateView };
