import type { StylingVariables, MergedStyles } from './theme-types';

/**
 * Returns the merged CSS variables for the current theme.
 *
 * @param styling - An object containing variables for common, light, and dark themes.
 * @param isDarkMode - A boolean indicating if dark mode is active.
 * @returns An object with a variables property containing the merged CSS variables.
 */
export const getCoreStyles = (
  styling: StylingVariables = { common: {}, light: {}, dark: {} },
  isDarkMode = false,
): MergedStyles => {
  return {
    variables: {
      ...(styling?.common || {}),
      ...(isDarkMode ? styling?.dark || {} : styling?.light || {}),
    },
  };
};

/**
 * Returns component styles supporting both flat and nested variable formats.
 *
 * @param styling - Object containing either direct styling variables or nested under 'variables'
 * @param isDarkMode - Boolean indicating if dark mode is active
 * @returns Merged styles with variables and classNames
 */
export const getComponentStyles = (
  styling: { variables?: StylingVariables; classNames?: Record<string, string | undefined> } = {},
  isDarkMode = false,
): MergedStyles => {
  const stylingVars = styling.variables;
  const coreStyles = getCoreStyles(stylingVars, isDarkMode);

  return {
    variables: coreStyles.variables,
    classNames: styling.classNames,
  };
};

/**
 * Apply theme styling to document and set CSS variables
 *
 * @param styling - Theme variables to apply
 * @param mode - Theme mode (dark/light)
 * @param theme - UI theme variant
 */
export function applyStyleOverrides(
  styling: StylingVariables,
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
  const { variables } = getCoreStyles(styling, isDarkMode);

  // Apply only string values directly
  for (const [key, value] of Object.entries(variables)) {
    if (typeof value === 'string') {
      htmlElement.style.setProperty(key, value);
    }
  }
}
