import { SamlpLogoSvg } from '@auth0/universal-components-core';
import React from 'react';

export interface SamlpProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string;
  height?: number | string;
  title?: string;
}

/**
 * SamlpLogo component renders the Samlp logo.
 *
 * @param props - Props including width, height, title, and standard img attributes.
 * @returns A JSX img element of the Samlp logo.
 */
const SamlpLogo: React.FC<SamlpProps> = ({
  width = 17,
  height = 17,
  title = 'Samlp logo',
  className,
  ...props
}) => {
  return (
    <img
      src={SamlpLogoSvg}
      alt={title}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
};

export default React.memo(SamlpLogo);
