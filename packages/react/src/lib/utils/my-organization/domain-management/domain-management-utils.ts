import type { Domain } from '@/types/my-organization/domain-management/domain-table-types';

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
