import { EntraIdLogoSvg } from '@auth0-web-ui-components/core';
import React from 'react';

export interface EntraIdProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string;
  height?: number | string;
  title?: string;
}

/**
 * EntraIdLogo component renders the EntraId SVG logo.
 *
 * @param props - Props including width, height, title, and standard SVG attributes.
 * @returns A JSX SVG element of the EntraId logo.
 */
const EntraIdLogo: React.FC<EntraIdProps> = ({
  width = 17,
  height = 17,
  title = 'EntraID logo',
  className,
  ...props
}) => {
  return (
    <img
      src={EntraIdLogoSvg}
      alt={title}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
};

export default React.memo(EntraIdLogo);
