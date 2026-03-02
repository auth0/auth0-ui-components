import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Props for the `MiddleEllipsisText` component.
 */
export interface MiddleEllipsisTextProps {
  /**
   * Full text value to render and truncate from the middle when needed.
   */
  text: string;
  /**
   * Optional class names applied to the text container.
   */
  className?: string;
}

/**
 * Truncates text by preserving both the start and end segments and inserting
 * an ellipsis in the middle when the measured width exceeds the available width.
 *
 * @param text Full source text.
 * @param availableWidth Maximum width available for rendering in pixels.
 * @param font Canvas font shorthand used for text measurement.
 * @returns The display string and whether truncation was applied.
 */
function calculateTruncatedText(
  text: string,
  availableWidth: number,
  font: string,
): { truncated: string; isTruncated: boolean } {
  if (!text || availableWidth <= 0) {
    return { truncated: text, isTruncated: false };
  }

  // Create a canvas element for text measurement
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    return { truncated: text, isTruncated: false };
  }

  context.font = font;
  const ellipsis = '...';
  const fullWidth = context.measureText(text).width;

  // If text fits, return as-is
  if (fullWidth <= availableWidth) {
    return { truncated: text, isTruncated: false };
  }

  const ellipsisWidth = context.measureText(ellipsis).width;
  const targetWidth = availableWidth - ellipsisWidth;

  if (targetWidth <= 0) {
    return { truncated: ellipsis, isTruncated: true };
  }

  // Binary search for optimal split point
  let start = 0;
  let end = text.length;
  let bestStart = 0;
  let bestEnd = text.length;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const leftPart = text.substring(0, mid);
    const rightPart = text.substring(text.length - mid);
    const combinedWidth =
      context.measureText(leftPart).width + context.measureText(rightPart).width;

    if (combinedWidth <= targetWidth) {
      bestStart = mid;
      bestEnd = text.length - mid;
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }

  const truncated = text.substring(0, bestStart) + ellipsis + text.substring(bestEnd);
  return { truncated, isTruncated: true };
}

/**
 * Renders text that truncates in the middle (`abc...xyz`) based on the
 * container width while preserving both the prefix and suffix.
 *
 * A tooltip with the original text is provided when truncation occurs.
 */
export const MiddleEllipsisText = React.memo(
  React.forwardRef<HTMLSpanElement, MiddleEllipsisTextProps>(({ text, className }, ref) => {
    const [displayText, setDisplayText] = React.useState(text);
    const [isTruncated, setIsTruncated] = React.useState(false);
    const containerRef = React.useRef<HTMLSpanElement>(null);
    const rafIdRef = React.useRef<number | null>(null);

    React.useImperativeHandle(ref, () => containerRef.current!);

    const updateTruncation = React.useCallback(() => {
      const container = containerRef.current;
      if (!container) return;

      const computedStyle = window.getComputedStyle(container);
      const font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
      const availableWidth = container.offsetWidth;

      const { truncated, isTruncated: truncated_flag } = calculateTruncatedText(
        text,
        availableWidth,
        font,
      );

      setDisplayText(truncated);
      setIsTruncated(truncated_flag);
    }, [text]);

    // Update truncation on mount/text change and observe resize
    React.useEffect(() => {
      updateTruncation();

      const container = containerRef.current;
      let resizeObserver: ResizeObserver | null = null;

      if (container) {
        resizeObserver = new ResizeObserver(() => {
          if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
          }
          rafIdRef.current = requestAnimationFrame(() => {
            updateTruncation();
          });
        });

        resizeObserver.observe(container);
      }

      return () => {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        resizeObserver?.disconnect();
      };
    }, [updateTruncation]);

    return (
      <span
        ref={containerRef}
        className={cn('block min-w-0', className)}
        title={isTruncated ? text : undefined}
      >
        {displayText}
      </span>
    );
  }),
);
