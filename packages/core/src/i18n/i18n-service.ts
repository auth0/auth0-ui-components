import { LangTranslations, TranslationFunction, I18nInitOptions, TFactory } from './types';

/**
 * Interface for the I18nService class.
 */
export interface I18nServiceInterface {
  currentLanguage: string;
  fallbackLanguage: string | undefined;
  translator: TFactory;
  getCurrentTranslations(): LangTranslations | null;
  changeLanguage(language: string, fallbackLanguage?: string): Promise<void>;
}

/**
 * I18nService class for managing translations and language settings.
 */
export class I18nService implements I18nServiceInterface {
  private _currentLanguage: string;
  private _fallbackLanguage: string | undefined;
  private _translations: LangTranslations | null = null;
  private _cache: Map<string, LangTranslations | null> = new Map();
  private static readonly VAR_REGEX = /\${(\w+)}/g;

  constructor(currentLanguage: string = 'en-US', fallbackLanguage?: string) {
    this._currentLanguage = currentLanguage;
    this._fallbackLanguage = fallbackLanguage;
  }

  get currentLanguage(): string {
    return this._currentLanguage;
  }

  get fallbackLanguage(): string | undefined {
    return this._fallbackLanguage;
  }

  get translator(): TFactory {
    return (namespace: string, overrides?: Record<string, unknown>) =>
      this.createTranslator(namespace, overrides);
  }

  getCurrentTranslations(): LangTranslations | null {
    return this._translations;
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    let current: unknown = obj;
    const keys = path.split('.');

    for (const key of keys) {
      if (current == null || typeof current !== 'object' || Array.isArray(current)) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[key];
    }

    return current;
  }

  private substitute(str: string, vars?: Record<string, unknown>): string {
    if (!vars) return str;

    if (!str.includes('${')) return str;

    I18nService.VAR_REGEX.lastIndex = 0;
    return str.replace(I18nService.VAR_REGEX, (_, key) => String(vars[key] ?? ''));
  }

  private async loadTranslations(lang: string): Promise<LangTranslations | null> {
    if (this._cache.has(lang)) {
      return this._cache.get(lang)!;
    }

    try {
      const mod = await import(`./translations/${lang}.json`);
      const data = mod.default ?? mod;
      this._cache.set(lang, data);
      return data;
    } catch {
      this._cache.set(lang, null);
      return null;
    }
  }

  private async loadTranslationsWithFallback(
    currentLang: string,
    fallbackLang?: string,
  ): Promise<LangTranslations | null> {
    let result = await this.loadTranslations(currentLang);
    if (result) return result;

    if (fallbackLang && fallbackLang !== currentLang) {
      result = await this.loadTranslations(fallbackLang);
      if (result) return result;
    }

    if (currentLang !== 'en-US' && fallbackLang !== 'en-US') {
      return this.loadTranslations('en-US');
    }

    return null;
  }

  private createTranslator(
    namespace: string,
    overrides?: Record<string, unknown>,
  ): TranslationFunction {
    const prefix = `${namespace}.`;
    const hasOverrides = overrides && Object.keys(overrides).length > 0;

    return (key: string, vars?: Record<string, unknown>): string => {
      const fullKey = prefix + key;

      if (hasOverrides) {
        const overrideValue = this.getNestedValue(overrides!, key);
        if (overrideValue !== undefined) {
          return this.substitute(String(overrideValue), vars);
        }
      }

      if (!this._translations) {
        return `${prefix}${key}`;
      }

      const translationValue = this.getNestedValue(this._translations, fullKey);
      const finalValue = translationValue !== undefined ? String(translationValue) : key;

      return this.substitute(finalValue, vars);
    };
  }

  private async initialize(): Promise<void> {
    const result = await this.loadTranslationsWithFallback(
      this._currentLanguage,
      this._fallbackLanguage,
    );
    this._translations = result;
  }

  async changeLanguage(language: string, fallbackLanguage?: string): Promise<void> {
    try {
      this._currentLanguage = language;
      this._fallbackLanguage = fallbackLanguage;

      await this.initialize();
    } catch (error) {
      throw new Error(
        `Failed to change language to '${language}': ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  static async create(options: I18nInitOptions = {}): Promise<I18nService> {
    const currentLanguage = options.currentLanguage ?? 'en-US';
    const fallbackLanguage = options.fallbackLanguage ?? 'en-US';

    const service = new I18nService(currentLanguage, fallbackLanguage);
    await service.initialize();

    return service;
  }
}
