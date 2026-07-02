import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';

import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { TelemetryProvider } from '@/providers/telemetry-provider';

describe('useTelemetry', () => {
  let componentRef: { current: string };

  beforeEach(() => {
    componentRef = { current: 'unknown' };
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TelemetryProvider componentRef={componentRef}>{children}</TelemetryProvider>
  );

  it('should set componentRef to the provided component name', () => {
    renderHook(() => useTelemetry('test-component'), { wrapper });

    expect(componentRef.current).toBe('test-component');
  });

  it('should restore previous value on unmount', () => {
    componentRef.current = 'previous-component';

    const { unmount } = renderHook(() => useTelemetry('test-component'), { wrapper });

    expect(componentRef.current).toBe('test-component');

    unmount();

    expect(componentRef.current).toBe('previous-component');
  });

  it('should update componentRef when component name changes', () => {
    const { rerender } = renderHook(({ name }) => useTelemetry(name), {
      wrapper,
      initialProps: { name: 'first-component' },
    });

    expect(componentRef.current).toBe('first-component');

    rerender({ name: 'second-component' });

    expect(componentRef.current).toBe('second-component');
  });

  it('should handle nested components correctly', () => {
    const outerRef = { current: 'unknown' };
    const OuterWrapper = ({ children }: { children: React.ReactNode }) => (
      <TelemetryProvider componentRef={outerRef}>{children}</TelemetryProvider>
    );

    const { unmount: unmountOuter } = renderHook(() => useTelemetry('outer-component'), {
      wrapper: OuterWrapper,
    });

    expect(outerRef.current).toBe('outer-component');

    const { unmount: unmountInner } = renderHook(() => useTelemetry('inner-component'), {
      wrapper: OuterWrapper,
    });

    expect(outerRef.current).toBe('inner-component');

    unmountInner();
    expect(outerRef.current).toBe('outer-component');

    unmountOuter();
    expect(outerRef.current).toBe('unknown');
  });
});
