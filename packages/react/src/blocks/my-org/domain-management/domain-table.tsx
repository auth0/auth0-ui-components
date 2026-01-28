import { MY_ORG_DOMAIN_SCOPES } from '@auth0/universal-components-core';
import type { DomainTableProps } from '@react/types';
import type * as React from 'react';

import { withDomainTableLogic } from '../../../hoc/with-domain-table';
import { withMyOrgService } from '../../../hoc/with-services';

import { DomainTableView } from './domain-table-view';

// Apply HOCs: My Org Services (WrappedComponent, scopes) + Domain Table logic (state management, actions etc)
const DomainTableWithHOCs = withMyOrgService(
  withDomainTableLogic(DomainTableView),
  MY_ORG_DOMAIN_SCOPES,
);

/**
 * Complete Domain Table component.
 *
 * Handles all Domain Table logic internally - displays createm verify delete modals, select domains etc
 * Use this for plug-and-play Domain Table with no external state needed.
 *
 * @example
 * ```tsx
 * <DomainTable selectedDomain={} .../>
 * ```
 */

export const DomainTable = DomainTableWithHOCs as React.ComponentType<DomainTableProps>;
