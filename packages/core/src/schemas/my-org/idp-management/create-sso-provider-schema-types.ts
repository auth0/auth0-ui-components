/**
 * Schema configuration for Step 1: Provider Selection
 */
export interface ProviderSelectionSchema {
  strategy?: {
    required?: boolean;
    errorMessage?: string;
  };
}

/**
 * Schema configuration for Step 2: Provider Details
 */
export interface ProviderDetailsSchema {
  name?: {
    regex?: RegExp;
    errorMessage?: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  };
  displayName?: {
    regex?: RegExp;
    errorMessage?: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  };
}

//TODO: to update once all the step components are done
export interface SsoProviderSchema {
  name?: {
    regex?: RegExp;
    errorMessage?: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  };
  displayName?: {
    regex?: RegExp;
    errorMessage?: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  };
  strategy?: {
    required?: boolean;
    errorMessage?: string;
  };
}
