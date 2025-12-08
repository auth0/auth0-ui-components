import { render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import * as useCoreClientModule from '../../hooks/use-core-client';
import { useScopeManager } from '../../hooks/use-scope-manager';
import { ScopeManagerProvider } from '../scope-manager-provider';

vi.mock('../../hooks/use-core-client', () => ({
  useCoreClient: vi.fn(),
}));

const mockUseCoreClient = vi.mocked(useCoreClientModule.useCoreClient);

const TestConsumer: React.FC<{ audience?: 'me' | 'my-org'; scopes?: string }> = ({
  audience = 'me',
  scopes,
}) => {
  const { registerScopes, isReady, ensured } = useScopeManager();

  React.useEffect(() => {
    if (scopes) {
      registerScopes(audience, scopes);
    }
  }, [audience, scopes, registerScopes]);

  return (
    <div>
      <div data-testid="is-ready">{isReady.toString()}</div>
      <div data-testid="ensured-me">{ensured.me}</div>
      <div data-testid="ensured-my-org">{ensured['my-org']}</div>
    </div>
  );
};

describe('ScopeManagerProvider', () => {
  const mockEnsureScopes = vi.fn();
  const mockCoreClient = {
    ensureScopes: mockEnsureScopes,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCoreClient.mockReturnValue({
      coreClient: mockCoreClient as never,
    });
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
    expect(screen.getByTestId('ensured-my-org')).toHaveTextContent('');
  });

  it('should register scopes for "me" audience', async () => {
    render(
      <ScopeManagerProvider>
        <TestConsumer audience="me" scopes="read:profile write:profile" />
      </ScopeManagerProvider>,
    );

    await waitFor(() => {
      expect(mockEnsureScopes).toHaveBeenCalledWith(expect.stringContaining('read:profile'), 'me');
    });
  });

  it('should register scopes for "my-org" audience', async () => {
    render(
      <ScopeManagerProvider>
        <TestConsumer audience="my-org" scopes="read:org write:org" />
      </ScopeManagerProvider>,
    );

    await waitFor(() => {
      expect(mockEnsureScopes).toHaveBeenCalledWith(expect.stringContaining('read:org'), 'my-org');
    });
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

  it('should handle ensureScopes error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockEnsureScopes.mockRejectedValue(new Error('Failed to ensure scopes'));

    render(
      <ScopeManagerProvider>
        <TestConsumer audience="me" scopes="read:profile" />
      </ScopeManagerProvider>,
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to ensure scopes for me'),
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });

  it('should not call ensureScopes when coreClient is not available', async () => {
    mockUseCoreClient.mockReturnValue({
      coreClient: null as never,
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

  it('should deduplicate scopes when registering', async () => {
    const { rerender } = render(
      <ScopeManagerProvider>
        <TestConsumer audience="me" scopes="read:profile" />
      </ScopeManagerProvider>,
    );

    await waitFor(() => {
      expect(mockEnsureScopes).toHaveBeenCalledTimes(1);
    });

    rerender(
      <ScopeManagerProvider>
        <TestConsumer audience="me" scopes="read:profile" />
      </ScopeManagerProvider>,
    );

    // Should not call again with same scopes
    expect(mockEnsureScopes).toHaveBeenCalledTimes(1);
  });
});
