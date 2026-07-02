import type { DistributionChannel } from '@auth0/universal-components-core';

declare const __DISTRIBUTION__: DistributionChannel;

export const DISTRIBUTION: DistributionChannel =
  typeof __DISTRIBUTION__ !== 'undefined' ? __DISTRIBUTION__ : 'shadcn';

export const FRAMEWORK = 'react' as const;
