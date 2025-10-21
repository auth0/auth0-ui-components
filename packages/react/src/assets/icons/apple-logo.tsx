import { AppleLogoSvg } from '@auth0-web-ui-components/core';
import React from 'react';

export interface AppleLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string;
  height?: number | string;
  title?: string;
}

/**
 * AppleLogo component renders the Apple SVG logo.
 *
 * @param props - Props including width, height, title, and standard SVG attributes.
 * @returns A JSX element with the Apple logo image.
 */
const AppleLogo: React.FC<AppleLogoProps> = ({
  width = 30,
  height = 30,
  title = 'Apple logo',
  className,
  ...props
}) => {
  return (
    <img
      src={AppleLogoSvg}
      alt={title}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
};

export default React.memo(AppleLogo);
