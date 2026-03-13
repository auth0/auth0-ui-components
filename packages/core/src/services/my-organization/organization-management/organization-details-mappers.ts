/**
 * Organization details data mappers for API transformations.
 * @module organization-details-mappers
 * @internal
 */
import type { MyOrganization } from '@auth0/myorganization-js';

import { DEFAULT_COLORS } from './organization-details-constants';
import type { OrganizationPrivate } from './organization-details-types';

export const OrganizationDetailsMappers = {
  fromAPI(
    organizationData: MyOrganization.GetOrganizationDetailsResponseContent,
  ): OrganizationPrivate {
    return {
      id: organizationData.id || '',
      name: organizationData.name || '',
      display_name: organizationData.display_name || '',
      branding: {
        logo_url: organizationData.branding?.logo_url || '',
        colors: {
          primary: organizationData.branding?.colors?.primary || DEFAULT_COLORS.UL_PRIMARY,
          page_background:
            organizationData.branding?.colors?.page_background || DEFAULT_COLORS.UL_PAGE_BG,
        },
      },
    };
  },
  toAPI(formValues: OrganizationPrivate): MyOrganization.UpdateOrganizationDetailsRequestContent {
    const updateLogo =
      formValues.branding.logo_url !== undefined &&
      formValues.branding.logo_url !== '' &&
      formValues.branding.logo_url.trim() !== '';

    const payload: MyOrganization.UpdateOrganizationDetailsRequestContent = {
      name: formValues.name,
      display_name: formValues.display_name,
      branding: {
        colors: {
          primary: formValues.branding.colors.primary,
          page_background: formValues.branding.colors.page_background,
        },
      },
    };
    if (updateLogo) {
      payload.branding!.logo_url = formValues.branding.logo_url;
    }

    return payload;
  },
};
