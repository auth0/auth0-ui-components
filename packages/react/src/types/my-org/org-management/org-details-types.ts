import type {
  OrganizationDetailFormValues,
  OrgDetailsCustomMessages,
  SharedComponentProps,
  ActionButton,
  OrganizationDetailSchemaValidation,
} from '@auth0-web-ui-components/core';
import { FormActionsProps } from '@/components/ui/form-actions';
import { UseFormReturn } from 'react-hook-form';

export interface OrgDetailsClasses {
  'OrgDetails-card'?: string;
}

export interface OrgDetailsFormActions extends Omit<FormActionsProps, 'nextAction'> {
  nextAction?: ActionButton & {
    onClick?: (data: OrganizationDetailFormValues) => void | Promise<void>;
  };
}

export interface OrgDetailsProps
  extends SharedComponentProps<
    OrgDetailsCustomMessages,
    OrgDetailsClasses,
    OrganizationDetailSchemaValidation
  > {
  organization?: Partial<OrganizationDetailFormValues>;
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
