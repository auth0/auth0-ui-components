import type {
  SharedComponentProps,
  SsoProviderSelectMessages,
  SsoProviderDetailsMessages,
  IdpStrategy,
  ProviderDetailsFormValues,
  ProviderSelectionFormValues,
} from '@auth0-web-ui-components/core';
import type { UseFormReturn } from 'react-hook-form';

export interface SsoProviderCreateClasses {
  'ProviderSelect-root'?: string;
  'ProviderDetails-root'?: string;
}

export interface ProviderSelectProps
  extends SharedComponentProps<SsoProviderSelectMessages, SsoProviderCreateClasses> {
  strategyList: IdpStrategy[];
  onClickStrategy: (strategy: IdpStrategy) => void;
  selectedStrategy?: IdpStrategy | null;
  form?: UseFormReturn<ProviderSelectionFormValues>;
  className?: string;
}

export interface ProviderDetailsProps
  extends SharedComponentProps<SsoProviderDetailsMessages, SsoProviderCreateClasses> {
  form: UseFormReturn<ProviderDetailsFormValues>;
  className?: string;
}
