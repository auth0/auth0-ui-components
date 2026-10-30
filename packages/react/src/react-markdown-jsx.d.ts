/**
 * react-markdown@8 types reference the global `JSX` namespace, which @types/react 19 no longer
 * declares. Re-expose it so the library types resolve.
 */
import type * as React from 'react';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    type ElementType = React.JSX.ElementType;
    type Element = React.JSX.Element;
    type IntrinsicElements = React.JSX.IntrinsicElements;
  }
}
