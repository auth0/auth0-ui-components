'use client';

import * as React from 'react';

import { ErrorHandlerContext } from '../providers/error-handler-provider';

export const useErrorHandler = () => {
  const ctx = React.useContext(ErrorHandlerContext);
  if (!ctx) throw new Error('useErrorHandler must be used within ErrorHandlerProvider');
  return ctx;
};
