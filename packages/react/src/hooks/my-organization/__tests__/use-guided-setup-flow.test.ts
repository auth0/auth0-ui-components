import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useGuidedSetupFlow } from '../use-guided-setup-flow';

const pages = [
  { key: 'create', title: 'Create Application' },
  { key: 'configure', title: 'Configure Connection', exit_condition: 'connection_exists' },
  { key: 'mapping', title: 'Claims Mapping', entry_condition: 'if_mapping_present' },
  { key: 'test', title: 'Test SSO', exit_condition: 'connection_testing_suggested' },
];

const noMappings = { hasMappings: false, groupProvisioningEnabled: false };
const withMappings = { hasMappings: true, groupProvisioningEnabled: false };
const notCreated = { connectionExists: false, googleWorkspaceSetupComplete: false };
const created = { connectionExists: true, googleWorkspaceSetupComplete: false };

describe('useGuidedSetupFlow', () => {
  it('starts on the first visible page', () => {
    const { result } = renderHook(() =>
      useGuidedSetupFlow({ pages, entryContext: noMappings, exitState: notCreated }),
    );

    expect(result.current.visiblePages.map((page) => page.key)).toEqual([
      'create',
      'configure',
      'test',
    ]);
    expect(result.current.currentPage?.key).toBe('create');
    expect(result.current.isFirstPage).toBe(true);
  });

  it('starts on the initial page when given', () => {
    const { result } = renderHook(() =>
      useGuidedSetupFlow({
        pages,
        entryContext: noMappings,
        exitState: created,
        initialPageKey: 'configure',
      }),
    );

    expect(result.current.currentPage?.key).toBe('configure');
  });

  it('follows an initial page that is only known after the pages load', () => {
    const { result, rerender } = renderHook(
      ({ loaded }) =>
        useGuidedSetupFlow({
          pages: loaded ? pages : [],
          entryContext: noMappings,
          exitState: created,
          initialPageKey: loaded ? 'configure' : undefined,
        }),
      { initialProps: { loaded: false } },
    );
    expect(result.current.currentPage).toBeUndefined();

    rerender({ loaded: true });

    expect(result.current.currentPage?.key).toBe('configure');
  });

  it('falls back to the first page for an unknown or hidden initial page', () => {
    const { result } = renderHook(() =>
      useGuidedSetupFlow({
        pages,
        entryContext: noMappings,
        exitState: notCreated,
        initialPageKey: 'mapping',
      }),
    );

    expect(result.current.currentPage?.key).toBe('create');
  });

  it('moves forward and back', () => {
    const { result } = renderHook(() =>
      useGuidedSetupFlow({ pages, entryContext: noMappings, exitState: notCreated }),
    );

    act(() => {
      result.current.goNext();
    });
    expect(result.current.currentPage?.key).toBe('configure');

    act(() => result.current.goBack());
    expect(result.current.currentPage?.key).toBe('create');
  });

  it('blocks leaving a connection_exists page until the provider exists', () => {
    const { result, rerender } = renderHook(
      ({ exitState }) => useGuidedSetupFlow({ pages, entryContext: noMappings, exitState }),
      { initialProps: { exitState: notCreated } },
    );

    act(() => {
      result.current.goNext();
    });
    expect(result.current.canLeaveCurrentPage).toBe(false);
    expect(result.current.currentExitPolicy).toBe('blocking');

    let moved = true;
    act(() => {
      moved = result.current.goNext();
    });
    expect(moved).toBe(false);
    expect(result.current.currentPage?.key).toBe('configure');

    rerender({ exitState: created });
    act(() => {
      result.current.goNext();
    });
    expect(result.current.currentPage?.key).toBe('test');
  });

  it('does not jump past a blocking page with goToPage', () => {
    const { result } = renderHook(() =>
      useGuidedSetupFlow({ pages, entryContext: noMappings, exitState: notCreated }),
    );

    let moved = true;
    act(() => {
      moved = result.current.goToPage(2);
    });

    expect(moved).toBe(false);
    expect(result.current.currentPage?.key).toBe('create');
  });

  it('keeps the current page when pages appear', () => {
    const { result, rerender } = renderHook(
      ({ entryContext }) =>
        useGuidedSetupFlow({ pages, entryContext, exitState: created, initialPageKey: 'test' }),
      { initialProps: { entryContext: noMappings } },
    );
    expect(result.current.currentIndex).toBe(2);

    rerender({ entryContext: withMappings });

    expect(result.current.currentPage?.key).toBe('test');
    expect(result.current.currentIndex).toBe(3);
  });

  it('reports the last page and does not move past it', () => {
    const { result } = renderHook(() =>
      useGuidedSetupFlow({
        pages,
        entryContext: noMappings,
        exitState: created,
        initialPageKey: 'test',
      }),
    );

    expect(result.current.isLastPage).toBe(true);
    let moved = true;
    act(() => {
      moved = result.current.goNext();
    });
    expect(moved).toBe(false);
  });

  it('lets suggested exit conditions be left', () => {
    const { result } = renderHook(() =>
      useGuidedSetupFlow({
        pages: [pages[3]!, { key: 'after', title: 'After' }],
        entryContext: noMappings,
        exitState: notCreated,
      }),
    );

    expect(result.current.currentExitPolicy).toBe('suggested');
    expect(result.current.canLeaveCurrentPage).toBe(true);
  });
});
