import type { StylingVariables } from './theme';

export type SafeAny = any; // eslint-disable-line

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

export interface SharedComponentProps<
  Messages extends object = Record<string, unknown>,
  Classes extends object = Record<string, string | undefined>,
  Schema extends object = object,
> {
  styling?: {
    variables?: StylingVariables;
    classes?: Partial<Classes>;
  };
  customMessages?: Partial<Messages>;
  schema?: Partial<Schema>;
  readOnly?: boolean;
}

export interface BlockComponentSharedProps<
  Messages extends object = Record<string, unknown>,
  Classes extends object = Record<string, string | undefined>,
  Schema extends object = object,
> extends SharedComponentProps<Messages, Classes, Schema> {
  hideHeader?: boolean;
  isLoading?: boolean;
}

export interface ComponentAction<Item, Context = void> {
  disabled?: boolean;
  onBefore?: (item: Item, context?: Context) => boolean;
  onAfter?: (item: Item, context?: Context) => void | boolean | Promise<boolean>;
}

export interface BackButton {
  icon?: unknown;
  onClick: (e: Event) => void;
}
