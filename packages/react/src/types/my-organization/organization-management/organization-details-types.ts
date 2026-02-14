import type {
  SharedComponentProps,
  OrganizationPrivate,
  OrganizationDetailsSchemas as CoreOrganizationDetailsSchemas,
  OrganizationDetailsFormValues,
  OrganizationDetailsMessages,
} from '@auth0/universal-components-core';
import type { UseFormReturn } from 'react-hook-form';

import type { FormActionsProps } from '@/components/auth0/shared/form-actions';

/* ============ Components ============ */

/**
 * Styling that can be used to override default styles.
 */
export interface OrganizationDetailsClasses {
  OrganizationDetails_Card?: string;
  OrganizationDetails_FormActions?: string;
  OrganizationDetails_SettingsDetails?: string;
  OrganizationDetails_BrandingDetails?: string;
}

/**
 * Schemas that can be used to override default schemas.
 */
export type OrganizationDetailsSchemas = CoreOrganizationDetailsSchemas;

export interface OrganizationDetailsFormActions extends Omit<FormActionsProps, 'nextAction'> {
  nextAction?: {
    disabled: boolean;
    onClick?: (data: OrganizationPrivate) => boolean | Promise<boolean>;
  };
}

export interface OrganizationDetailsProps
  extends SharedComponentProps<
    OrganizationDetailsMessages,
    OrganizationDetailsClasses,
    OrganizationDetailsSchemas
  > {
  organization: OrganizationPrivate;
  isLoading?: boolean;
  formActions: OrganizationDetailsFormActions;
}

/* ============ Subcomponents ============ */

export interface BrandingDetailsProps
  extends SharedComponentProps<OrganizationDetailsMessages, OrganizationDetailsClasses> {
  form: UseFormReturn<OrganizationDetailsFormValues>;
  className?: string;
}

export interface SettingsDetailsProps
  extends SharedComponentProps<OrganizationDetailsMessages, OrganizationDetailsClasses> {
  form: UseFormReturn<OrganizationDetailsFormValues>;
  className?: string;
}
