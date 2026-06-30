import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import {
  TelemetryContext,
  TelemetryProvider,
  useTelemetryContext,
} from '@/providers/telemetry-provider';

describe('TelemetryProvider', () => {
  it('should provide componentRef to children', () => {
    const componentRef = { current: 'test-component' };

    const TestChild = () => {
      const context = React.useContext(TelemetryContext);
      return <div data-testid="result">{context?.componentRef.current}</div>;
    };

    render(
      <TelemetryProvider componentRef={componentRef}>
        <TestChild />
      </TelemetryProvider>,
    );

    expect(screen.getByTestId('result')).toHaveTextContent('test-component');
  });

  it('should update when componentRef changes', () => {
    const componentRef = { current: 'initial' };

    const TestChild = () => {
      const context = React.useContext(TelemetryContext);
      return <div data-testid="result">{context?.componentRef.current}</div>;
    };

    render(
      <TelemetryProvider componentRef={componentRef}>
        <TestChild />
      </TelemetryProvider>,
    );

    expect(screen.getByTestId('result')).toHaveTextContent('initial');

    componentRef.current = 'updated';

    expect(componentRef.current).toBe('updated');
  });
});

describe('useTelemetryContext', () => {
  it('should return context value when used within provider', () => {
    const componentRef = { current: 'context-test' };

    const TestChild = () => {
      const context = useTelemetryContext();
      return <div data-testid="result">{context.componentRef.current}</div>;
    };

    render(
      <TelemetryProvider componentRef={componentRef}>
        <TestChild />
      </TelemetryProvider>,
    );

    expect(screen.getByTestId('result')).toHaveTextContent('context-test');
  });

  it('should throw error when used outside provider', () => {
    const TestChild = () => {
      useTelemetryContext();
      return <div>Should not render</div>;
    };

    expect(() => render(<TestChild />)).toThrow(
      'useTelemetry must be used within Auth0ComponentProvider',
    );
  });
});
