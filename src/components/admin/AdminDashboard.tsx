'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Building2,
  Briefcase,
  FileText,
  Clock,
  CheckCircle2,
  Users,
  ShieldCheck,
  BarChart3,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuthStore, useNavStore } from '@/store';
import StatCard from '@/components/shared/StatCard';
import EmptyState from '@/components/shared/EmptyState';
import type { AuditLog, PlatformStats } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const PIE_COLORS = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#6366f1', '#9ca3af'];

interface DashboardStats {
  totalStudents: number;
  totalCompanies: number;
  activeOffers: number;
  totalApplications: number;
  pendingCompanies: number;
  completionRate: number;
  applicationsByStatus: Record<string, number>;
  recentSignups: number;
}

const actionIconMap: Record<string, string> = {
  APPROVE_COMPANY: '✅',
  REJECT_COMPANY: '❌',
  ACTIVATE_USER: '🟢',
  SUSPEND_USER: '🔴',
  VERIFY_USER: '✔️',
  UNVERIFY_USER: '⚠️',
  CREATE_CATEGORY: '📁',
  UPDATE_CATEGORY: '✏️',
  DELETE_CATEGORY: '🗑️',
};

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavStore((s) => s.navigate);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [statsRes, logsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/audit-logs?limit=5', { headers }),
      ]);

      const statsData = await statsRes.json();
      const logsData = await logsRes.json();

      if (statsData.success) {
        const d = statsData.data;
        const total = d.applications?.total || 0;
        const completed = d.applications?.byStatus?.COMPLETED || 0;
        setStats({
          totalStudents: d.users?.totalStudents || 0,
          totalCompanies: d.users?.totalCompanies || 0,
          activeOffers: d.offers?.active || 0,
          totalApplications: total,
          pendingCompanies: d.companies?.pending || 0,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          applicationsByStatus: d.applications?.byStatus || {},
          recentSignups: d.users?.recentSignups || 0,
        });
      }

      if (logsData.success) {
        setAuditLogs(logsData.data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin dashboard data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Chart data derived from applicationsByStatus
  const barChartData = stats
    ? Object.entries(stats.applicationsByStatus).map(([status, count]) => ({
        name: status.replace('_', ' '),
        count,
      }))
    : [];

  const pieChartData = stats
    ? Object.entries(stats.applicationsByStatus).map(([status, count]) => ({
        name: status.replace('_', ' '),
        value: count,
      }))
    : [];

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 md:p-6"
    >
      {/* Welcome */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Admin Dashboard 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.name || 'Admin'}. Here&apos;s your platform overview.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={GraduationCap}
          label="Total Students"
          value={stats?.totalStudents ?? 0}
          delay={0}
          accentColor="bg-sky-500"
        />
        <StatCard
          icon={Building2}
          label="Total Companies"
          value={stats?.totalCompanies ?? 0}
          delay={0.05}
          accentColor="bg-emerald-500"
        />
        <StatCard
          icon={Briefcase}
          label="Active Offers"
          value={stats?.activeOffers ?? 0}
          delay={0.1}
          accentColor="bg-amber-500"
        />
        <StatCard
          icon={FileText}
          label="Total Applications"
          value={stats?.totalApplications ?? 0}
          delay={0.15}
          accentColor="bg-teal-500"
        />
        <StatCard
          icon={Clock}
          label="Pending Companies"
          value={stats?.pendingCompanies ?? 0}
          delay={0.2}
          accentColor="bg-orange-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completion Rate"
          value={`${stats?.completionRate ?? 0}%`}
          delay={0.25}
          accentColor="bg-violet-500"
        />
      </div>

      {/* Charts + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications by Status Bar Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Applications by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {barChartData.length === 0 ? (
                <EmptyState
                  icon={BarChart3}
                  title="No application data"
                  description="Application statistics will appear here once there is data."
                />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pieChartData.length === 0 ? (
                <EmptyState
                  icon={Activity}
                  title="No data yet"
                  description="Status distribution will show here."
                />
              ) : (
                <div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid hsl(var(--border))',
                          backgroundColor: 'hsl(var(--popover))',
                          color: 'hsl(var(--popover-foreground))',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {pieChartData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <span className="text-muted-foreground">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => navigate('admin-audit')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="max-h-80 overflow-y-auto">
              {auditLogs.length === 0 ? (
                <EmptyState
                  icon={Activity}
                  title="No recent activity"
                  description="Audit logs will appear here as admin actions are performed."
                />
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="text-lg mt-0.5 shrink-0">
                        {actionIconMap[log.action] || '📋'}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {log.user?.name || 'System'}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                            {log.action}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {log.details || `${log.action} on ${log.entity || 'unknown'}`}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => navigate('admin-users')}
                >
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Manage Users</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => navigate('admin-companies')}
                >
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Approve Companies</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => navigate('admin-audit')}
                >
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">View Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
