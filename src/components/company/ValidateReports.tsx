'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileCheck,
  CheckCircle2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Loader2,
  Filter,
  User,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import type { Report, ReportStatus } from '@/types';
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

export default function ValidateReports() {
  const token = useAuthStore((s) => s.token);

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterInternId, setFilterInternId] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | ReportStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [validating, setValidating] = useState<string | null>(null);

  // Revision dialog state
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [revisionTargetId, setRevisionTargetId] = useState<string | null>(null);
  const [revisionComment, setRevisionComment] = useState('');

  const fetchReports = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);

      const res = await fetch(`/api/reports?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setReports(data.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const filteredReports = reports.filter((report) => {
    if (filterInternId === 'all') return true;
    return report.application?.student?.id === filterInternId;
  });

  const uniqueInterns = Array.from(
    new Map(
      reports
        .filter((r) => r.application?.student)
        .map((r) => [r.application!.student!.id, r.application!.student])
    ).values()
  );

  const handleValidate = async (reportId: string, status: ReportStatus, comment?: string) => {
    setValidating(reportId);
    try {
      const body: { status: ReportStatus; supervisorComment?: string } = { status };
      if (comment) body.supervisorComment = comment;

      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          status === 'VALIDATED'
            ? 'Report validated successfully'
            : 'Revision requested'
        );
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status, supervisorComment: comment } : r))
        );
      } else {
        toast.error(data.error || 'Failed to update report');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setValidating(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
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
          Validate Reports
        </h1>
        <p className="text-muted-foreground mt-1">
          Review intern reports, validate or request revisions.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-64">
          <Select value={filterInternId} onValueChange={setFilterInternId}>
            <SelectTrigger>
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by intern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Interns</SelectItem>
              {uniqueInterns.map((intern) => (
                <SelectItem key={intern!.id} value={intern!.id}>
                  {intern!.user?.name || 'Unknown'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as 'all' | ReportStatus)}
          >
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="VALIDATED">Validated</SelectItem>
              <SelectItem value="REVISION_NEEDED">Revision Needed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={FileCheck}
            title="No reports to validate"
            description="Reports submitted by interns will appear here for your review."
          />
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report, i) => {
            const isExpanded = expandedId === report.id;
            const isValidating = validating === report.id;

            return (
              <motion.div key={report.id} variants={itemVariants}>
                <Card className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base">
                            {report.application?.student?.user?.name || 'Unknown Intern'}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            Week {report.weekNumber}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {report.application?.offer?.title || 'Unknown Offer'}
                        </p>
                      </div>
                      <StatusBadge status={report.status} size="sm" />
                    </div>

                    {/* Date & file indicator */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Submitted {formatDistanceToNow(new Date(report.submittedAt), { addSuffix: true })}
                      </span>
                      {report.fileName && (
                        <span className="flex items-center gap-1">
                          <Paperclip className="h-3 w-3" />
                          {report.fileName}
                        </span>
                      )}
                    </div>

                    {/* Activities summary */}
                    {!isExpanded && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {report.activities}
                      </p>
                    )}

                    {/* Actions for submitted reports */}
                    {report.status === 'SUBMITTED' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          disabled={isValidating}
                          onClick={() => handleValidate(report.id, 'VALIDATED')}
                        >
                          {isValidating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          Validate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          disabled={isValidating}
                          onClick={() => {
                            setRevisionTargetId(report.id);
                            setRevisionComment(report.supervisorComment || '');
                            setRevisionDialogOpen(true);
                          }}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Request Revision
                        </Button>
                      </div>
                    )}

                    {/* Show supervisor comment for revision needed */}
                    {report.status === 'REVISION_NEEDED' && report.supervisorComment && (
                      <div className="text-xs bg-orange-50 dark:bg-orange-950/20 rounded-md px-3 py-2 border border-orange-200 dark:border-orange-800">
                        <span className="font-medium text-orange-700 dark:text-orange-400">Feedback: </span>
                        <span className="text-orange-600 dark:text-orange-300">{report.supervisorComment}</span>
                      </div>
                    )}

                    {/* Show validated info */}
                    {report.status === 'VALIDATED' && report.validatedAt && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400">
                        Validated on {format(new Date(report.validatedAt), 'MMM d, yyyy')}
                        {report.supervisorComment && ` — "${report.supervisorComment}"`}
                      </div>
                    )}

                    {/* Expand/collapse toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs h-8"
                      onClick={() => toggleExpand(report.id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Show Details
                        </>
                      )}
                    </Button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 pt-2"
                      >
                        <Separator />

                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Activities</p>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{report.activities}</p>
                        </div>

                        {report.challenges && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Challenges</p>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{report.challenges}</p>
                          </div>
                        )}

                        {report.nextPlan && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Next Plan</p>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{report.nextPlan}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Submitted On</p>
                            <p>{format(new Date(report.submittedAt), 'MMM d, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Week Number</p>
                            <p>{report.weekNumber}</p>
                          </div>
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

      {/* Request Revision Dialog */}
      <Dialog open={revisionDialogOpen} onOpenChange={setRevisionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revision</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Provide feedback for the intern so they can improve their report.
          </p>
          <div className="space-y-2 py-2">
            <Label htmlFor="comment">Comment / Feedback</Label>
            <Textarea
              id="comment"
              value={revisionComment}
              onChange={(e) => setRevisionComment(e.target.value)}
              placeholder="Describe what needs to be revised..."
              rows={4}
            />
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="outline"
              className="bg-orange-600 hover:bg-orange-700 text-white hover:text-white"
              disabled={!revisionComment.trim() || validating === revisionTargetId}
              onClick={() => {
                if (revisionTargetId) {
                  handleValidate(revisionTargetId, 'REVISION_NEEDED', revisionComment);
                  setRevisionDialogOpen(false);
                }
              }}
            >
              {validating === revisionTargetId && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Request Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
