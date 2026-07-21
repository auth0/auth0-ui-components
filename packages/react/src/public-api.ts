/**
 * Public API exports for Auth0 UI components.
 * @module public-api
 */

/** Provider for SPAs using auth0-react. */
export { Auth0ComponentProvider as SpaAuth0ComponentProvider } from './providers/spa-provider';

/** Provider for RWAs using backend proxy auth. */
export { Auth0ComponentProvider as RwaAuth0ComponentProvider } from './providers/proxy-provider';

export * from './components';
export * from './hooks';
export * from './types';
