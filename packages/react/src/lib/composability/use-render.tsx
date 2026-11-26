/**
 * Element replacement for compound leaf parts.
 *
 * Mirrors the shape of Base UI `useRender` (`render` as element or function, part
 * `state`, merged `ref`) without depending on React 19: `useId` and `props.ref`
 * are not used, so it works on React 16.11+.
 *
 * @module use-render
 * @internal
 */

import * as React from 'react';

import { cn } from '@/lib/utils';
import type { RenderElementProps, RenderProp } from '@/types/composability-types';

/**
 * Props the part always owns. The host cannot override them, because they carry
 * the part's semantics (pending, disabled, form and switch contracts).
 */
const PART_OWNED_PROPS = new Set([
  'type',
  'role',
  'checked',
  'aria-busy',
  'aria-checked',
  'aria-disabled',
  'aria-describedby',
]);

type AnyHandler = (...args: unknown[]) => unknown;

const isHandler = (key: string, value: unknown): value is AnyHandler =>
  /^on[A-Z]/.test(key) && typeof value === 'function';

const isPrevented = (arg: unknown) =>
  typeof arg === 'object' &&
  arg !== null &&
  'defaultPrevented' in arg &&
  Boolean((arg as { defaultPrevented: boolean }).defaultPrevented);

/**
 * Sets a ref of any kind.
 * @param ref - Callback or object ref.
 * @param value - Node to assign.
 */
function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

/**
 * Combines refs into one callback ref.
 * @param refs - Refs to combine.
 * @returns A callback ref, or undefined when no ref is given.
 */
export function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  const defined = refs.filter(Boolean);
  if (defined.length === 0) return undefined;
  return (node: T | null) => defined.forEach((ref) => setRef(ref, node));
}

/**
 * Reads the ref of an element on every supported React version.
 * React 19 moved `ref` into props; earlier versions keep it on the element.
 * @param element - Element to read.
 * @returns The element's ref.
 */
function getElementRef(element: React.ReactElement): React.Ref<unknown> | undefined {
  const fromProps = (element.props as { ref?: React.Ref<unknown> }).ref;
  if (fromProps) return fromProps;
  return (element as unknown as { ref?: React.Ref<unknown> }).ref ?? undefined;
}

/**
 * Merges the part's props with props the host put on its element.
 *
 * - Event handlers chain: the host runs first, and calling `event.preventDefault()`
 *   skips the part's handler.
 * - `disabled` is set when either side sets it.
 * - `className` concatenates and `style` merges, host last.
 * - {@link PART_OWNED_PROPS} keep the part's value.
 * - Everything else, including `aria-label` and `children`, keeps the host's value,
 *   so the visible label stays the accessible name.
 *
 * @param partProps - Props owned by the part.
 * @param hostProps - Props on the host element.
 * @returns Merged props.
 */
export function mergeProps(
  partProps: RenderElementProps,
  hostProps: RenderElementProps,
): RenderElementProps {
  const merged: RenderElementProps = { ...partProps };

  Object.keys(hostProps).forEach((key) => {
    const hostValue = hostProps[key];
    const partValue = partProps[key];

    if (key === 'ref') return;
    if (key === 'className') {
      merged.className = cn(partProps.className, hostProps.className);
    } else if (key === 'style') {
      merged.style = { ...partProps.style, ...hostProps.style };
    } else if (key === 'disabled') {
      merged.disabled = Boolean(partValue) || Boolean(hostValue);
    } else if (isHandler(key, hostValue) && isHandler(key, partValue)) {
      merged[key] = (...args: unknown[]) => {
        hostValue(...args);
        if (!isPrevented(args[0])) partValue(...args);
      };
    } else if (!PART_OWNED_PROPS.has(key) || partValue === undefined) {
      merged[key] = hostValue;
    }
  });

  return merged;
}

/**
 * Turns part state into `data-*` attributes, e.g. `{ pending: true }` becomes
 * `data-pending=""`, so hosts can style state without the function form.
 * @param state - Part state.
 * @returns Data attributes for truthy boolean state.
 */
function getStateAttributes(state: object): Record<string, string> {
  const attributes: Record<string, string> = {};
  Object.entries(state).forEach(([key, value]) => {
    if (value === true) {
      attributes[`data-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = '';
    }
  });
  return attributes;
}

export interface UseRenderParams<State extends object> {
  /** Host replacement. When absent, `defaultRender` is used. */
  render?: RenderProp<State>;
  /** Renders the part's own element from the merged props. */
  defaultRender: (props: RenderElementProps, state: State) => React.ReactElement;
  /** Props the part owns: handlers, disabled, ARIA, contracts. */
  props: RenderElementProps;
  /** Part state passed to function renders and exposed as `data-*`. */
  state: State;
  /** Ref forwarded to the rendered element. */
  ref?: React.Ref<unknown>;
}

/**
 * Renders a leaf part as its default element or as a host replacement, with the
 * part's behaviour merged in. The part's handler is skipped while disabled, so
 * hosts that ignore a native `disabled` (links, custom buttons) stay inert.
 *
 * @param params - {@link UseRenderParams}
 * @returns The element to render.
 */
export function useRender<State extends object>({
  render,
  defaultRender,
  props,
  state,
  ref,
}: UseRenderParams<State>): React.ReactElement {
  const disabled = Boolean(props.disabled);
  const partProps: RenderElementProps = {
    ...getStateAttributes(state),
    ...props,
    ...(disabled ? { 'aria-disabled': true } : {}),
  };

  if (render === undefined) {
    return defaultRender({ ...partProps, ref }, state);
  }

  if (typeof render === 'function') {
    return render({ ...partProps, ref }, state);
  }

  if (!React.isValidElement(render) || render.type === React.Fragment) {
    console.warn(
      '🚨 [Auth0 Components Warning]: `render` must be a single element (not a Fragment, ' +
        'string or array). The default element is rendered instead.',
    );
    return defaultRender({ ...partProps, ref }, state);
  }

  const hostProps = (render.props ?? {}) as RenderElementProps;
  const merged = mergeProps(partProps, hostProps);
  if (disabled) {
    // Links and custom buttons may ignore a native `disabled`; keep them inert.
    merged.onClick = (event: React.SyntheticEvent) => event.preventDefault();
  }

  return React.cloneElement(render, {
    ...merged,
    ref: composeRefs(getElementRef(render), ref),
  } as React.Attributes);
}

/**
 * Props for a button-like action.
 * @param options - Action contract.
 * @param options.onClick - Command to run.
 * @param options.disabled - Whether the action is unavailable.
 * @param options.pending - Whether the command is running.
 * @returns Part props for {@link useRender}.
 */
export function getButtonContract({
  onClick,
  disabled,
  pending,
}: {
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  disabled: boolean;
  pending: boolean;
}): RenderElementProps {
  return {
    type: 'button',
    disabled: disabled || pending,
    'aria-busy': pending || undefined,
    onClick,
  };
}

/**
 * Props for an action that submits the enclosing form. The form's `onSubmit`
 * owns the command, so no click handler is attached.
 * @param options - Submit contract.
 * @param options.disabled - Whether submitting is unavailable.
 * @param options.pending - Whether the submit is running.
 * @param options.form - Id of the form to submit when rendered outside it.
 * @returns Part props for {@link useRender}.
 */
export function getSubmitContract({
  disabled,
  pending,
  form,
}: {
  disabled: boolean;
  pending: boolean;
  form?: string;
}): RenderElementProps {
  return {
    type: 'submit',
    disabled: disabled || pending,
    'aria-busy': pending || undefined,
    ...(form ? { form } : {}),
  };
}

/**
 * Props for a toggle that renders as a switch.
 * @param options - Switch contract.
 * @param options.checked - Current value.
 * @param options.onCheckedChange - Called with the next value.
 * @param options.disabled - Whether toggling is unavailable.
 * @param options.pending - Whether the change is being saved.
 * @returns Part props for {@link useRender}.
 */
export function getSwitchContract({
  checked,
  onCheckedChange,
  disabled,
  pending,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled: boolean;
  pending: boolean;
}): RenderElementProps {
  return {
    type: 'button',
    role: 'switch',
    checked,
    'aria-checked': checked,
    disabled: disabled || pending,
    'aria-busy': pending || undefined,
    onCheckedChange,
  };
}
