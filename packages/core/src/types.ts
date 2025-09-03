import { StylingVariables } from './theme';
import { ZodObject, ZodRawShape } from 'zod';

export type SafeAny = any; // eslint-disable-line

export interface ActionButton {
  label: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon';
  icon?: unknown;
  onClick: (event: Event) => void;
  disabled?: boolean;
  className?: string;
}

export type SchemaValidation = Record<string, RegExp | ZodObject<ZodRawShape>>;

export interface SharedComponentProps<
  Messages extends object = Record<string, unknown>,
  Classes extends object = Record<string, string | undefined>,
  Schema extends SchemaValidation = SchemaValidation,
> {
  styling?: {
    variables?: StylingVariables;
    classes?: Partial<Classes>;
  };
  customMessages?: Partial<Messages>;
  schemaValidation?: Partial<Schema>;
  readOnly?: boolean;
}
