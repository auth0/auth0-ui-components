import { OidcLogoSvg } from '@auth0/web-ui-components-core';
import React from 'react';

export interface OidcProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string;
  height?: number | string;
  title?: string;
}

/**
 * OidcLogo component renders the Oidc logo.
 *
 * @param props - Props including width, height, title, and standard img attributes.
 * @returns A JSX img element of the Oidc logo.
 */
const OidcLogo: React.FC<OidcProps> = ({
  width = 17,
  height = 17,
  title = 'Oidc logo',
  className,
  ...props
}) => {
  return (
    <img
      src={OidcLogoSvg}
      alt={title}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
};

export default React.memo(OidcLogo);
