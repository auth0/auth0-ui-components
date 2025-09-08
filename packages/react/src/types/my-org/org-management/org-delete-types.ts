import type {
  OrganizationDetailFormValues,
  SharedComponentProps,
  OrgDeletesCustomMessages,
  OrganizationDetailSchemaValidation,
} from '@auth0-web-ui-components/core';

export interface OrgValidationSchema {
  name?: RegExp;
  displayName?: RegExp;
  color?: RegExp;
  logoURL?: RegExp;
}

export interface OrgDeleteClasses {
  'OrgDelete-card'?: string;
  'OrgDelete-button'?: string;
  'OrgDelete-modal'?: string;
}

export interface OrgDeleteProps
  extends SharedComponentProps<
    OrgDeletesCustomMessages,
    OrgDeleteClasses,
    OrganizationDetailSchemaValidation
  > {
  onDelete: (id: string) => void | Promise<void>;
  isLoading?: boolean;
  organization: Partial<OrganizationDetailFormValues> & { id: string };
}

export interface OrgDeleteModalProps
  extends SharedComponentProps<
    OrgDeletesCustomMessages,
    OrgDeleteClasses,
    OrganizationDetailSchemaValidation
  > {
  isOpen: boolean;
  onClose: () => void;
  organizationName: string;
  onDelete: () => Promise<void>;
  isLoading: boolean;
}
