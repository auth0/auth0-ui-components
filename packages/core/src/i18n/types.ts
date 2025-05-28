export interface I18nOptions {
  defaultLanguage?: string;
  fallbackLanguage?: string;
  interpolation?: {
    prefix?: string;
    suffix?: string;
  };
  debug?: boolean;
}

export interface TranslationMap {
  [key: string]: string;
}

export interface TranslationStore {
  [namespace: string]: {
    [language: string]: TranslationMap;
  };
}

export interface Translator {
  t: (key: string, params?: Record<string, string>) => string;
}

export type TranslationKey = string;
export type LanguageCode = string;
export type NamespaceId = string;
export type CacheableValue = string | RegExp | Translator;