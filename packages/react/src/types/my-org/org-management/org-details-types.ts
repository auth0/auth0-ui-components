import type {
  SharedComponentProps,
  OrganizationPrivate,
  OrgDetailsSchemas as CoreOrgDetailsSchemas,
  OrganizationDetailsFormValues,
  OrgDetailsMessages,
} from '@auth0-web-ui-components/core';
import type { UseFormReturn } from 'react-hook-form';

import type { FormActionsProps } from '@/components/ui/form-actions';

/* ============ Components ============ */

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
