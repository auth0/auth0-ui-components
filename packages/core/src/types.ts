export type SafeAny = any; // eslint-disable-line

export interface ActionButton {
  label: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon';
  icon?: unknown;
  onClick: (event: Event) => void;
  disabled?: boolean;
}
