export interface StylingVariables {
  common?: {
    // Font sizes
    '--font-size-page-header'?: string;
    '--font-size-page-description'?: string;
    '--font-size-heading'?: string;
    '--font-size-title'?: string;
    '--font-size-subtitle'?: string;
    '--font-size-body'?: string;
    '--font-size-paragraph'?: string;
    '--font-size-label'?: string;

    // Border radius
    '--radius-xs'?: string;
    '--radius-sm'?: string;
    '--radius-md'?: string;
    '--radius-lg'?: string;
    '--radius-xl'?: string;
    '--radius-2xl'?: string;
    '--radius-3xl'?: string;
    '--radius-4xl'?: string;
    '--radius-5xl'?: string;
    '--radius-6xl'?: string;
    '--radius-7xl'?: string;
    '--radius-8xl'?: string;
    '--radius-9xl'?: string;
  };
  light?: {
    // Shadcn-compatible source variables (override these!)
    '--background'?: string;
    '--foreground'?: string;
    '--card'?: string;
    '--card-foreground'?: string;
    '--primary'?: string;
    '--primary-foreground'?: string;
    '--secondary'?: string;
    '--secondary-foreground'?: string;
    '--accent'?: string;
    '--accent-foreground'?: string;
    '--muted'?: string;
    '--muted-foreground'?: string;
    '--destructive'?: string;
    '--destructive-foreground'?: string;
    '--popover'?: string;
    '--popover-foreground'?: string;
    '--input'?: string;
    '--border'?: string;
    '--ring'?: string;

    // Custom Auth0 variables
    '--color-page'?: string;
    '--color-info'?: string;
    '--color-info-foreground'?: string;
    '--color-success'?: string;
    '--color-success-foreground'?: string;
    '--color-warning'?: string;
    '--color-warning-foreground'?: string;
    '--color-destructive-border'?: string;
    '--color-popover-border'?: string;
    '--color-input-foreground'?: string;
    '--color-input-muted'?: string;

    // Shadows
    '--shadow-bevel-xs'?: string;
    '--shadow-bevel-sm'?: string;
    '--shadow-bevel-md'?: string;
    '--shadow-bevel-lg'?: string;
    '--shadow-bevel-xl'?: string;
    '--shadow-bevel-2xl'?: string;
    '--shadow-button-resting'?: string;
    '--shadow-button-hover'?: string;
    '--shadow-button-focus'?: string;
    '--shadow-button-destructive-resting'?: string;
    '--shadow-button-destructive-hover'?: string;
    '--shadow-button-destructive-focus'?: string;
    '--shadow-button-outlined-resting'?: string;
    '--shadow-button-outlined-hover'?: string;
    '--shadow-button-outlined-focus'?: string;
    '--shadow-input-resting'?: string;
    '--shadow-input-hover'?: string;
    '--shadow-input-focus'?: string;
    '--shadow-input-destructive-resting'?: string;
    '--shadow-input-destructive-hover'?: string;
    '--shadow-input-destructive-focus'?: string;
    '--shadow-checkbox-resting'?: string;
    '--shadow-checkbox-hover'?: string;
    '--shadow-switch-resting'?: string;
    '--shadow-switch-hover'?: string;
    '--shadow-switch-focus'?: string;
    '--shadow-switch-thumb'?: string;
    '--shadow-switch-thumb-dark'?: string;
  };
  dark?: {
    // Shadcn-compatible source variables
    '--background'?: string;
    '--foreground'?: string;
    '--card'?: string;
    '--card-foreground'?: string;
    '--primary'?: string;
    '--primary-foreground'?: string;
    '--secondary'?: string;
    '--secondary-foreground'?: string;
    '--accent'?: string;
    '--accent-foreground'?: string;
    '--muted'?: string;
    '--muted-foreground'?: string;
    '--destructive'?: string;
    '--destructive-foreground'?: string;
    '--popover'?: string;
    '--popover-foreground'?: string;
    '--input'?: string;
    '--border'?: string;
    '--ring'?: string;

    // Custom Auth0 variables
    '--color-page'?: string;
    '--color-info'?: string;
    '--color-info-foreground'?: string;
    '--color-success'?: string;
    '--color-success-foreground'?: string;
    '--color-warning'?: string;
    '--color-warning-foreground'?: string;
    '--color-destructive-border'?: string;
    '--color-popover-border'?: string;
    '--color-input-foreground'?: string;
    '--color-input-muted'?: string;

    // Shadows
    '--shadow-bevel-xs'?: string;
    '--shadow-bevel-sm'?: string;
    '--shadow-bevel-md'?: string;
    '--shadow-bevel-lg'?: string;
    '--shadow-bevel-xl'?: string;
    '--shadow-bevel-2xl'?: string;
    '--shadow-button-resting'?: string;
    '--shadow-button-hover'?: string;
    '--shadow-button-focus'?: string;
    '--shadow-button-destructive-resting'?: string;
    '--shadow-button-destructive-hover'?: string;
    '--shadow-button-destructive-focus'?: string;
    '--shadow-button-outlined-resting'?: string;
    '--shadow-button-outlined-hover'?: string;
    '--shadow-button-outlined-focus'?: string;
    '--shadow-input-resting'?: string;
    '--shadow-input-hover'?: string;
    '--shadow-input-focus'?: string;
    '--shadow-input-destructive-resting'?: string;
    '--shadow-input-destructive-hover'?: string;
    '--shadow-input-destructive-focus'?: string;
    '--shadow-checkbox-resting'?: string;
    '--shadow-checkbox-hover'?: string;
    '--shadow-switch-resting'?: string;
    '--shadow-switch-hover'?: string;
    '--shadow-switch-focus'?: string;
    '--shadow-switch-thumb'?: string;
    '--shadow-switch-thumb-dark'?: string;
  };
}

export type MergedStyles = {
  variables: {
    [K in
      | keyof NonNullable<StylingVariables>['common']
      | keyof NonNullable<StylingVariables>['light']
      | keyof NonNullable<StylingVariables>['dark']]?: string;
  };
  classes?: Record<string, string | undefined>;
};
