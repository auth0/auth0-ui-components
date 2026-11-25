/**
 * Page navigation for the SSO guided setup.
 * @module use-guided-setup-flow
 */

import {
  canLeavePage,
  getExitConditionPolicy,
  resolveVisiblePages,
  type InstructionsFlowPage,
} from '@auth0/universal-components-core';
import * as React from 'react';

import type {
  UseGuidedSetupFlowOptions,
  UseGuidedSetupFlowResult,
} from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

/**
 * Tracks the current instructions page and whether the administrator may move on.
 * @param options - Hook options.
 * @param options.pages - Instruction pages.
 * @param options.entryContext - Entry condition facts.
 * @param options.exitState - Exit condition facts.
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

  return {
    visiblePages,
    currentIndex,
    currentPage,
    isFirstPage: currentIndex === 0,
    isLastPage: currentIndex === visiblePages.length - 1,
    canLeaveCurrentPage,
    currentExitPolicy: currentPage ? getExitConditionPolicy(currentPage) : undefined,
    goNext,
    goToPage,
  };
}
