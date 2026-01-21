import { DEFAULT_COLORS } from './organization-details-constants';
import type { OrganizationPrivate } from './organization-details-types';

export const OrganizationDetailsFactory = {
  create: (): OrganizationPrivate => {
    return {
      id: '',
      name: '',
      display_name: '',
      branding: {
        logo_url: '',
        colors: {
          primary: DEFAULT_COLORS.UL_PRIMARY,
          page_background: DEFAULT_COLORS.UL_PAGE_BG,
        },
      },
    };
  },
};
