import * as React from 'react';

import { useDomainTable } from '../hooks/my-org/domain-management/use-domain-table';
import type {
  DomainTableProps,
  UseDomainTableResult,
} from '../types/my-org/domain-management/domain-table-types';

/**
 * Higher-order component that provides Domain Table logic to any component
 * This abstracts all the state management and business logic
 */
export function withDomainTableLogic<P extends DomainTableProps>(
  Component: React.ComponentType<P & { logic: UseDomainTableResult }>,
) {
  return function WithDomainTableLogicComponent(props: P) {
    const domainTableLogic = useDomainTable({
      customMessages: props.customMessages,
      createAction: props.createAction,
      verifyAction: props.verifyAction,
      deleteAction: props.deleteAction,
      associateToProviderAction: props.associateToProviderAction,
      deleteFromProviderAction: props.deleteFromProviderAction,
    });

    return <Component {...props} logic={domainTableLogic} />;
  };
}
