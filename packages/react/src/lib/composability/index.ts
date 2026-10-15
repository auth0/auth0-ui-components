/**
 * Shared primitives for progressive composability across block components.
 * @module composability
 * @internal
 */

export {
  createComponentContext,
  type CompoundParts,
  type CreateComponentContextOptions,
} from './create-component-context';
export { mergeRenderProp, type RenderPropOwnProps } from './render-prop';
