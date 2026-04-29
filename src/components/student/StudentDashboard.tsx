'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  TrendingUp,
  ClipboardList,
  CheckCircle2,
  Search,
  BookOpen,
  FileBadge,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore, useNavStore } from '@/store';
import StatCard from '@/components/shared/StatCard';
import ApplicationCard from '@/components/shared/ApplicationCard';
import OfferCard from '@/components/shared/OfferCard';
import EmptyState from '@/components/shared/EmptyState';
import type { Application, Offer } from '@/types';

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

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavStore((s) => s.navigate);

  const [applications, setApplications] = useState<Application[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const [appRes, offerRes] = await Promise.all([
          fetch('/api/applications', { headers }),
          fetch('/api/offers?limit=4', { headers: {} }),
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
    }
    fetchData();
  }, [token]);

  const stats = {
    applied: applications.length,
    active: applications.filter((a) =>
      ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(a.status)
    ).length,
    reportsSubmitted: applications.reduce(
      (sum, a) => sum + (a.reports?.length ?? 0),
      0
    ),
    completed: applications.filter((a) => a.status === 'COMPLETED').length,
  };

  const recentApplications = applications.slice(0, 3);

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
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
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
          Welcome back, {user?.name || 'Student'} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your internship journey.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Applied"
          value={stats.applied}
          delay={0}
          accentColor="bg-sky-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Applications"
          value={stats.active}
          delay={0.05}
          accentColor="bg-emerald-500"
        />
        <StatCard
          icon={ClipboardList}
          label="Reports Submitted"
          value={stats.reportsSubmitted}
          delay={0.1}
          accentColor="bg-amber-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.completed}
          delay={0.15}
          accentColor="bg-teal-500"
        />
      </div>

      {/* Recent Applications + Recommended Offers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
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
                onClick={() => navigate('student-applications')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentApplications.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No applications yet"
                  description="Start applying to internships to see them here."
                  actionLabel="Browse Offers"
                  onAction={() => navigate('student-offers')}
                />
              ) : (
                recentApplications.map((app, i) => (
                  <ApplicationCard key={app.id} application={app} delay={i * 0.05} />
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommended Offers */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">
                Recommended Offers
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => navigate('student-offers')}
              >
                Browse All
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {offers.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No offers available"
                  description="Check back later for new internship opportunities."
                />
              ) : (
                offers.map((offer, i) => (
                  <OfferCard key={offer.id} offer={offer} delay={i * 0.05} />
                ))
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
                onClick={() => navigate('student-offers')}
              >
                <Search className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Browse Offers</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('student-reports')}
              >
                <FileBadge className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Submit Report</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('student-guide')}
              >
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">View Guide</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
