'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  ACCEPTED: {
    label: 'Accepted',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
  },
  SUBMITTED: {
    label: 'Submitted',
    className: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400',
  },
  VALIDATED: {
    label: 'Validated',
    className: 'border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-400',
  },
  REVISION_NEEDED: {
    label: 'Revision Needed',
    className: 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400',
  },
  ACTIVE: {
    label: 'Active',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  CLOSED: {
    label: 'Closed',
    className: 'border-gray-500/30 bg-gray-500/10 text-gray-700 dark:text-gray-400',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'border-gray-500/30 bg-gray-500/10 text-gray-700 dark:text-gray-400',
  },
  PAUSED: {
    label: 'Paused',
    className: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'border-gray-300 bg-gray-100 text-gray-600 dark:text-gray-400',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium transition-colors',
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5',
        config.className
      )}
    >
      {config.label}
    </Badge>
  );
}
