'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MessageSquare,
  Loader2,
  Calendar,
  ClipboardList,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore, useNavStore } from '@/store';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import type { Report } from '@/types';
import { format } from 'date-fns';
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

interface MyReportsProps {
  onSubmitNew?: () => void;
}

export default function MyReports({ onSubmitNew }: MyReportsProps = {}) {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavStore((s) => s.navigate);

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterAppId, setFilterAppId] = useState<string>('all');

  // Resubmit modal
  const [resubmitOpen, setResubmitOpen] = useState(false);
  const [resubmitReport, setResubmitReport] = useState<Report | null>(null);
  const [resubmitActivities, setResubmitActivities] = useState('');
  const [resubmitChallenges, setResubmitChallenges] = useState('');
  const [resubmitNextPlan, setResubmitNextPlan] = useState('');
  const [resubmitting, setResubmitting] = useState(false);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch('/api/reports', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setReports(data.data);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [token]);

  // Get unique applications for filter
  const uniqueApplications = Array.from(
    new Map(
      reports
        .filter((r) => r.application)
        .map((r) => [r.application!.id, r.application!])
    ).values()
  );

  const filteredReports = reports.filter((r) => {
    if (filterAppId === 'all') return true;
    return r.applicationId === filterAppId;
  });

  const handleOpenResubmit = (report: Report) => {
    setResubmitReport(report);
    setResubmitActivities(report.activities);
    setResubmitChallenges(report.challenges || '');
    setResubmitNextPlan(report.nextPlan || '');
    setResubmitOpen(true);
  };

  const handleResubmit = async () => {
    if (!resubmitReport || !token) return;
    setResubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId: resubmitReport.applicationId,
          weekNumber: resubmitReport.weekNumber,
          activities: resubmitActivities.trim(),
          challenges: resubmitChallenges.trim() || undefined,
          nextPlan: resubmitNextPlan.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Failed to resubmit report');
        return;
      }

      toast.success('Report resubmitted successfully!');
      setResubmitOpen(false);
      // Refresh reports
      const refreshRes = await fetch('/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const refreshData = await refreshRes.json();
      if (refreshData.success) setReports(refreshData.data);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setResubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-64" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40" />
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
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            My Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage your internship progress reports.
          </p>
        </div>
        <Button onClick={() => {
          if (onSubmitNew) {
            onSubmitNew();
          } else {
            navigate('student-reports');
          }
        }}>
          <FileText className="h-4 w-4 mr-2" />
          Submit New Report
        </Button>
      </motion.div>

      {/* Filter by application */}
      {uniqueApplications.length > 1 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Filter by:
            </span>
            <Select value={filterAppId} onValueChange={setFilterAppId}>
              <SelectTrigger className="w-64 h-9 text-sm">
                <SelectValue placeholder="All applications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                {uniqueApplications.map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.offer?.title ?? 'Untitled'} —{' '}
                    {app.offer?.company?.companyName ?? 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No reports yet"
          description="Submit your first weekly report to track your progress."
          actionLabel="Submit Report"
          onAction={() => {
            if (onSubmitNew) {
              onSubmitNew();
            } else {
              navigate('student-reports');
            }
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report, i) => {
            const isExpanded = expandedId === report.id;
            const needsRevision = report.status === 'REVISION_NEEDED';

            return (
              <motion.div key={report.id} variants={itemVariants}>
                <Card
                  className={
                    needsRevision
                      ? 'border-orange-500/50'
                      : ''
                  }
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base">
                            Week {report.weekNumber}
                          </h3>
                          <StatusBadge status={report.status} size="sm" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {report.application?.offer?.title ?? 'Untitled'} —{' '}
                          {report.application?.offer?.company?.companyName ?? 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {/* Activities Summary */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {report.activities}
                    </p>

                    {/* Submitted date */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Submitted {format(new Date(report.submittedAt), 'MMM d, yyyy')}
                      </span>
                      {report.validatedAt && (
                        <span className="ml-2">
                          Validated {format(new Date(report.validatedAt), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>

                    {/* Revision needed: show supervisor comment */}
                    {needsRevision && report.supervisorComment && (
                      <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5 text-orange-600" />
                          <span className="text-xs font-medium text-orange-700 dark:text-orange-400">
                            Supervisor Comment
                          </span>
                        </div>
                        <p className="text-sm text-orange-700 dark:text-orange-400">
                          {report.supervisorComment}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() =>
                          setExpandedId((prev) =>
                            prev === report.id ? null : report.id
                          )
                        }
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            Details
                          </>
                        )}
                      </Button>
                      {needsRevision && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 border-orange-500/50 text-orange-700 hover:bg-orange-500/10"
                          onClick={() => handleOpenResubmit(report)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Resubmit
                        </Button>
                      )}
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-3 pt-2"
                        >
                          <Separator />
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">
                              Activities
                            </p>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {report.activities}
                            </p>
                          </div>
                          {report.challenges && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">
                                Challenges
                              </p>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {report.challenges}
                              </p>
                            </div>
                          )}
                          {report.nextPlan && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">
                                Next Plan
                              </p>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {report.nextPlan}
                              </p>
                            </div>
                          )}
                          {report.fileName && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <FileText className="h-3.5 w-3.5" />
                              <span>{report.fileName}</span>
                            </div>
                          )}
                          {report.supervisor && (
                            <div className="text-xs text-muted-foreground">
                              Reviewed by: {report.supervisor.user?.name ?? 'Supervisor'}
                              {report.supervisor.department &&
                                ` (${report.supervisor.department})`}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Resubmit Dialog */}
      <Dialog open={resubmitOpen} onOpenChange={setResubmitOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Resubmit Report — Week {resubmitReport?.weekNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {resubmitReport?.supervisorComment && (
              <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 space-y-1">
                <p className="text-xs font-medium text-orange-700 dark:text-orange-400">
                  Supervisor Feedback
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  {resubmitReport.supervisorComment}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="resubmitActivities">
                Activities <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="resubmitActivities"
                rows={4}
                value={resubmitActivities}
                onChange={(e) => setResubmitActivities(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resubmitChallenges">Challenges Faced</Label>
              <Textarea
                id="resubmitChallenges"
                rows={3}
                value={resubmitChallenges}
                onChange={(e) => setResubmitChallenges(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resubmitNextPlan">Plan for Next Week</Label>
              <Textarea
                id="resubmitNextPlan"
                rows={3}
                value={resubmitNextPlan}
                onChange={(e) => setResubmitNextPlan(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setResubmitOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleResubmit} disabled={resubmitting}>
                {resubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resubmitting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resubmit
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
