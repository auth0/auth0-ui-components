import {
  I18nOptions,
  TranslationMap,
  TranslationStore,
  Translator,
  TranslationKey,
  LanguageCode,
  NamespaceId,
  CacheableValue
} from './types';

export class I18nService {
  private static readonly MAX_CACHE_SIZE = 1000;
  private readonly logger: Console;
  private readonly cache: Map<string, CacheableValue> = new Map();
  private readonly translations: TranslationStore = {};
  private readonly userTranslations: TranslationStore = {};
  private currentLanguage: LanguageCode;
  private readonly options: Required<I18nOptions>;

  /**
   * Initializes the I18n service with optional configuration
   * @param options - Configuration options for the service
   */
  constructor(options?: I18nOptions, logger: Console = console) {
    this.logger = logger;
    this.options = {
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      interpolation: {
        prefix: '{{',
        suffix: '}}',
      },
      debug: false,
      ...options,
    };
    this.currentLanguage = this.options.defaultLanguage;
  }

  /**
   * Adds translations for a specific namespace and language
   * Supports multiple languages and merges with existing translations
   * @param namespace - Unique identifier for the translation group
   * @param translations - Map of language codes to translation key-value pairs
   */
  public addTranslations(
    namespace: NamespaceId,
    translations: Record<LanguageCode, TranslationMap>,
  ): void {
    this.validate(namespace, 'namespace');
    if (!translations || typeof translations !== 'object') throw new Error('Invalid translations');

    const target = this.userTranslations[namespace] ? this.userTranslations : this.translations;
    target[namespace] = target[namespace] || {};

    Object.entries(translations).forEach(([lang, trans]) => {
      this.validate(lang, 'language');
      target[namespace][lang] = { ...target[namespace][lang], ...trans };
    });

    this.clearCache(namespace);
    this.logDebug(`Added translations for namespace: ${namespace}`);
  }

  /**
   * Creates a translator instance for a specific namespace
   * Caches the translator to avoid recreation
   * @param namespace - Namespace to create translator for
   * @returns Translator object with 't' method for translation lookup
   */
  public useNamespace(namespace: NamespaceId): Translator {
    this.validate(namespace, 'namespace');
    const cacheKey = `translator:${namespace}:${this.currentLanguage}`;
    const cached = this.cache.get(cacheKey);
    if (cached && typeof cached === 'object' && 't' in cached) return cached as Translator;

    const translator: Translator = {
      t: (key: TranslationKey, params?: Record<string, string>): string =>
        this.getTranslation(namespace, key, params),
    };

    this.setCache(cacheKey, translator);
    return translator;
  }

  /**
   * Changes the current language and clears translation cache
   * @param language - Language code to switch to
   */
  public setLanguage(language: LanguageCode): void {
    this.validate(language, 'language');
    if (this.currentLanguage === language) return;
    this.currentLanguage = language;
    this.cache.clear();
  }

  /**
   * Returns the currently active language code
   * @returns Current language code
   */
  public getLanguage(): LanguageCode {
    return this.currentLanguage;
  }

  /**
   * Cleans up resources and resets service to initial state
   * Clears all caches and translation stores
   */
  public dispose(): void {
    this.cache.clear();
    [this.translations, this.userTranslations].forEach((store) => {
      Reflect.ownKeys(store).forEach((key) => delete store[key as string]);
    });
    this.currentLanguage = this.options.defaultLanguage;
  }

  /**
   * Retrieves translation for a key in a namespace
   * Handles parameter interpolation and caching
   * @param namespace - Translation namespace
   * @param key - Translation key
   * @param params - Optional parameters for interpolation
   * @returns Translated string with interpolated values
   */
  private getTranslation(
    namespace: NamespaceId,
    key: TranslationKey,
    params?: Record<string, string>,
  ): string {
    const cacheKey = `translation:${namespace}:${key}:${this.currentLanguage}:${params ? JSON.stringify(params) : ''}`;
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) return typeof cached === 'string' ? cached : key;

    const translation = this.findTranslation(namespace, key);
    const result = translation
      ? params
        ? this.interpolate(translation, params)
        : translation
      : key;

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Searches for translation in user and default stores
   * Follows fallback chain: user current -> user fallback -> default current -> default fallback
   * @param namespace - Translation namespace
   * @param key - Translation key to find
   * @returns Found translation or null
   */
  private findTranslation(namespace: NamespaceId, key: TranslationKey): string | null {
    const sources = [
      [this.userTranslations, this.currentLanguage],
      [this.userTranslations, this.options.fallbackLanguage],
      [this.translations, this.currentLanguage],
      [this.translations, this.options.fallbackLanguage],
    ] as const;

    for (const [source, language] of sources) {
      const translation = source[namespace]?.[language]?.[key];
      if (translation) return translation;
    }

    this.logDebug(`Translation missing: ${namespace}.${key}`);
    return null;
  }

  /**
   * Replaces placeholder tokens with provided values
   * Uses regex caching for better performance
   * @param text - Text containing placeholders
   * @param params - Values to replace placeholders with
   * @returns Interpolated string
   */
  private interpolate(text: string, params: Record<string, string>): string {
    const { prefix = '{{', suffix = '}}' } = this.options.interpolation;
    return Object.entries(params).reduce((result, [key, value]) => {
      const cacheKey = `regex:${key}:${prefix}:${suffix}`;
      let regex = this.cache.get(cacheKey);

      if (!regex) {
        const pattern = `${this.escapeRegExp(prefix)}${this.escapeRegExp(key)}${this.escapeRegExp(suffix)}`;
        regex = new RegExp(pattern, 'g');
        this.setCache(cacheKey, regex);
      }

      if (regex instanceof RegExp) {
        return result.replace(regex, value);
      }
      throw new Error('Cached value is not a valid RegExp');
    }, text);
  }

  /**
   * Validates string values for language codes and namespaces
   * @param value - String to validate
   * @param type - Type of validation ('language' or 'namespace')
   * @throws Error if validation fails
   */
  private validate(value: string, type: 'language' | 'namespace'): void {
    if (!value || typeof value !== 'string') throw new Error(`Invalid ${type}`);
  }

  /**
   * Escapes special regex characters in string
   * Used for safe interpolation pattern creation
   * @param string - String to escape
   * @returns Escaped string safe for regex
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Clears cache entries for a namespace or all caches
   * @param namespace - Optional namespace to clear cache for
   */
  private clearCache(namespace?: NamespaceId): void {
    if (namespace) {
      const prefix = `translation:${namespace}`;
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) this.cache.delete(key);
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Sets a value in cache with size management
   */
  private setCache(key: string, value: CacheableValue): void {
    if (this.cache.size >= I18nService.MAX_CACHE_SIZE) {
      const keys = Array.from(this.cache.keys());
      keys
        .slice(0, Math.ceil(I18nService.MAX_CACHE_SIZE * 0.2))
        .forEach((k) => this.cache.delete(k));
    }
    this.cache.set(key, value);
  }

  /**
   * Logs debug messages when debug mode is enabled
   */
  private logDebug(message: string): void {
    if (this.options.debug) {
      this.logger.log(`[I18n] ${message}`);
    }
  }
}
