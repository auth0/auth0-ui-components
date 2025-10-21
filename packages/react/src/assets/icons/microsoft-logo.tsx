import { MicrosoftLogoSvg } from '@auth0-web-ui-components/core';
import React from 'react';

export interface MicrosoftLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string;
  height?: number | string;
  title?: string;
}

/**
 * MicrosoftLogo component renders the Microsoft logo.
 *
 * @param props - Props including width, height, title, and standard img attributes.
 * @returns A JSX img element of the Microsoft logo.
 */
const MicrosoftLogo: React.FC<MicrosoftLogoProps> = ({
  width = 17,
  height = 17,
  title = 'Microsoft logo',
  className,
  ...props
}) => {
  return (
    <img
      src={MicrosoftLogoSvg}
      alt={title}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
};

export default React.memo(MicrosoftLogo);
