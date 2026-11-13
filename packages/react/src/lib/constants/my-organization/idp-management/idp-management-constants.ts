/**
 * Constants for IDP management components.
 * @module idp-management-constants
 * @internal
 */

export const SSO_PROVIDER_EDIT_TAB_GRID_COLUMNS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};

export const ALLOWED_CERT_EXTENSIONS = ['.pem', '.cer', '.crt'] as const;
