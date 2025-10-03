import { DEFAULT_COLORS } from './org-details-constants';
import type { OrganizationPrivate } from './org-details-types';

export const OrgDetailsFactory = {
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
