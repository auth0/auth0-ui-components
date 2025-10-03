import type { OrganizationPrivate } from '../../../services';

import type {
  GetOrganizationDetailsResponseContent,
  UpdateOrganizationDetailsRequestContent,
} from './org-details-types';

/**
 * Transforms organization API response to form values format
 *
 * @param orgData - Raw organization data from SDK API response
 * @returns Transformed data compatible with form schema
 */
export function transformToFormValues(
  orgData: GetOrganizationDetailsResponseContent,
): OrganizationPrivate {
  return {
    name: orgData.name || '',
    display_name: orgData.display_name || '',
    branding: {
      logo_url: orgData.branding?.logo_url || '',
      colors: {
        primary: orgData.branding?.colors?.primary || '',
        page_background: orgData.branding?.colors?.page_background || '',
      },
    },
  };
}

/**
 * Transforms form values to SDK API update request format
 *
 * @param formValues - Form data from UI
 * @returns Data formatted for SDK update request
 */
export function transformFromFormValues(
  formValues: OrganizationPrivate,
): UpdateOrganizationDetailsRequestContent {
  return {
    display_name: formValues.display_name,
    branding: {
      logo_url: formValues.branding.logo_url,
      colors: {
        primary: formValues.branding.colors.primary,
        page_background: formValues.branding.colors.page_background,
      },
    },
  };
}
