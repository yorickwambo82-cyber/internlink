'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuthStore, useNavStore } from '@/store';
import ApplicationCard from '@/components/shared/ApplicationCard';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import type { Application, ApplicationStatus } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';

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

const TABS: { value: string; label: string; statuses: ApplicationStatus[] }[] = [
  { value: 'all', label: 'All', statuses: [] },
  { value: 'PENDING', label: 'Pending', statuses: ['PENDING'] },
  { value: 'ACCEPTED', label: 'Accepted', statuses: ['ACCEPTED'] },
  { value: 'IN_PROGRESS', label: 'Active', statuses: ['IN_PROGRESS'] },
  { value: 'COMPLETED', label: 'Completed', statuses: ['COMPLETED'] },
  { value: 'REJECTED', label: 'Rejected', statuses: ['REJECTED'] },
];

export default function MyApplications() {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavStore((s) => s.navigate);

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await fetch('/api/applications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setApplications(data.data);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, [token]);

  const filteredApplications = applications.filter((app) => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-20" />
          ))}
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
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
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          My Applications
        </h1>
        <p className="text-muted-foreground mt-1">
          Track and manage your internship applications.
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1">
            {TABS.map((tab) => {
              const count =
                tab.value === 'all'
                  ? applications.length
                  : applications.filter((a) => a.status === tab.value).length;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                  {tab.label}
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              {filteredApplications.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title={
                    tab.value === 'all'
                      ? 'No applications yet'
                      : `No ${tab.label.toLowerCase()} applications`
                  }
                  description={
                    tab.value === 'all'
                      ? 'Start applying to internships to see them here.'
                      : `You don't have any ${tab.label.toLowerCase()} applications.`
                  }
                  actionLabel={tab.value === 'all' ? 'Browse Offers' : undefined}
                  onAction={
                    tab.value === 'all'
                      ? () => navigate('student-offers')
                      : undefined
                  }
                />
              ) : (
                <div className="space-y-3">
                  {filteredApplications.map((app, i) => {
                    const isExpanded = expandedId === app.id;
                    return (
                      <motion.div key={app.id} variants={itemVariants}>
                        <Card className="overflow-hidden">
                          <CardContent className="p-4 space-y-3">
                            {/* Header row */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1 min-w-0">
                                <h3 className="font-semibold text-base truncate">
                                  {app.offer?.title ?? 'Untitled Offer'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {app.offer?.company?.companyName ?? 'Unknown Company'}
                                </p>
                              </div>
                              <StatusBadge status={app.status} size="sm" />
                            </div>

                            {/* Date & info */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>
                                Applied {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
                              </span>
                              {app.acceptedAt && (
                                <span>
                                  Accepted {formatDistanceToNow(new Date(app.acceptedAt), { addSuffix: true })}
                                </span>
                              )}
                            </div>

                            {/* Expand/Collapse */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs h-8"
                              onClick={() => toggleExpand(app.id)}
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-3 w-3 mr-1" />
                                  Hide Details
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3 mr-1" />
                                  View Details
                                </>
                              )}
                            </Button>

                            {/* Expanded details */}
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-3 pt-2"
                              >
                                <Separator />
                                {app.coverLetter && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Cover Letter
                                    </p>
                                    <p className="text-sm leading-relaxed">
                                      {app.coverLetter}
                                    </p>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Applied On
                                    </p>
                                    <p>{format(new Date(app.appliedAt), 'MMM d, yyyy')}</p>
                                  </div>
                                  {app.acceptedAt && (
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground">
                                        Accepted On
                                      </p>
                                      <p>{format(new Date(app.acceptedAt), 'MMM d, yyyy')}</p>
                                    </div>
                                  )}
                                  {app.completedAt && (
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground">
                                        Completed On
                                      </p>
                                      <p>{format(new Date(app.completedAt), 'MMM d, yyyy')}</p>
                                    </div>
                                  )}
                                  {app.reports && app.reports.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground">
                                        Reports
                                      </p>
                                      <p>{app.reports.length} submitted</p>
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2 pt-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7"
                                    onClick={() =>
                                      navigate('offer-detail', { offerId: app.offerId })
                                    }
                                  >
                                    View Offer
                                  </Button>
                                  {(app.status === 'ACCEPTED' || app.status === 'IN_PROGRESS') && (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="text-xs h-7"
                                      onClick={() => navigate('student-reports')}
                                    >
                                      Submit Report
                                    </Button>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
