import type {
  Organization,
  OrgDetailsCustomMessages,
  SharedComponentProps,
  OrganizationDetailSchemaValidation,
  OrganizationDetailFormValues,
} from '@auth0-web-ui-components/core';
import type { UseFormReturn } from 'react-hook-form';

import type { FormActionsProps } from '@/components/ui/form-actions';

export interface OrgDetailsClasses {
  'OrgDetails-card'?: string;
  'OrgDetails-formActions'?: string;
  'OrgDetails-SettingsDetails'?: string;
  'OrgDetails-BrandingDetails'?: string;
}

export interface OrgDetailsFormActions extends Omit<FormActionsProps, 'nextAction'> {
  nextAction?: {
    disabled: boolean;
    onClick?: (data: Organization) => boolean | Promise<boolean>;
  };
}

export interface OrgDetailsProps
  extends SharedComponentProps<
    OrgDetailsCustomMessages,
    OrgDetailsClasses,
    OrganizationDetailSchemaValidation
  > {
  organization?: Partial<Organization>;
  isLoading?: boolean;
  formActions: OrgDetailsFormActions;
}

export interface BrandingDetailsProps
  extends SharedComponentProps<OrgDetailsCustomMessages, OrgDetailsClasses> {
  form: UseFormReturn<OrganizationDetailFormValues>;
}

export interface SettingsDetailsProps
  extends SharedComponentProps<OrgDetailsCustomMessages, OrgDetailsClasses> {
  form: UseFormReturn<OrganizationDetailFormValues>;
}
