import type {
  OrganizationDetailFormValues,
  OrgDetailsCustomMessages,
  SharedComponentProps,
  OrganizationDetailSchemaValidation,
} from '@auth0-web-ui-components/core';
import { FormActionsProps } from '@/components/ui/form-actions';
import { UseFormReturn } from 'react-hook-form';

export interface OrgDetailsClasses {
  'OrgDetails-card'?: string;
}

export interface OrgDetailsFormActions extends Omit<FormActionsProps, 'nextAction'> {
  nextAction?: {
    label?: string;
    disabled?: boolean;
    onClick?: (data: OrganizationDetailFormValues & { id?: string }) => void | Promise<void>;
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
