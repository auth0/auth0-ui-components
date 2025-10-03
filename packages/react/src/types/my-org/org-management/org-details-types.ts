import {
  type SharedComponentProps,
  type OrganizationPrivate,
  type OrgDetailsSchemas as CoreOrgDetailsSchemas,
  type OrganizationDetailsFormValues,
} from '@auth0-web-ui-components/core';
import type { UseFormReturn } from 'react-hook-form';

import type { FormActionsProps } from '@/components/ui/form-actions';

/* ============ Components ============ */

/**
 * Messages that can be used to override default messages.
 */
export interface OrgDetailsMessages {
  sections?: {
    settings?: {
      title?: string;
      fields?: {
        name?: {
          label?: string;
          placeholder?: string;
          helper_text?: string;
          error?: string;
        };
        display_name?: {
          label?: string;
          placeholder?: string;
          helper_text?: string;
          error?: string;
        };
      };
    };
    branding?: {
      title?: string;
      fields?: {
        logo?: {
          label?: string;
          helper_text?: string;
          error?: string;
        };
        primary_color?: {
          label?: string;
          helper_text?: string;
          error?: string;
        };
        page_background_color?: {
          label?: string;
          helper_text?: string;
          error?: string;
        };
      };
    };
  };
  unsaved_changes_text?: string;
  submit_button_label?: string;
  cancel_button_label?: string;
}

/**
 * Styling that can be used to override default styles.
 */
export interface OrgDetailsClasses {
  OrgDetails_Card?: string;
  OrgDetails_FormActions?: string;
  OrgDetails_SettingsDetails?: string;
  OrgDetails_BrandingDetails?: string;
}

/**
 * Schemas that can be used to override default schemas.
 */
export type OrgDetailsSchemas = CoreOrgDetailsSchemas;

export interface OrgDetailsFormActions extends Omit<FormActionsProps, 'nextAction'> {
  nextAction?: {
    disabled: boolean;
    onClick?: (data: OrganizationPrivate) => boolean | Promise<boolean>;
  };
}

export interface OrgDetailsProps
  extends SharedComponentProps<OrgDetailsMessages, OrgDetailsClasses, OrgDetailsSchemas> {
  organization: OrganizationPrivate;
  isLoading?: boolean;
  formActions: OrgDetailsFormActions;
}

/* ============ Subcomponents ============ */

export interface BrandingDetailsProps
  extends SharedComponentProps<OrgDetailsMessages, OrgDetailsClasses> {
  form: UseFormReturn<OrganizationDetailsFormValues>;
  className?: string;
}

export interface SettingsDetailsProps
  extends SharedComponentProps<OrgDetailsMessages, OrgDetailsClasses> {
  form: UseFormReturn<OrganizationDetailsFormValues>;
  className?: string;
}
