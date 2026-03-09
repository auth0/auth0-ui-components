/**
 * Theme utility functions for applying styles and CSS variables.
 * @module theme-utils
 * @internal
 */

import type { StylingVariables, MergedStyles } from './theme-types';

/**
 * Returns the merged CSS variables for the current theme.
 * @internal
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
 * @internal
 *
 * @param styling - Object containing styling configuration.
 * @param styling.variables - Optional styling variables for common, light, and dark themes.
 * @param styling.classes - Optional custom CSS class mappings.
 * @param isDarkMode - Boolean indicating if dark mode is active.
 * @returns Merged styles with variables and classNames.
 */
export const getComponentStyles = (
  styling: { variables?: StylingVariables; classes?: Record<string, string | undefined> } = {},
  isDarkMode = false,
): MergedStyles => {
  const stylingVars = styling.variables;
  const coreStyles = getCoreStyles(stylingVars, isDarkMode);

  return {
    variables: coreStyles.variables,
    classes: styling.classes,
  };
};

/**
 * Apply theme styling to document and set CSS variables.
 * Targets `.auth0-universal` scoped elements when present, falls back to `<html>`.
 * @internal
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
  const { variables } = getCoreStyles(styling, isDarkMode);

  // Find all scoped containers; fall back to <html> for unscoped consumers
  const scopedElements = document.querySelectorAll<HTMLElement>('.auth0-universal');
  const targets: HTMLElement[] =
    scopedElements.length > 0 ? Array.from(scopedElements) : [document.documentElement];

  for (const el of targets) {
    el.dataset.theme = theme;

    if (isDarkMode) {
      el.classList.add('dark');
    } else {
      el.classList.remove('dark');
    }

    // Apply CSS variable overrides (if any) — only string values
    for (const [key, value] of Object.entries(variables)) {
      if (typeof value === 'string') {
        el.style.setProperty(key, value as string);
      }
    }
  }
}
