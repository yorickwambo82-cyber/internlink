'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  Clock,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/store';
import EmptyState from '@/components/shared/EmptyState';
import type { AuditLog } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const actionCategories = [
  { value: '', label: 'All Actions' },
  { value: 'APPROVE', label: 'Approve' },
  { value: 'REJECT', label: 'Reject' },
  { value: 'ACTIVATE', label: 'Activate' },
  { value: 'SUSPEND', label: 'Suspend' },
  { value: 'VERIFY', label: 'Verify' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
];

const actionColorMap: Record<string, string> = {
  APPROVE_COMPANY: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  REJECT_COMPANY: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
  ACTIVATE_USER: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  SUSPEND_USER: 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400',
  VERIFY_USER: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400',
  UNVERIFY_USER: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  CREATE_CATEGORY: 'border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-400',
  UPDATE_CATEGORY: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400',
  DELETE_CATEGORY: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
};

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AuditLogs() {
  const token = useAuthStore((s) => s.token);

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchLogs = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const params = new URLSearchParams();
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());
      if (actionFilter) params.set('action', actionFilter);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, { headers });
      const data = await res.json();

      if (data.success) {
        setLogs(data.data.logs);
        setPagination((prev) => ({
          ...prev,
          total: data.data.pagination.total,
          totalPages: data.data.pagination.totalPages,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [token, pagination.page, pagination.limit, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setLoading(true);
      setPagination((prev) => ({ ...prev, page }));
    }
  };

  const refresh = () => {
    setLoading(true);
    fetchLogs();
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 md:p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">
            Track all admin actions on the platform.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter:</span>
              </div>
              <Select
                value={actionFilter}
                onValueChange={(val) => {
                  setActionFilter(val === '__all__' ? '' : val);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                  setLoading(true);
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Actions</SelectItem>
                  {actionCategories
                    .filter((c) => c.value)
                    .map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground ml-auto">
                {pagination.total} total logs
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Logs Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <EmptyState
                icon={ScrollText}
                title="No audit logs"
                description="Audit logs will appear here as admin actions are performed."
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Timestamp
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            User
                          </div>
                        </TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="hidden md:table-cell">Entity</TableHead>
                        <TableHead className="hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Details
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs">
                            <div>
                              <p className="font-medium">
                                {format(new Date(log.createdAt), 'MMM d, yyyy')}
                              </p>
                              <p className="text-muted-foreground">
                                {format(new Date(log.createdAt), 'HH:mm:ss')}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate max-w-[140px]">
                                {log.user?.name || 'System'}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {log.user?.role || ''}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${
                                actionColorMap[log.action] ||
                                'border-gray-500/30 bg-gray-500/10 text-gray-700 dark:text-gray-400'
                              }`}
                            >
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            {log.entity ? (
                              <div>
                                <span className="font-medium">{log.entity}</span>
                                {log.entityId && (
                                  <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                    ID: {log.entityId.slice(0, 8)}...
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[250px]">
                            <p className="truncate">{log.details || '—'}</p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Showing {(pagination.page - 1) * pagination.limit + 1}-
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={pagination.page <= 1}
                        onClick={() => goToPage(pagination.page - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm px-2">
                        {pagination.page} / {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => goToPage(pagination.page + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
