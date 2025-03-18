'use client';

import * as React from 'react';
import type { I18nContextValue } from './types';

/**
 * React Context for providing i18n state throughout the component tree.
 */
export const I18nContext = React.createContext<I18nContextValue>({
  translator: null,
  initialized: false,
});
