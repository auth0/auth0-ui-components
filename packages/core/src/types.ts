/**
 * Shared type definitions for components.
 * @module types
 * @internal
 */

import type { StylingVariables } from './theme';

/**
 * Generic object type for arbitrary key-value pairs.
 * @internal
 */
export type ArbitraryObject = Record<string, unknown>;

/**
 * Configuration for action buttons in components.
 * @internal
 */
export interface ActionButton<Item = void> {
  label: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon';
  icon?: unknown;
  onClick: Item extends void
    ? (event: Event) => void
    : (data: Item) => void | boolean | Promise<boolean>;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

/**
 * Styling configuration for components.
 * @internal
 */
export interface ComponentStyling<Classes> {
  variables?: StylingVariables;
  classes?: Partial<Classes>;
}

/**
 * Shared props for UI components.
 * @internal
 */
export interface SharedComponentProps<
  Messages extends object = Record<string, unknown>,
  Classes extends object = Record<string, string | undefined>,
  Schema extends object = object,
> {
  styling?: ComponentStyling<Classes>;
  customMessages?: Partial<Messages>;
  schema?: Partial<Schema>;
  readOnly?: boolean;
}

/**
 * Shared props for block components with additional layout options.
 * @internal
 */
export interface BlockComponentSharedProps<
  Messages extends object = Record<string, unknown>,
  Classes extends object = Record<string, string | undefined>,
  Schema extends object = object,
> extends SharedComponentProps<Messages, Classes, Schema> {
  hideHeader?: boolean;
  isLoading?: boolean;
}

/**
 * Configuration for component actions with lifecycle hooks.
 * @internal
 */
export interface ComponentAction<Item, Context = void> {
  disabled?: boolean;
  onBefore?: (item: Item, context?: Context) => boolean;
  onAfter?: (item: Item, context?: Context) => void | boolean | Promise<boolean>;
}

/**
 * Configuration for back navigation button.
 * @internal
 */
export interface BackButton {
  icon?: unknown;
  onClick: (e: Event) => void;
}
