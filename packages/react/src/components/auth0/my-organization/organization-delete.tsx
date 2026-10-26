/** @module organization-delete */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { OrganizationDeleteSection } from '@/components/auth0/my-organization/shared/organization-management/organization-delete/organization-delete-section';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { useOrganizationDelete } from '@/hooks/my-organization/use-organization-delete';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import type {
  OrganizationDeleteProps,
  OrganizationDeleteViewProps,
} from '@/types/my-organization/organization-management/organization-delete-types';

/**
 * Organization delete component.
 * @param props - Component props
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.deleteAction - Lifecycle hooks for the delete action
 * @returns JSX element
 * @internal
 */
function OrganizationDelete(props: OrganizationDeleteProps): React.JSX.Element {
  useTelemetry('organization-delete');

  const {
    customMessages = {},
    styling = {
      variables: { common: {}, light: {}, dark: {} },
      classes: {},
    },
    readOnly = false,
    deleteAction,
  } = props;

  const {
    organization,
    canDelete,
    permissionDenied,
    isFetchLoading,
    isDeleteLoading,
    deleteOrganization,
  } = useOrganizationDelete({ deleteAction, readOnly, customMessages });

  return (
    <GateKeeper isLoading={isFetchLoading} styling={styling}>
      <OrganizationDeleteView
        organization={organization}
        customMessages={customMessages}
        styling={styling}
        readOnly={readOnly}
        canDelete={canDelete}
        permissionDenied={permissionDenied}
        isDeleteLoading={isDeleteLoading}
        onDelete={deleteOrganization}
      />
    </GateKeeper>
  );
}

/**
 * @internal
 * @param props - View props
 * @returns Organization Delete view element
 */
function OrganizationDeleteView({ styling, ...sectionProps }: OrganizationDeleteViewProps) {
  const { isDarkMode } = useTheme();

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  return (
    <StyledScope style={currentStyles.variables}>
      <OrganizationDeleteSection {...sectionProps} styling={currentStyles} />
    </StyledScope>
  );
}

/**
 * Organization deletion.
 *
 * Renders a danger-zone section that deletes the current organization after the
 * user types its name to confirm. Requires the `delete:my_org:organizations` permission.
 *
 * Deleting the organization invalidates the current organization-scoped token, so
 * use `deleteAction.onAfter` to redirect the user away from the deleted organization.
 *
 * @param props - {@link OrganizationDeleteProps}
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.readOnly - Render in read-only mode
 * @param props.deleteAction - Lifecycle hooks for the delete operation
 * @returns Organization delete component
 *
 * @see {@link OrganizationDeleteProps} for full props documentation
 *
 * @example
 * ```tsx
 * <OrganizationDelete
 *   deleteAction={{
 *     onAfter: () => navigate('/organizations'),
 *   }}
 * />
 * ```
 */
export { OrganizationDelete, OrganizationDeleteView };
