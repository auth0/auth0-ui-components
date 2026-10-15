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
 * - `disabled` — disabled when EITHER the host element or the component sets it
 *   (union, not "component wins": a host that passes `disabled` is honored).
 * - Other behavioral props (`type`, `aria-*`, `ref`) — component wins.
 * - `onClick` — chained: the host handler runs first; the component action is
 *   skipped when the host calls `event.preventDefault()` or when disabled.
 * - Everything else (`className`, `data-*`, children, ...) — host wins.
 *
 * The host `render` must be a single, valid, non-Fragment element (Fragments
 * silently drop the injected behavioral props → a dead button; strings/arrays
 * throw in `cloneElement`). Invalid input warns and returns `null` so the
 * caller falls back to its own default element.
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
 * @returns The cloned element with merged props, or `null` when `render` is not
 *   a single valid non-Fragment element (caller should render its default).
 */
export function mergeRenderProp(
  render: React.ReactElement,
  ownProps: RenderPropOwnProps,
): React.ReactElement | null {
  if (!React.isValidElement(render) || render.type === React.Fragment) {
    console.warn(
      '🚨 [Auth0 Components Warning]: The `render` prop must be a single valid ' +
        'host element (not a Fragment, string, number, or array). Falling back to ' +
        'the default action. Wrap multiple nodes in one element, e.g. ' +
        '`render={<button><Icon />Add</button>}`.',
    );
    return null;
  }

  const hostProps = (render.props ?? {}) as RenderPropOwnProps;
  const { onClick: ownOnClick, disabled: ownDisabled, ...restOwnProps } = ownProps;
  const hostOnClick = hostProps.onClick;

  // Disabled if EITHER side sets it. Host elements (Link, custom buttons) may
  // not honor a native `disabled`, so gate the component action on this too.
  const mergedDisabled = Boolean(ownDisabled) || Boolean(hostProps.disabled);

  const mergedOnClick = (event: React.MouseEvent<HTMLElement>) => {
    hostOnClick?.(event);
    if (!event.defaultPrevented && !mergedDisabled) {
      ownOnClick?.(event);
    }
  };

  return React.cloneElement(render, {
    ...restOwnProps,
    disabled: mergedDisabled,
    onClick: mergedOnClick,
  } as Partial<unknown> & React.Attributes);
}
