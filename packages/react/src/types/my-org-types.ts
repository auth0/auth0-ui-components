import type {
  OrganizationDetailFormValues,
  OrgDetailsCustomMessages,
  SharedComponentProps,
  ActionButton,
  OrgDeletesCustomMessages,
  organizationDetailSchema,
} from '@auth0-web-ui-components/core';
import { FormActionsProps } from '@/components/ui/form-actions';

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
    {
      name?: RegExp;
      displayName?: RegExp;
      color?: RegExp;
      logoURL?: RegExp;
    }
  > {
  organization?: Partial<OrganizationDetailFormValues>;
  isLoading?: boolean;
  formActions: OrgDetailsFormActions;
}

export interface OrgDeleteClasses {
  'OrgDelete-card'?: string;
  'OrgDelete-button'?: string;
  'OrgDelete-modal'?: string;
}

export interface OrgDeleteProps
  extends SharedComponentProps<OrgDeletesCustomMessages, OrgDeleteClasses> {
  onDelete: (id: string) => void | Promise<void>;
  isLoading?: boolean;
  organization: Partial<OrganizationDetailFormValues> & { id: string };
  schema?: typeof organizationDetailSchema;
}
