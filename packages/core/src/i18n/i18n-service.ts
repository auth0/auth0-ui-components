import type {
  LangTranslations,
  TranslationFunction,
  I18nInitOptions,
  TFactory,
  I18nServiceInterface,
  TransComponent,
  TranslationElements,
} from './i18n-types';

/**
 * Pure utility functions for internationalization (i18n) functionality.
 * These functions handle translation loading, variable substitution, and namespace-based translation.
 */
export const I18nUtils = {
  /**
   * Regular expression for matching variable placeholders in translation strings.
   * Matches patterns like ${variableName} for dynamic content substitution.
   */
  VAR_REGEX: /\${(\w+)}/g,

  /**
   * Regular expression for matching component placeholders in translation strings.
   * Matches patterns like <0>text</0> or <link>text</link> for safe HTML rendering.
   */
  COMPONENT_REGEX: /<(\w+)>(.*?)<\/\1>/g,

  /**
   * Retrieves a nested value from an object using dot notation path traversal.
   *
   * @param obj - The object to traverse
   * @param path - Dot-separated path to the desired value (e.g., 'common.errors.required')
   * @returns The value at the specified path, or undefined if not found
   *
   * @example
   * ```typescript
   * const obj = { common: { errors: { required: 'Field is required' } } };
   * getNestedValue(obj, 'common.errors.required') // Returns: 'Field is required'
   * ```
   */
  getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    let current: unknown = obj;
    const keys = path.split('.');

    for (const key of keys) {
      if (current === null || typeof current !== 'object' || Array.isArray(current)) {
        return undefined;
      }
      if (!Object.prototype.hasOwnProperty.call(current, key)) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[key];
    }

    return current;
  },

  /**
   * Performs variable substitution in a template string using provided variables.
   *
   * @param template - The template string containing ${variable} placeholders
   * @param vars - Object containing variable values for substitution
   * @returns The template string with variables substituted
   *
   * @example
   * ```typescript
   * substitute('Hello ${name}!', { name: 'World' }) // Returns: 'Hello World!'
   * substitute('No variables here', { name: 'World' }) // Returns: 'No variables here'
   * ```
   */
  substitute(template: string, vars?: Record<string, unknown>): string {
    if (!vars) return template;

    if (!template.includes('${')) return template;

    I18nUtils.VAR_REGEX.lastIndex = 0;
    return template.replace(I18nUtils.VAR_REGEX, (_, key) => String(vars[key] ?? ''));
  },

  /**
   * Parses a translation string with component placeholders and returns structured data
   * for safe rendering without dangerouslySetInnerHTML.
   *
   * @param template - The translation string with component placeholders like <0>text</0>
   * @param components - Object mapping component keys to React elements or render functions
   * @returns Array of strings and React elements for safe rendering
   *
   * @example
   * ```typescript
   * const result = parseComponents(
   *   'Click <link>here</link> to learn more',
   *   { link: (children) => <a href="/help">{children}</a> }
   * );
   * // Returns: ['Click ', <a href="/help">here</a>, ' to learn more']
   * ```
   */
  parseComponents(template: string, components?: TranslationElements): (string | TransComponent)[] {
    if (!components || !template.includes('<')) {
      return [template];
    }

    const result: (string | TransComponent)[] = [];
    let lastIndex = 0;

    I18nUtils.COMPONENT_REGEX.lastIndex = 0;
    let match;

    while ((match = I18nUtils.COMPONENT_REGEX.exec(template)) !== null) {
      const [fullMatch, componentKey, content] = match;
      const matchStart = match.index!;

      // Add text before the component
      if (matchStart > lastIndex) {
        result.push(template.slice(lastIndex, matchStart));
      }

      // Add the component
      const component = components[componentKey];
      if (component) {
        if (typeof component === 'function') {
          result.push(component(content));
        } else {
          result.push(component);
        }
      } else {
        // Fallback: render as plain text if component not found
        result.push(content);
      }

      lastIndex = matchStart + fullMatch.length;
    }

    // Add remaining text
    if (lastIndex < template.length) {
      result.push(template.slice(lastIndex));
    }

    return result.length === 1 && typeof result[0] === 'string' ? [result[0]] : result;
  },

  /**
   * Creates an enhanced translation function that supports both simple translations
   * and component-based translations for safe HTML rendering.
   *
   * @param namespace - The namespace prefix for translations
   * @param translations - The loaded translation data
   * @param overrides - Optional override translations that take precedence
   * @returns An enhanced translation function with Trans component support
   */
  createEnhancedTranslator(
    namespace: string,
    translations: LangTranslations | null,
    overrides?: Record<string, unknown>,
  ): TranslationFunction & {
    trans: (
      key: string,
      options?: {
        components?: TranslationElements;
        vars?: Record<string, unknown>;
        fallback?: string;
      },
    ) => (string | TransComponent)[];
  } {
    const baseTranslator = I18nUtils.createTranslator(namespace, translations, overrides);

    const enhancedTranslator = baseTranslator as TranslationFunction & {
      trans: (
        key: string,
        options?: {
          components?: TranslationElements;
          vars?: Record<string, unknown>;
          fallback?: string;
        },
      ) => (string | TransComponent)[];
    };

    // Add Trans component method for safe HTML rendering
    enhancedTranslator.trans = (
      key: string,
      options: {
        components?: TranslationElements;
        vars?: Record<string, unknown>;
        fallback?: string;
      } = {},
    ) => {
      const { components, vars, fallback } = options;
      let text = baseTranslator(key, vars, fallback);

      return I18nUtils.parseComponents(text, components);
    };

    return enhancedTranslator;
  },

  /**
   * Creates a translation function for a specific namespace with optional overrides.
   *
   * @param namespace - The namespace prefix for translations (e.g., 'mfa', 'common')
   * @param translations - The loaded translation data
   * @param overrides - Optional override translations that take precedence
   * @returns A translation function scoped to the specified namespace
   */
  createTranslator(
    namespace: string,
    translations: LangTranslations | null,
    overrides?: Record<string, unknown>,
  ): TranslationFunction {
    const prefix = `${namespace}.`;
    const hasOverrides = overrides && Object.keys(overrides).length > 0;

    return (key: string, vars?: Record<string, unknown>, fallback?: string): string => {
      const fullKey = prefix + key;

      if (hasOverrides) {
        const overrideValue = I18nUtils.getNestedValue(overrides!, key);
        if (overrideValue !== undefined) {
          return I18nUtils.substitute(String(overrideValue), vars);
        }
      }

      if (!translations) {
        return fallback || `${prefix}${key}`;
      }

      const translationValue = translations
        ? I18nUtils.getNestedValue(translations, fullKey)
        : undefined;

      if (translationValue !== undefined) {
        return I18nUtils.substitute(String(translationValue), vars);
      }

      // Return fallback if provided, otherwise return the full key or just the key
      return fallback || (translations ? key : `${prefix}${key}`);
    };
  },

  /**
   * Loads translation data for a specific language from the translations directory.
   *
   * @param language - The language code to load (e.g., 'en-US', 'es-ES')
   * @param cache - Optional cache map to store loaded translations
   * @returns Promise resolving to translation data or null if not found
   */
  async loadTranslations(
    language: string,
    cache?: Map<string, LangTranslations | null>,
  ): Promise<LangTranslations | null> {
    if (cache?.has(language)) {
      return cache.get(language)!;
    }

    try {
      const mod = await import(`./translations/${language}.json`);
      const data = mod.default ?? mod;
      if (cache) {
        cache.set(language, data);
      }
      return data;
    } catch {
      if (cache) {
        cache.set(language, null);
      }
      return null;
    }
  },

  /**
   * Loads translations with automatic fallback support for missing languages.
   *
   * @param currentLanguage - The primary language to load
   * @param fallbackLanguage - Optional fallback language if primary fails
   * @param cache - Optional cache map to store loaded translations
   * @returns Promise resolving to translation data with fallback support
   */
  async loadTranslationsWithFallback(
    currentLanguage: string,
    fallbackLanguage?: string,
    cache?: Map<string, LangTranslations | null>,
  ): Promise<LangTranslations | null> {
    // Try to load current language first
    let result = await I18nUtils.loadTranslations(currentLanguage, cache);
    if (result) return result;

    // Fallback to fallback language if available
    if (fallbackLanguage && fallbackLanguage !== currentLanguage) {
      result = await I18nUtils.loadTranslations(fallbackLanguage, cache);
      if (result) return result;
    }

    // Final fallback to en-US if not already tried
    if (currentLanguage !== 'en-US' && fallbackLanguage !== 'en-US') {
      return I18nUtils.loadTranslations('en-US', cache);
    }

    return null;
  },
};

/**
 * Creates an internationalization (i18n) service with translation loading and management capabilities.
 *
 * This factory function initializes the i18n service with language support, translation loading,
 * and runtime language switching. It supports namespace-based translations, variable substitution,
 * and safe HTML rendering through Trans component pattern.
 *
 * @param options - Optional configuration for i18n initialization
 * @param options.currentLanguage - The current language code (defaults to 'en-US')
 * @param options.fallbackLanguage - The fallback language code (defaults to 'en-US')
 * @returns Promise resolving to a fully configured i18n service interface
 *
 * @example
 * ```typescript
 * // Basic initialization
 * const i18nService = await createI18nService();
 *
 * // With custom language
 * const i18nService = await createI18nService({
 *   currentLanguage: 'es-ES',
 *   fallbackLanguage: 'en-US'
 * });
 *
 * // Use translations with safe HTML rendering
 * const t = i18nService.translator('mfa');
 * const message = t('enrollment.success'); // Plain text
 * const elements = t.trans('help.link', {
 *   components: {
 *     link: (children) => <a href="/help">{children}</a>
 *   }
 * }); // Safe HTML components
 * ```
 */
export async function createI18nService(
  options: I18nInitOptions = {},
): Promise<I18nServiceInterface> {
  const currentLanguage = options.currentLanguage ?? 'en-US';
  const fallbackLanguage = options.fallbackLanguage ?? 'en-US';
  const cache = new Map<string, LangTranslations | null>();

  // Load initial translations
  const translations = await I18nUtils.loadTranslationsWithFallback(
    currentLanguage,
    fallbackLanguage,
    cache,
  );

  // State management through closure
  let _currentLanguage = currentLanguage;
  let _fallbackLanguage = fallbackLanguage;
  let _translations = translations;

  const service: I18nServiceInterface = {
    get currentLanguage(): string {
      return _currentLanguage;
    },

    get fallbackLanguage(): string | undefined {
      return _fallbackLanguage;
    },

    get translator(): TFactory {
      return (namespace: string, overrides?: Record<string, unknown>) =>
        I18nUtils.createEnhancedTranslator(namespace, _translations, overrides);
    },

    get commonTranslator(): TranslationFunction & {
      trans: (
        key: string,
        options?: {
          components?: TranslationElements;
          vars?: Record<string, unknown>;
          fallback?: string;
        },
      ) => (string | TransComponent)[];
    } {
      return I18nUtils.createEnhancedTranslator('common', _translations);
    },

    getCurrentTranslations(): LangTranslations | null {
      return _translations;
    },

    async changeLanguage(language: string, newFallbackLanguage?: string): Promise<void> {
      try {
        _currentLanguage = language;
        _fallbackLanguage = newFallbackLanguage ?? _fallbackLanguage;

        _translations = await I18nUtils.loadTranslationsWithFallback(
          _currentLanguage,
          _fallbackLanguage,
          cache,
        );
      } catch (error) {
        throw new Error(
          `Failed to change language to '${language}': ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    },
  };

  return service;
}
