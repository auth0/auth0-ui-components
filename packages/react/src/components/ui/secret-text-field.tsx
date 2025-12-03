import * as React from 'react';

import { CopyableTextField, type CopyableTextFieldProps } from './copyable-text-field';

const SECRET_PLACEHOLDER = '••••••••••••••••';

export interface SecretTextFieldProps extends Omit<CopyableTextFieldProps, 'value' | 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  showPlaceholder?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * Text field for handling secret values (passwords, API keys, etc.).
 * Shows a placeholder when a secret exists on the server,
 * clears on focus, and filters placeholder values from form submission.
 * This should be used along with "useSecretField" hook
 */
export const SecretTextField = React.forwardRef<HTMLInputElement, SecretTextFieldProps>(
  function SecretTextField(
    {
      value = '',
      onChange,
      showPlaceholder = false,
      onFocus: onFocusProp,
      onBlur: onBlurProp,
      ...props
    },
    ref,
  ) {
    const [isTouched, setIsTouched] = React.useState(false);

    const shouldShowPlaceholder =
      showPlaceholder && !isTouched && (!value || value === SECRET_PLACEHOLDER);

    const displayValue = shouldShowPlaceholder ? SECRET_PLACEHOLDER : value;

    const handleFocus = () => {
      if (shouldShowPlaceholder || displayValue === SECRET_PLACEHOLDER) {
        setIsTouched(true);
        onChange?.('');
      }
      onFocusProp?.();
    };

    const handleBlur = () => {
      if (showPlaceholder && !value && isTouched) {
        setIsTouched(false);
      }
      onBlurProp?.();
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsTouched(true);
      onChange?.(event.target.value);
    };

    return (
      <CopyableTextField
        ref={ref}
        {...props}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
  },
);

export { SECRET_PLACEHOLDER };
