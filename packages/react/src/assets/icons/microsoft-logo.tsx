import React from 'react';

interface MicrosofLogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const MicrosoftLogo = ({ width = 17, height = 17, className }: MicrosofLogoProps) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 17 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M1.8335 1.5H8.50015V8.16667H1.8335V1.5Z" fill="#F35325" />
    <path d="M9.16684 1.5H15.8335V8.16667H9.16684V1.5Z" fill="#81BC06" />
    <path d="M1.8335 8.83333H8.50015V15.5H1.8335V8.83333Z" fill="#05A6F0" />
    <path d="M9.16684 8.83333H15.8335V15.5H9.16684V8.83333Z" fill="#FFBA08" />
  </svg>
);

export default React.memo(MicrosoftLogo);
