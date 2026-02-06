/**
 * React components, hooks, and providers for building Auth0-powered user interfaces.
 *
 * @packageDocumentation
 */

// =============================================================================
// PROVIDERS
// =============================================================================

/**
 * Provider for Single Page Applications using auth0-react
 */
export { Auth0ComponentProvider as SpaAuth0ComponentProvider } from './providers/spa-provider';

/**
 * Provider for Regular Web Applications using backend proxy authentication
 */
export { Auth0ComponentProvider as RwaAuth0ComponentProvider } from './providers/proxy-provider';

// =============================================================================
// BLOCKS (UI Components)
// =============================================================================

export * from './blocks';

// =============================================================================
// HOOKS
// =============================================================================

export * from './hooks';

// =============================================================================
// TYPES
// =============================================================================

export * from './types';
