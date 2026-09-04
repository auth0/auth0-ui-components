/**
 * Element-replacement helper for compound action parts.
 *
 * Merges a host-supplied element (the `render` prop on parts like
 * `CreateAction`) with the behavioral props the component owns. We use
 * `React.cloneElement` with explicit prop merging rather than a Radix-style
 * `asChild`/`Slot`, because host elements (`ProductButton`, `Link`, ...) do not
 * reliably forward refs or accept arbitrary DOM props.
 *
 * Merge rules:
 * - Behavioral props (`disabled`, `type`, `aria-*`, `ref`) — component wins.
 * - `onClick` — chained: the host handler runs first; the component action is
 *   skipped when the host calls `event.preventDefault()` or when `disabled`.
 * - Everything else (`className`, `data-*`, children, ...) — host wins.
 *
 * @module render-prop
 * @internal
 */

import * as React from 'react';

/** Behavioral props a compound action part contributes to its rendered element. */
export interface RenderPropOwnProps {
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  ref?: React.Ref<HTMLElement>;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  [key: string]: unknown;
}

/**
 * Clones `render` and merges the component's own behavioral props onto it.
 *
 * @param render - Host-supplied element used to replace the default leaf.
 * @param ownProps - Behavioral props owned by the compound part.
 * @returns The cloned element with merged props.
 */
export function mergeRenderProp(
  render: React.ReactElement,
  ownProps: RenderPropOwnProps,
): React.ReactElement {
  const hostProps = (render.props ?? {}) as RenderPropOwnProps;
  const { onClick: ownOnClick, disabled: ownDisabled, ...restOwnProps } = ownProps;
  const hostOnClick = hostProps.onClick;

  const mergedOnClick = (event: React.MouseEvent<HTMLElement>) => {
    hostOnClick?.(event);
    if (!event.defaultPrevented && !ownDisabled) {
      ownOnClick?.(event);
    }
  };

  return React.cloneElement(render, {
    ...restOwnProps,
    disabled: ownDisabled ?? hostProps.disabled,
    onClick: mergedOnClick,
  } as Partial<unknown> & React.Attributes);
}
