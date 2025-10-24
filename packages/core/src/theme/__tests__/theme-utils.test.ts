import { describe, it, expect, beforeEach } from 'vitest';

import {
  createMockHtmlElement,
  type MockHtmlElement,
} from '../../internals/__mocks__/shared/dom.mocks';
import type { StylingVariables } from '../theme-types';
import { getCoreStyles, getComponentStyles, applyStyleOverrides } from '../theme-utils';

describe('theme-utils', () => {
  describe('getCoreStyles', () => {
    describe('when merging styling variables', () => {
      describe('in light mode', () => {
        it('should merge common and light styles', () => {
          const styling: StylingVariables = {
            common: { '--font-size-heading': '24px' },
            light: { '--color-primary': '#007bff' },
            dark: { '--color-primary': '#4dabf7' },
          };

          const result = getCoreStyles(styling, false);

          expect(result).toEqual({
            variables: {
              '--font-size-heading': '24px',
              '--color-primary': '#007bff',
            },
          });
        });
      });

      describe('in dark mode', () => {
        it('should merge common and dark styles', () => {
          const styling: StylingVariables = {
            common: { '--font-size-heading': '24px' },
            light: { '--color-primary': '#007bff' },
            dark: { '--color-primary': '#4dabf7' },
          };

          const result = getCoreStyles(styling, true);

          expect(result).toEqual({
            variables: {
              '--font-size-heading': '24px',
              '--color-primary': '#4dabf7',
            },
          });
        });
      });
    });

    describe('when handling edge cases', () => {
      it('should handle empty styling object', () => {
        const result = getCoreStyles();

        expect(result).toEqual({
          variables: {},
        });
      });

      it('should handle partial styling object', () => {
        const styling: StylingVariables = {
          common: { '--font-size-heading': '24px' },
        };

        const result = getCoreStyles(styling, false);

        expect(result).toEqual({
          variables: {
            '--font-size-heading': '24px',
          },
        });
      });
    });

    describe('when variables have conflicting keys', () => {
      it('should let dark mode override light mode variables with same key', () => {
        const styling: StylingVariables = {
          common: { '--font-size-heading': '24px' },
          light: { '--color-foreground': '#000', '--color-background': '#fff' },
          dark: { '--color-foreground': '#fff', '--color-background': '#000' },
        };

        const lightResult = getCoreStyles(styling, false);
        const darkResult = getCoreStyles(styling, true);

        expect(lightResult.variables).toHaveProperty('--color-foreground', '#000');
        expect(darkResult.variables).toHaveProperty('--color-foreground', '#fff');
      });
    });
  });

  describe('getComponentStyles', () => {
    describe('when styling has nested variables structure', () => {
      it('should merge variables and return classes', () => {
        const styling = {
          variables: {
            common: { '--font-size-heading': '24px' },
            light: { '--color-primary': '#007bff' },
            dark: { '--color-primary': '#4dabf7' },
          },
          classes: { container: 'custom-container' },
        };

        const result = getComponentStyles(styling, false);

        expect(result.variables).toEqual({
          '--font-size-heading': '24px',
          '--color-primary': '#007bff',
        });
        expect(result.classes).toEqual({ container: 'custom-container' });
      });
    });

    describe('when styling object is empty', () => {
      it('should return empty variables and undefined classes', () => {
        const result = getComponentStyles();

        expect(result.variables).toEqual({});
        expect(result.classes).toBeUndefined();
      });
    });

    describe('when styling has only classes', () => {
      it('should return empty variables and provided classes', () => {
        const styling = {
          classes: { container: 'custom-container', button: 'custom-button' },
        };

        const result = getComponentStyles(styling, false);

        expect(result.variables).toEqual({});
        expect(result.classes).toEqual({
          container: 'custom-container',
          button: 'custom-button',
        });
      });
    });

    describe('when styling has only variables', () => {
      it('should return merged variables and undefined classes', () => {
        const styling = {
          variables: {
            common: { '--radius-md': '4px' },
            light: { '--shadow-bevel-sm': '0 2px 4px rgba(0,0,0,0.1)' },
          },
        };

        const result = getComponentStyles(styling, false);

        expect(result.variables).toEqual({
          '--radius-md': '4px',
          '--shadow-bevel-sm': '0 2px 4px rgba(0,0,0,0.1)',
        });
        expect(result.classes).toBeUndefined();
      });
    });

    describe('when switching between light and dark modes', () => {
      const styling = {
        variables: {
          common: { '--font-size-heading': '24px' },
          light: { '--color-background': '#ffffff' },
          dark: { '--color-background': '#000000' },
        },
      };

      describe('in light mode', () => {
        it('should apply light mode variables', () => {
          const result = getComponentStyles(styling, false);

          expect(result.variables).toHaveProperty('--color-background', '#ffffff');
          expect(result.variables).toHaveProperty('--font-size-heading', '24px');
        });
      });

      describe('in dark mode', () => {
        it('should apply dark mode variables', () => {
          const result = getComponentStyles(styling, true);

          expect(result.variables).toHaveProperty('--color-background', '#000000');
          expect(result.variables).toHaveProperty('--font-size-heading', '24px');
        });
      });
    });
  });

  describe('applyStyleOverrides', () => {
    let mockHtml: MockHtmlElement;

    beforeEach(() => {
      mockHtml = createMockHtmlElement();
      Object.defineProperty(globalThis, 'document', {
        value: {
          documentElement: mockHtml,
        },
        writable: true,
        configurable: true,
      });
    });

    describe('when applying styling by default', () => {
      describe('in light mode', () => {
        it('should set light variables, default theme, and remove dark class', () => {
          const styling: StylingVariables = {
            common: { '--font-size-heading': '24px' },
            light: { '--color-background': '#ffffff' },
            dark: { '--color-background': '#000000' },
          };

          applyStyleOverrides(styling);

          expect(mockHtml.dataset.theme).toBe('default');
          expect(mockHtml.classList.remove).toHaveBeenCalledWith('dark');
          expect(mockHtml.classList.add).not.toHaveBeenCalledWith('dark');
          expect(mockHtml.style.setProperty).toHaveBeenCalledWith('--font-size-heading', '24px');
          expect(mockHtml.style.setProperty).toHaveBeenCalledWith('--color-background', '#ffffff');
        });
      });
    });

    describe('when mode is explicitly set', () => {
      describe('in dark mode', () => {
        it('should apply dark variables and add dark class', () => {
          const styling: StylingVariables = {
            common: { '--font-size-heading': '24px' },
            light: { '--color-background': '#ffffff' },
            dark: { '--color-background': '#000000' },
          };

          applyStyleOverrides(styling, 'dark');

          expect(mockHtml.dataset.theme).toBe('default');
          expect(mockHtml.classList.add).toHaveBeenCalledWith('dark');
          expect(mockHtml.classList.remove).not.toHaveBeenCalledWith('dark');
          expect(mockHtml.style.setProperty).toHaveBeenCalledWith('--font-size-heading', '24px');
          expect(mockHtml.style.setProperty).toHaveBeenCalledWith('--color-background', '#000000');
        });
      });
    });

    describe('when setting theme variants', () => {
      it('should set correct theme dataset attribute', () => {
        const styling: StylingVariables = {};

        applyStyleOverrides(styling, 'light', 'minimal');
        expect(mockHtml.dataset.theme).toBe('minimal');

        applyStyleOverrides(styling, 'light', 'rounded');
        expect(mockHtml.dataset.theme).toBe('rounded');

        applyStyleOverrides(styling, 'light', 'default');
        expect(mockHtml.dataset.theme).toBe('default');
      });
    });

    describe('when styling object is empty', () => {
      it('should set theme and mode without applying variables', () => {
        const styling: StylingVariables = {};

        applyStyleOverrides(styling, 'light');

        expect(mockHtml.dataset.theme).toBe('default');
        expect(mockHtml.classList.remove).toHaveBeenCalledWith('dark');
        // No CSS variables should be set since styling is empty
        expect(mockHtml.style.setProperty).not.toHaveBeenCalled();
      });
    });

    describe('when receiving invalid variable values', () => {
      it('should only apply string values as CSS variables', () => {
        // Simulate the function receiving invalid values at runtime
        const invalidStyling = {
          common: {
            '--font-size-heading': '24px',
            '--invalid-number': 42,
            '--invalid-object': { nested: 'value' },
          },
        };

        applyStyleOverrides(invalidStyling as StylingVariables);

        expect(mockHtml.style.setProperty).toHaveBeenCalledWith('--font-size-heading', '24px');
        expect(mockHtml.style.setProperty).toHaveBeenCalledTimes(1);
      });
    });

    describe('when switching between light and dark modes', () => {
      const styling: StylingVariables = {
        light: { '--color-foreground': '#000000' },
        dark: { '--color-foreground': '#ffffff' },
      };

      describe('in light mode', () => {
        it('should remove dark class and apply light variables', () => {
          applyStyleOverrides(styling, 'light');

          expect(mockHtml.classList.remove).toHaveBeenCalledWith('dark');
          expect(mockHtml.style.setProperty).toHaveBeenCalledWith('--color-foreground', '#000000');
        });
      });

      describe('in dark mode', () => {
        it('should add dark class and apply dark variables', () => {
          applyStyleOverrides(styling, 'dark');

          expect(mockHtml.classList.add).toHaveBeenCalledWith('dark');
          expect(mockHtml.style.setProperty).toHaveBeenCalledWith('--color-foreground', '#ffffff');
        });
      });
    });

    describe('when combining mode and theme settings', () => {
      it('should apply both theme variant and mode variables correctly', () => {
        const styling: StylingVariables = {
          common: { '--radius-md': '4px' },
          dark: { '--color-background': '#1a1a1a' },
        };

        applyStyleOverrides(styling, 'dark', 'rounded');

        expect(mockHtml.dataset.theme).toBe('rounded');
        expect(mockHtml.classList.add).toHaveBeenCalledWith('dark');
        expect(mockHtml.style.setProperty).toHaveBeenCalledWith('--radius-md', '4px');
        expect(mockHtml.style.setProperty).toHaveBeenCalledWith('--color-background', '#1a1a1a');
      });
    });
  });
});
