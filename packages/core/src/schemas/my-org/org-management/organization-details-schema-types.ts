/**
 * Schemas that can be used to override default schemas.
 */
export interface OrgDetailsSchemas {
  name?: {
    errorMessage?: string;
  };
  displayName?: {
    regex?: RegExp;
    errorMessage?: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  };
  color?: {
    regex?: RegExp;
    errorMessage?: string;
  };
  logoURL?: {
    regex?: RegExp;
    errorMessage?: string;
  };
}
