/**
 * Public API exports for Auth0 UI components.
 * @module public-api
 */

/** Provider for SPAs using auth0-react. */
export { Auth0ComponentProvider as SpaAuth0ComponentProvider } from './providers/spa-provider';

/** Provider for RWAs using backend proxy auth. */
export { Auth0ComponentProvider as RwaAuth0ComponentProvider } from './providers/proxy-provider';

/** Provider that supplies the user's permissions to gated components. */
export { PermissionProvider } from './providers/permission-provider';

/** Components, hooks, and types re-exported from the package entry point. */
export * from './index';
