'use client';

import * as React from 'react';

import type { Auth0ComponentProviderProps } from '../types/auth-types';

import { Auth0ComponentProviderProxy } from './proxy-provider';
import { Auth0ComponentProviderSpa } from './spa-provider';

export const Auth0ComponentProvider = (
  props: Auth0ComponentProviderProps & { children: React.ReactNode },
) => {
  if (props.authDetails && props.authDetails.authProxyUrl) {
    return <Auth0ComponentProviderProxy {...props}>{props.children}</Auth0ComponentProviderProxy>;
  }
  return <Auth0ComponentProviderSpa {...props}>{props.children}</Auth0ComponentProviderSpa>;
};

export default Auth0ComponentProvider;
