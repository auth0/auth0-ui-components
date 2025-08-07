export interface Styling {
  common: Record<string, string>;
  light: Record<string, string>;
  dark: Record<string, string>;
}

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
): Record<string, string> => ({
  ...styling.common,
  ...(isDarkMode ? styling.dark : styling.light),
});

/**
 * Apply style overrides to the :root element or .dark class based on the theme mode.
 *
 * Uses getCurrentStyles to merge the common and theme-specific variables,
 * then applies them to the appropriate DOM elements.
 *
 * @param styleOverrides - An object containing CSS variable overrides.
 * @param mode - The current theme mode ('dark' or 'light'). Defaults to 'light'.
 */
export function applyStyleOverrides(
  styleOverrides: Styling,
  mode: 'dark' | 'light' = 'light',
): void {
  const isDarkMode = mode === 'dark';
  const mergedStyles = getCurrentStyles(styleOverrides, isDarkMode);
  const target = isDarkMode ? '.dark' : ':root';
  const elements = document.querySelectorAll<HTMLElement>(target);

  elements.forEach((element) => {
    Object.entries(mergedStyles).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });
  });
}
