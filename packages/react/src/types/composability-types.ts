/**
 * Shared types for compound (composable) components.
 * @module composability-types
 */

import type * as React from 'react';

/** Props a part hands to the element it renders. */
export type RenderElementProps = Record<string, unknown> & {
  // The rendered element type is chosen by the host, so the ref cannot be narrowed.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref?: React.Ref<any>;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Replaces the element a leaf part renders while the part keeps its behaviour.
 *
 * - Element form: the host element is cloned and the part's props are merged into it.
 * - Function form: the host receives the merged props and the part state, and must
 *   spread the props onto its element.
 *
 * @example
 * ```tsx
 * <Part render={<HostButton />} />
 * <Part render={(props, state) => <HostButton {...props} loading={state.pending} />} />
 * ```
 */
export type RenderProp<State> =
  | React.ReactElement
  | ((props: RenderElementProps, state: State) => React.ReactElement);

/** State every action part exposes to `render` and as `data-*` attributes. */
export interface ActionPartState {
  /** The action's command is running. */
  pending: boolean;
  /** The action cannot be triggered. */
  disabled: boolean;
}

/** Props shared by action leaf parts. */
export interface ActionPartProps {
  /** Replace the rendered element. See {@link RenderProp}. */
  render?: RenderProp<ActionPartState>;
  /** Content of the default element. Defaults to the translated label. */
  children?: React.ReactNode;
  className?: string;
}
