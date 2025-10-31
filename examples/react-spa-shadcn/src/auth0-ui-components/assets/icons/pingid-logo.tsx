import { PingIdLogoSvg } from '@auth0/web-ui-components-core';
import React from 'react';

export interface PingIdProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string;
  height?: number | string;
  title?: string;
}

/**
 * PingIdLogo component renders the PingId logo.
 *
 * @param props - Props including width, height, title, and standard img attributes.
 * @returns A JSX img element of the PingId logo.
 */
const PingIdLogo: React.FC<PingIdProps> = ({
  width = 17,
  height = 17,
  title = 'PingId logo',
  className,
  ...props
}) => {
  return (
    <img
      src={PingIdLogoSvg}
      alt={title}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
};

export default React.memo(PingIdLogo);
