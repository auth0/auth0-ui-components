/**
 * My Account organization data mappers for API transformations.
 * @module organization-management-mappers
 */

import type { OrganizationPrivate } from '../../my-organization/organization-management/organization-details-types';

import type { CreateUserOrganizationRequest } from './organization-management-types';

const hasValue = (value: string | undefined): value is string => !!value && value.trim() !== '';

export const UserOrganizationMappers = {
  /**
   * Builds the `POST /me/organizations` body from organization form values.
   * Empty optional fields are omitted; colors are sent only as a complete pair.
   * @param formValues - Values from the organization form.
   * @returns Create organization request body.
   */
  createToAPI(formValues: OrganizationPrivate): CreateUserOrganizationRequest {
    const { display_name: displayName } = formValues;
    const { logo_url: logoUrl, colors } = formValues.branding;
    const { primary, page_background } = colors;
    const logo = hasValue(logoUrl) ? { logo_url: logoUrl.trim() } : {};
    const brandColors =
      hasValue(primary) && hasValue(page_background)
        ? { colors: { primary, page_background } }
        : {};
    const branding = { ...logo, ...brandColors };

    return {
      name: (formValues.name ?? '').trim(),
      ...(hasValue(displayName) ? { display_name: displayName.trim() } : {}),
      ...(Object.keys(branding).length > 0 ? { branding } : {}),
    };
  },
};
