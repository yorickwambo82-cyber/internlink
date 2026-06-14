'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Users,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  PlayCircle,
  PauseCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import type { User, UserRole } from '@/types';
import { formatDistanceToNow } from 'date-fns';
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

const roleBadgeColor: Record<UserRole, string> = {
  STUDENT: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400',
  COMPANY: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  SUPERVISOR: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  ADMIN: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400',
};

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ManageUsers() {
  const token = useAuthStore((s) => s.token);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'suspend' | 'activate' | 'verify' | 'delete';
    user: User;
  } | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const params = new URLSearchParams();
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());
      if (search) params.set('search', search);
      if (roleFilter && roleFilter !== 'all') params.set('role', roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`, { headers });
      const data = await res.json();

      if (data.success) {
        setUsers(data.data.users);
        setPagination((prev) => ({
          ...prev,
          total: data.data.pagination.total,
          totalPages: data.data.pagination.totalPages,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [token, pagination.page, pagination.limit, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserAction = async (
    userId: string,
    action: 'activate' | 'suspend' | 'verify' | 'delete'
  ) => {
    setActionLoading(userId);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      if (action === 'delete') {
        const res = await fetch(`/api/admin/users?userId=${userId}`, {
          method: 'DELETE',
          headers,
        });
        const data = await res.json();
        if (data.success) {
          toast.success('User deleted successfully');
          if (selectedUser?.id === userId) setSelectedUser(null);
          fetchUsers();
        } else {
          toast.error(data.error || 'Failed to delete user');
        }
        return;
      }

      const body: Record<string, unknown> = { userId };
      if (action === 'activate') body.active = true;
      if (action === 'suspend') body.active = false;
      if (action === 'verify') body.verified = true;

      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          action === 'activate'
            ? 'User activated successfully'
            : action === 'suspend'
              ? 'User suspended successfully'
              : 'User verified successfully'
        );
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to update user');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setLoading(true);
      setPagination((prev) => ({ ...prev, page }));
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 md:p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all platform users.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="pl-9"
                />
              </div>
              <Select
                value={roleFilter}
                onValueChange={(val) => {
                  setRoleFilter(val);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                  setLoading(true);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="COMPANY">Company</SelectItem>
                  <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No users found"
                description="No users match your search criteria."
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Verified</TableHead>
                        <TableHead className="hidden lg:table-cell">Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow 
                          key={u.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedUser(u)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                                {u.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <span className="truncate max-w-[120px]">{u.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground text-sm truncate max-w-[180px]">
                            {u.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${roleBadgeColor[u.role] || ''}`}
                            >
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <StatusBadge
                              status={u.active ? 'ACTIVE' : 'PAUSED'}
                              size="sm"
                            />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {u.verified ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(u.createdAt), {
                              addSuffix: true,
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {u.active ? (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                                      disabled={actionLoading === u.id}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <PauseCircle className="h-3.5 w-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Suspend User</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to suspend{' '}
                                        <strong>{u.name}</strong>? They will lose access to the
                                        platform.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleUserAction(u.id, 'suspend')}
                                        className="bg-orange-600 hover:bg-orange-700"
                                      >
                                        Suspend
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                                  disabled={actionLoading === u.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUserAction(u.id, 'activate');
                                  }}
                                >
                                  <PlayCircle className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              {!u.verified && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-sky-500 hover:text-sky-600 hover:bg-sky-50"
                                  disabled={actionLoading === u.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUserAction(u.id, 'verify');
                                  }}
                                >
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    disabled={actionLoading === u.id}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete{' '}
                                      <strong>{u.name}</strong>? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleUserAction(u.id, 'delete')}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
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

      {/* User Detail Dialog */}
      <Dialog
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                  {selectedUser.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-0.5 ${roleBadgeColor[selectedUser.role] || ''}`}
                  >
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={selectedUser.active ? 'ACTIVE' : 'PAUSED'} size="sm" />
                </div>
                <div>
                  <p className="text-muted-foreground">Verified</p>
                  {selectedUser.verified ? 'Yes' : 'No'}
                </div>
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  {formatDistanceToNow(new Date(selectedUser.createdAt), { addSuffix: true })}
                </div>
              </div>
              {selectedUser.studentProfile && (
                <div className="text-sm border-t pt-3">
                  <p className="font-medium mb-1">Student Profile</p>
                  <p className="text-muted-foreground">
                    {selectedUser.studentProfile.university && `${selectedUser.studentProfile.university} — `}
                    {selectedUser.studentProfile.fieldOfStudy || 'No field specified'}
                  </p>
                </div>
              )}
              {selectedUser.companyProfile && (
                <div className="text-sm border-t pt-3">
                  <p className="font-medium mb-1">Company Profile</p>
                  <p className="text-muted-foreground">
                    {selectedUser.companyProfile.companyName}
                  </p>
                </div>
              )}
              <div className="text-sm border-t pt-3">
                <p className="font-medium mb-1">Subscription Details</p>
                {selectedUser.subscription ? (
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <div>
                      Plan: <span className="font-medium text-foreground">{selectedUser.subscription.plan}</span>
                    </div>
                    <div>
                      Status: <StatusBadge status={selectedUser.subscription.status} size="sm" />
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No active subscription (Free limits apply)</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
