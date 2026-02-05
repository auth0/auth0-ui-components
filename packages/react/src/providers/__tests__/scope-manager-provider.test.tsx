import { render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ScopeManagerProvider } from '../scope-manager-provider';

import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { useScopeManager } from '@/hooks/shared/use-scope-manager';
import { mockCore, setupMockUseCoreClient } from '@/tests/utils';

const { initMockCoreClient } = mockCore();
let mockCoreClient: ReturnType<typeof initMockCoreClient>;

const TestConsumer = ({
  audience = 'me',
  scopes,
}: {
  audience?: 'me' | 'my-org';
  scopes?: string;
}) => {
  const { registerScopes, isReady, ensured } = useScopeManager();

  useEffect(() => {
    if (scopes) {
      registerScopes(audience, scopes);
    }
  }, [audience, scopes, registerScopes]);

  return (
    <div>
      <div data-testid="is-ready">{isReady.toString()}</div>
      <div data-testid="ensured-me">{ensured.me}</div>
      <div data-testid="ensured-my-organization">{ensured['my-org']}</div>
    </div>
  );
};

describe('ScopeManagerProvider', () => {
  const mockEnsureScopes = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock core client
    mockCoreClient = { ...initMockCoreClient(), ...mockEnsureScopes };
    setupMockUseCoreClient(mockCoreClient, useCoreClientModule);
    mockEnsureScopes.mockResolvedValue(undefined);
  });

  it('should render children', () => {
    render(
      <ScopeManagerProvider>
        <div data-testid="child-content">Test Content</div>
      </ScopeManagerProvider>,
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should provide initial context values', () => {
    render(
      <ScopeManagerProvider>
        <TestConsumer />
      </ScopeManagerProvider>,
    );

    expect(screen.getByTestId('is-ready')).toHaveTextContent('false');
    expect(screen.getByTestId('ensured-me')).toHaveTextContent('');
    expect(screen.getByTestId('ensured-my-organization')).toHaveTextContent('');
  });

  it('should not register empty scopes', async () => {
    render(
      <ScopeManagerProvider>
        <TestConsumer audience="me" scopes="" />
      </ScopeManagerProvider>,
    );

    await waitFor(() => {
      expect(mockEnsureScopes).not.toHaveBeenCalled();
    });
  });

  it('should not register whitespace-only scopes', async () => {
    render(
      <ScopeManagerProvider>
        <TestConsumer audience="me" scopes="   " />
      </ScopeManagerProvider>,
    );

    await waitFor(() => {
      expect(mockEnsureScopes).not.toHaveBeenCalled();
    });
  });

  it('should set isReady to true after scopes are ensured', async () => {
    render(
      <ScopeManagerProvider>
        <TestConsumer audience="me" scopes="read:profile" />
      </ScopeManagerProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-ready')).toHaveTextContent('true');
    });
  });

  it('should update ensured state after scopes are ensured', async () => {
    render(
      <ScopeManagerProvider>
        <TestConsumer audience="me" scopes="read:profile" />
      </ScopeManagerProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('ensured-me')).toHaveTextContent('read:profile');
    });
  });

  it('should not call ensureScopes when coreClient is not available', async () => {
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: null,
    });
    render(
      <ScopeManagerProvider>
        <TestConsumer audience="me" scopes="read:profile" />
      </ScopeManagerProvider>,
    );

    await waitFor(() => {
      expect(mockEnsureScopes).not.toHaveBeenCalled();
    });
  });
});
