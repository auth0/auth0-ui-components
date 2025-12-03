import { SECRET_PLACEHOLDER } from '../../components/ui/secret-text-field';

/**
 * Hook for managing secret fields in provider forms.
 * Handles detection of existing secrets, initial values with placeholders,
 * and filtering placeholders from form submission data.
 */
export function useSecretField<TData extends Record<string, unknown>>(
  initialData: TData | undefined,
  secretFieldName: keyof TData,
  shouldShowPlaceholder: boolean = false,
) {
  const hasExistingSecret = shouldShowPlaceholder && initialData?.[secretFieldName] === undefined;

  const getInitialSecretValue = (secretValue?: string): string => {
    return hasExistingSecret ? SECRET_PLACEHOLDER : secretValue || '';
  };

  const filterSecretFromData = <TValues extends TData>(
    values: TValues,
  ): TValues | Omit<TValues, typeof secretFieldName> => {
    if (values[secretFieldName] === SECRET_PLACEHOLDER) {
      const { [secretFieldName]: _, ...rest } = values;
      return rest as Omit<TValues, typeof secretFieldName>;
    }
    return values;
  };

  return {
    hasExistingSecret,
    getInitialSecretValue,
    filterSecretFromData,
  };
}
