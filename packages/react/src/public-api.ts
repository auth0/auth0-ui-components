/**
 * Public API exports for Auth0 UI components.
 * @module public-api
 */

/** Provider for SPAs using auth0-react. */
export { Auth0ComponentProvider as SpaAuth0ComponentProvider } from './providers/spa-provider';

/** Provider for RWAs using backend proxy auth. */
export { Auth0ComponentProvider as RwaAuth0ComponentProvider } from './providers/proxy-provider';

/** Provider that eagerly fetches and caches the user's MyOrganization permissions. */
export { PermissionProvider } from './providers/permission-context';
export type {
  PermissionProviderProps,
  PermissionContextValue,
} from './providers/permission-context';

export * from './components';
export * from './hooks';
export * from './types';
