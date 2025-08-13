export interface Styling {
  common?: {
    '--font-size-heading'?: string;
    '--font-size-description'?: string;
    '--font-size-title'?: string;
    '--font-size-paragraph'?: string;
    '--font-size-label'?: string;
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
    '--color-page'?: string;
    '--color-background'?: string;
    '--color-foreground'?: string;
    '--color-card-background'?: string;
    '--color-card-foreground'?: string;
    '--color-primary'?: string;
    '--color-primary-foreground'?: string;
    '--color-secondary'?: string;
    '--color-secondary-foreground'?: string;
    '--color-accent'?: string;
    '--color-accent-foreground'?: string;
    '--color-muted'?: string;
    '--color-muted-foreground'?: string;
    '--color-border'?: string;
    '--color-ring'?: string;
    '--color-info'?: string;
    '--color-info-foreground'?: string;
    '--color-success'?: string;
    '--color-success-foreground'?: string;
    '--color-warning'?: string;
    '--color-warning-foreground'?: string;
    '--color-destructive'?: string;
    '--color-destructive-foreground'?: string;
    '--color-destructive-border'?: string;
    '--color-popover'?: string;
    '--color-popover-foreground'?: string;
    '--color-popover-border'?: string;
    '--color-input'?: string;
    '--color-input-foreground'?: string;
    '--color-input-muted'?: string;
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
  };
  dark?: {
    '--color-page'?: string;
    '--color-background'?: string;
    '--color-foreground'?: string;
    '--color-card-background'?: string;
    '--color-card-foreground'?: string;
    '--color-primary'?: string;
    '--color-primary-foreground'?: string;
    '--color-secondary'?: string;
    '--color-secondary-foreground'?: string;
    '--color-accent'?: string;
    '--color-accent-foreground'?: string;
    '--color-muted'?: string;
    '--color-muted-foreground'?: string;
    '--color-border'?: string;
    '--color-ring'?: string;
    '--color-info'?: string;
    '--color-info-foreground'?: string;
    '--color-success'?: string;
    '--color-success-foreground'?: string;
    '--color-warning'?: string;
    '--color-warning-foreground'?: string;
    '--color-destructive'?: string;
    '--color-destructive-foreground'?: string;
    '--color-destructive-border'?: string;
    '--color-popover'?: string;
    '--color-popover-foreground'?: string;
    '--color-popover-border'?: string;
    '--color-input'?: string;
    '--color-input-foreground'?: string;
    '--color-input-muted'?: string;
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
  };
}

/**
 * Type representing all possible CSS variables from the Styling interface
 */
export type MergedStyles = {
  [K in keyof Styling['common'] | keyof Styling['light'] | keyof Styling['dark']]?: string;
};

/**
 * Returns the merged CSS variables for the current theme.
 *
 * Combines the common styles with the theme-specific styles
 * based on the `isDarkMode` flag.
 *
 * @param styling - An object containing common, light, and dark style variables.
 * @param isDarkMode - A boolean indicating if dark mode is active.
 * @returns A merged object of CSS variables for the active theme.
 */
export const getCurrentStyles = (
  styling: Styling = { common: {}, light: {}, dark: {} },
  isDarkMode = false,
): MergedStyles => ({
  ...styling.common,
  ...(isDarkMode ? styling.dark : styling.light),
});

/**
 * Apply style overrides to the :root element or .dark class based on the theme mode.
 *
 * Dynamically applies the appropriate theme class to the `html` element.
 *
 * @param styling - An object containing CSS variable overrides.
 * @param mode - The current theme mode ('dark' or 'light'). Defaults to 'light'.
 * @param theme - The selected theme ('default', 'minimal', 'rounded'). Defaults to 'default'.
 */
export function applyStyleOverrides(
  styling: Styling,
  mode: 'dark' | 'light' = 'light',
  theme: 'default' | 'minimal' | 'rounded' = 'default',
): void {
  const isDarkMode = mode === 'dark';
  const htmlElement = document.documentElement;

  // Remove existing theme classes if not default
  if (theme !== 'default') {
    htmlElement.classList.remove(
      'theme-minimal',
      'theme-rounded',
      'theme-minimal-dark',
      'theme-rounded-dark',
    );

    // Add the new theme class
    const themeClass = `theme-${theme}${isDarkMode ? '-dark' : ''}`;
    htmlElement.classList.add(themeClass);
  }

  // Apply CSS variable overrides (if any)
  const mergedStyles = getCurrentStyles(styling, isDarkMode);
  Object.entries(mergedStyles).forEach(([key, value]) => {
    htmlElement.style.setProperty(key, value as string);
  });
}
