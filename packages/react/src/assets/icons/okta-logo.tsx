/**
 * Okta logo icon component.
 * @module okta-logo
 * @internal
 */

import { OktaLogoSvg } from '@auth0/universal-components-core';
import React from 'react';

import { cn } from '@/lib/utils';

export interface OktaLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string;
  height?: number | string;
  title?: string;
}

/**
 * OktaLogo component renders the Okta logo.
 *
 * @param props - Props including width, height, title, and standard img attributes.
 * @returns A JSX img element of the Okta logo.
 */
const OktaLogo: React.FC<OktaLogoProps> = ({
  width = 17,
  height = 17,
  title = 'Okta logo',
  className,
  ...props
}) => {
  return (
    <img
      src={OktaLogoSvg}
      alt={title}
      width={width}
      height={height}
      className={cn('dark:invert', className)}
      {...props}
    />
  );
};

export default React.memo(OktaLogo);
