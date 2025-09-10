import type {
  OrganizationDetailFormValues,
  OrgDetailsCustomMessages,
  SharedComponentProps,
  OrganizationDetailSchemaValidation,
} from '@auth0-web-ui-components/core';
import type { UseFormReturn } from 'react-hook-form';

import type { FormActionsProps } from '@/components/ui/form-actions';

export interface OrgDetailsClasses {
  'OrgDetails-card'?: string;
}

export interface OrgDetailsFormActions extends Omit<FormActionsProps, 'nextAction'> {
  nextAction?: {
    label?: string;
    disabled?: boolean;
    onClick?: (data: OrganizationDetailFormValues & { id?: string }) => boolean | Promise<boolean>;
    className?: string;
  };
}

export interface OrgDetailsProps
  extends SharedComponentProps<
    OrgDetailsCustomMessages,
    OrgDetailsClasses,
    OrganizationDetailSchemaValidation
  > {
  organization?: Partial<OrganizationDetailFormValues> & { id?: string };
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
