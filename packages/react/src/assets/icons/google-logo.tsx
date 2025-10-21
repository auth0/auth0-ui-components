import { GoogleLogoSvg } from '@auth0-web-ui-components/core';
import React from 'react';

export interface GoogleLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string;
  height?: number | string;
  title?: string;
}

/**
 * GoogleLogo component renders the Google "G" logo SVG.
 *
 * @param props - Props including width, height, title, and standard SVG attributes.
 * @returns A JSX SVG element of the Google logo.
 */
const GoogleLogo: React.FC<GoogleLogoProps> = ({
  width = 48,
  height = 48,
  title = 'Google logo',
  className,
  ...props
}) => {
  return (
    <img
      src={GoogleLogoSvg}
      alt={title}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
};

export default React.memo(GoogleLogo);
