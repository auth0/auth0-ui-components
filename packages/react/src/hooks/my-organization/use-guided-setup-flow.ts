/**
 * Navigation state for the SSO guided setup pages.
 * @module use-guided-setup-flow
 */

import {
  canLeavePage,
  getExitConditionPolicy,
  resolveVisiblePages,
  type ExitConditionPolicy,
  type InstructionsEntryContext,
  type InstructionsExitState,
  type InstructionsFlowPage,
} from '@auth0/universal-components-core';
import * as React from 'react';

export interface UseGuidedSetupFlowOptions<TPage extends InstructionsFlowPage> {
  pages: readonly TPage[];
  entryContext: InstructionsEntryContext;
  exitState: InstructionsExitState;
  initialPageKey?: string;
}

export interface UseGuidedSetupFlowResult<TPage extends InstructionsFlowPage> {
  visiblePages: TPage[];
  currentIndex: number;
  currentPage: TPage | undefined;
  isFirstPage: boolean;
  isLastPage: boolean;
  canLeaveCurrentPage: boolean;
  currentExitPolicy: ExitConditionPolicy | undefined;
  goNext: () => boolean;
  goBack: () => void;
  goToPage: (index: number) => boolean;
}

/**
 * Tracks which instructions page is shown and whether the administrator may move on. The current
 * page is kept by key, so it survives pages appearing or disappearing.
 * @param options - Hook options.
 * @param options.pages - Pages from the instructions response.
 * @param options.entryContext - Facts for entry conditions.
 * @param options.exitState - Facts for exit conditions.
 * @param options.initialPageKey - Page to start on.
 * @returns Flow state and navigation.
 */
export function useGuidedSetupFlow<TPage extends InstructionsFlowPage>({
  pages,
  entryContext,
  exitState,
  initialPageKey,
}: UseGuidedSetupFlowOptions<TPage>): UseGuidedSetupFlowResult<TPage> {
  const visiblePages = React.useMemo(
    () => resolveVisiblePages(pages, entryContext),
    [pages, entryContext],
  );

  const [navigatedKey, setCurrentKey] = React.useState<string | undefined>();
  const currentKey = navigatedKey ?? initialPageKey;

  const keyedIndex = visiblePages.findIndex((page) => page.key === currentKey);
  const currentIndex = keyedIndex >= 0 ? keyedIndex : 0;
  const currentPage = visiblePages[currentIndex];

  const canLeaveCurrentPage = currentPage ? canLeavePage(currentPage, exitState) : false;

  const goToPage = React.useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(index, visiblePages.length - 1));
      for (let i = currentIndex; i < target; i += 1) {
        if (!canLeavePage(visiblePages[i]!, exitState)) return false;
      }
      setCurrentKey(visiblePages[target]?.key);
      return target !== currentIndex;
    },
    [currentIndex, exitState, visiblePages],
  );

  const goNext = React.useCallback(() => {
    if (currentIndex >= visiblePages.length - 1) return false;
    return goToPage(currentIndex + 1);
  }, [currentIndex, goToPage, visiblePages.length]);

  const goBack = React.useCallback(() => {
    if (currentIndex > 0) goToPage(currentIndex - 1);
  }, [currentIndex, goToPage]);

  return {
    visiblePages,
    currentIndex,
    currentPage,
    isFirstPage: currentIndex === 0,
    isLastPage: currentIndex === visiblePages.length - 1,
    canLeaveCurrentPage,
    currentExitPolicy: currentPage ? getExitConditionPolicy(currentPage) : undefined,
    goNext,
    goBack,
    goToPage,
  };
}
