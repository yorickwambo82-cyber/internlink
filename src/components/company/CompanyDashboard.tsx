'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Users,
  UserCheck,
  Award,
  Plus,
  FileText,
  UsersRound,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuthStore, useNavStore } from '@/store';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import type { Application, Offer } from '@/types';
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

export default function CompanyDashboard() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavStore((s) => s.navigate);
  const companyId = user?.companyProfile?.id;

  const [applications, setApplications] = useState<Application[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [appRes, offerRes] = await Promise.all([
        fetch('/api/applications', { headers }),
        fetch(`/api/offers?companyId=${companyId}&limit=100`, { headers: {} }),
      ]);

      const appData = await appRes.json();
      const offerData = await offerRes.json();

      if (appData.success) setApplications(appData.data);
      if (offerData.success) setOffers(offerData.data.offers);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [token, companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleQuickAction = async (applicationId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setActionLoading(applicationId);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          status === 'ACCEPTED'
            ? 'Application accepted successfully'
            : 'Application rejected'
        );
        setApplications((prev) =>
          prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
        );
      } else {
        toast.error(data.error || 'Failed to update application');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const stats = {
    activeOffers: offers.filter((o) => o.status === 'ACTIVE').length,
    totalApplications: applications.length,
    activeInterns: applications.filter((a) =>
      ['ACCEPTED', 'IN_PROGRESS'].includes(a.status)
    ).length,
    completedInternships: applications.filter((a) => a.status === 'COMPLETED').length,
  };

  const recentApplications = applications
    .filter((a) => a.status === 'PENDING')
    .slice(0, 5);

  const activeInterns = applications.filter((a) =>
    ['ACCEPTED', 'IN_PROGRESS'].includes(a.status)
  );

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
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
          Welcome back, {user?.companyProfile?.companyName || user?.name || 'Company'} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your internship programs.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Briefcase}
          label="Active Offers"
          value={stats.activeOffers}
          delay={0}
          accentColor="bg-sky-500"
        />
        <StatCard
          icon={Users}
          label="Total Applications"
          value={stats.totalApplications}
          delay={0.05}
          accentColor="bg-amber-500"
        />
        <StatCard
          icon={UserCheck}
          label="Active Interns"
          value={stats.activeInterns}
          delay={0.1}
          accentColor="bg-emerald-500"
        />
        <StatCard
          icon={Award}
          label="Completed Internships"
          value={stats.completedInternships}
          delay={0.15}
          accentColor="bg-teal-500"
        />
      </div>

      {/* Recent Applications + Active Interns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pending Applications */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">
                Recent Applications
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => navigate('company-applications')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {recentApplications.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No pending applications"
                  description="New applications will appear here when students apply."
                  actionLabel="View Offers"
                  onAction={() => navigate('company-offers')}
                />
              ) : (
                recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {app.student?.user?.name || 'Unknown Student'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {app.offer?.title || 'Unknown Offer'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        disabled={actionLoading === app.id}
                        onClick={() => handleQuickAction(app.id, 'ACCEPTED')}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={actionLoading === app.id}
                        onClick={() => handleQuickAction(app.id, 'REJECTED')}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Interns Progress */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">
                Active Interns
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => navigate('company-interns')}
              >
                Manage
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {activeInterns.length === 0 ? (
                <EmptyState
                  icon={UserCheck}
                  title="No active interns"
                  description="Accepted interns will appear here."
                  actionLabel="View Applications"
                  onAction={() => navigate('company-applications')}
                />
              ) : (
                activeInterns.map((app) => {
                  const totalReports = app.reports?.length ?? 0;
                  const validatedReports =
                    app.reports?.filter((r) => r.status === 'VALIDATED').length ?? 0;
                  const reportProgress = totalReports > 0 ? (validatedReports / totalReports) * 100 : 0;

                  return (
                    <div
                      key={app.id}
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {app.student?.user?.name || 'Unknown Student'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {app.offer?.title || 'Unknown Offer'}
                          </p>
                        </div>
                        <StatusBadge status={app.status} size="sm" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Reports: {validatedReports}/{totalReports} validated</span>
                          <span>{Math.round(reportProgress)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${reportProgress}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="h-full rounded-full bg-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

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
                onClick={() => navigate('company-offers')}
              >
                <Plus className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Post New Offer</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('company-reports')}
              >
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">View Reports</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('company-interns')}
              >
                <UsersRound className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Manage Interns</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
