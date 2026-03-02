/**
 * Domain management utility functions.
 * @module domain-management-utils
 * @internal
 */

import type { Domain } from '@/types/my-organization/domain-management/domain-table-types';

/**
 * Returns badge variant for domain status.
 * @param status - Current status
 * @returns The badge variant
 * @internal
 */
export function getStatusBadgeVariant(
  status: Domain['status'],
): 'success' | 'warning' | 'destructive' | 'outline' {
  switch (status) {
    case 'verified':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
}
