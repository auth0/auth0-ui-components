/**
 * Apply style overrides to the :root element or .dark class based on the theme mode.
 *
 * @param styleOverrides - An object containing CSS variable overrides.
 * @param mode - The current theme mode ('dark' or 'light').
 */
export function applyStyleOverrides(styleOverrides: Record<string, string>, mode?: string): void {
  const target = mode === 'dark' ? '.dark' : ':root';
  const elements = document.querySelectorAll(target);

  elements.forEach((element) => {
    Object.entries(styleOverrides).forEach(([key, value]) => {
      (element as HTMLElement).style.setProperty(key, value);
    });
  });
}
