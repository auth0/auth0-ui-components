import { DEFAULT_COLORS } from './org-details-constants';
import type { OrganizationPrivate } from './org-details-types';
import type {
  GetOrganizationDetailsResponseContent,
  UpdateOrganizationDetailsRequestContent,
} from './org-details-types';

export const OrgDetailsMappers = {
  fromAPI(orgData: GetOrganizationDetailsResponseContent): OrganizationPrivate {
    return {
      id: orgData.id || '',
      name: orgData.name || '',
      display_name: orgData.display_name || '',
      branding: {
        logo_url: orgData.branding?.logo_url || '',
        colors: {
          primary: orgData.branding?.colors?.primary || DEFAULT_COLORS.UL_PRIMARY,
          page_background: orgData.branding?.colors?.page_background || DEFAULT_COLORS.UL_PAGE_BG,
        },
      },
    };
  },
  toAPI(formValues: OrganizationPrivate): UpdateOrganizationDetailsRequestContent {
    const updateLogo =
      formValues.branding.logo_url !== undefined && formValues.branding.logo_url !== '';

    return {
      display_name: formValues.display_name,
      branding: {
        logo_url: updateLogo ? formValues.branding.logo_url : undefined,
        colors: {
          primary: formValues.branding.colors.primary,
          page_background: formValues.branding.colors.page_background,
        },
      },
    };
  },
};
