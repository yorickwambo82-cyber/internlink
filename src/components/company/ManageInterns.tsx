'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  FileText,
  Award,
  GraduationCap,
  BookOpen,
  Calendar,
  Loader2,
  MoreVertical,
  Star,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore, useNavStore } from '@/store';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import type { Application, ReportStatus } from '@/types';
import { format, formatDistanceToNow, addMonths, differenceInDays } from 'date-fns';
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

export default function ManageInterns() {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavStore((s) => s.navigate);

  const [interns, setInterns] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  // Review & Rating State
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewApp, setReviewApp] = useState<Application | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '', didNotShow: false });
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchInterns = useCallback(async () => {
    try {
      const res = await fetch('/api/applications?status=ACCEPTED,IN_PROGRESS', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setInterns(data.data);
    } catch (err) {
      console.error('Failed to fetch interns:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInterns();
  }, [fetchInterns]);

  const handleReviewSubmit = async () => {
    if (!reviewApp || !reviewApp.student) return;
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: reviewApp.studentId,
          applicationId: reviewApp.id,
          rating: reviewData.rating,
          comment: reviewData.comment,
          didNotShow: reviewData.didNotShow,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(reviewData.didNotShow ? 'Marked as Did Not Show' : 'Internship completed with review');
        setInterns((prev) => prev.filter((a) => a.id !== reviewApp.id));
        setReviewOpen(false);
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
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
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Manage Interns
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your active interns and their report progress.
        </p>
      </motion.div>

      {/* Stats summary */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Active</p>
              <p className="text-2xl font-bold">{interns.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">
                {interns.filter((a) => a.status === 'IN_PROGRESS').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Accepted</p>
              <p className="text-2xl font-bold">
                {interns.filter((a) => a.status === 'ACCEPTED').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending Reports</p>
              <p className="text-2xl font-bold">
                {interns.reduce(
                  (sum, a) =>
                    sum + (a.reports?.filter((r) => r.status === 'SUBMITTED').length ?? 0),
                  0
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Interns List */}
      {interns.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={UserCheck}
            title="No active interns"
            description="Accepted or in-progress interns will appear here. Review your applications to accept candidates."
            actionLabel="View Applications"
            onAction={() => navigate('company-applications')}
          />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
          {interns.map((app) => {
            const totalReports = app.reports?.length ?? 0;
            const validatedReports =
              app.reports?.filter((r) => r.status === 'VALIDATED').length ?? 0;
            const submittedReports =
              app.reports?.filter((r) => r.status === 'SUBMITTED').length ?? 0;
            const revisionReports =
              app.reports?.filter((r) => r.status === 'REVISION_NEEDED').length ?? 0;
            const lastReport = app.reports?.[app.reports.length - 1];
            const reportProgress = totalReports > 0 ? (validatedReports / totalReports) * 100 : 0;

            return (
              <motion.div key={app.id} variants={itemVariants}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <CardTitle className="text-base font-semibold">
                          {app.student?.user?.name || 'Unknown Student'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground truncate">
                          {app.offer?.title || 'Unknown Offer'}
                        </p>
                      </div>
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Student info */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {app.student?.university && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {app.student.university}
                        </span>
                      )}
                      {app.student?.fieldOfStudy && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {app.student.fieldOfStudy}
                        </span>
                      )}
                      {app.acceptedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Started {formatDistanceToNow(new Date(app.acceptedAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>

                    {/* Report Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-primary">Report Progress</span>
                        <span className="text-muted-foreground">
                          {validatedReports}/{totalReports} validated
                        </span>
                      </div>
                      <Progress value={reportProgress} className="h-2" />
                      <div className="flex gap-3 text-[10px] text-muted-foreground">
                        <span>{submittedReports} submitted</span>
                        <span>{validatedReports} validated</span>
                        {revisionReports > 0 && (
                          <span className="text-orange-600">{revisionReports} need revision</span>
                        )}
                      </div>
                    </div>

                    {/* Timeline Progress */}
                    {app.expectedStartDate && app.selectedDuration && (
                      <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-primary">Internship Timeline</span>
                          <span className="text-muted-foreground">
                            {app.selectedDuration} Months
                          </span>
                        </div>
                        {(() => {
                          const start = new Date(app.expectedStartDate);
                          const end = addMonths(start, app.selectedDuration);
                          const now = new Date();
                          const totalDays = Math.max(1, differenceInDays(end, start));
                          const daysElapsed = Math.max(0, differenceInDays(now, start));
                          const progress = Math.min(100, (daysElapsed / totalDays) * 100);
                          const daysLeft = Math.max(0, differenceInDays(end, now));

                          return (
                            <>
                              <Progress value={progress} className="h-2 bg-primary/10" />
                              <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>Start: {format(start, 'MMM d, yyyy')}</span>
                                <span className="font-medium text-primary">
                                  {daysLeft > 0 ? `${daysLeft} days remaining` : 'Completed'}
                                </span>
                                <span>End: {format(end, 'MMM d, yyyy')}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {/* Last report status */}
                    {lastReport && (
                      <div className="flex items-center justify-between text-xs bg-muted/50 rounded-md px-3 py-2">
                        <span className="text-muted-foreground">
                          Last report (Week {lastReport.weekNumber})
                        </span>
                        <StatusBadge status={lastReport.status} size="sm" />
                      </div>
                    )}

                    {/* Documents */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {app.cvUrl && (
                        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" asChild>
                          <a href={app.cvUrl} target="_blank" rel="noopener noreferrer">CV</a>
                        </Button>
                      )}
                      {app.schoolAttestationUrl && (
                        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" asChild>
                          <a href={app.schoolAttestationUrl} target="_blank" rel="noopener noreferrer">Attest.</a>
                        </Button>
                      )}
                      {app.motivationLetterUrl && (
                        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" asChild>
                          <a href={app.motivationLetterUrl} target="_blank" rel="noopener noreferrer">Letter</a>
                        </Button>
                      )}
                      {app.transcriptUrl && (
                        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" asChild>
                          <a href={app.transcriptUrl} target="_blank" rel="noopener noreferrer">Trans.</a>
                        </Button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-8 gap-1"
                        onClick={() => navigate('company-reports')}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        View Reports
                      </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="flex-1 text-xs h-8 gap-1 text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                              <Award className="h-3.5 w-3.5" /> Close out
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setReviewApp(app);
                              setReviewData({ rating: 5, comment: '', didNotShow: false });
                              setReviewOpen(true);
                            }}>
                              <Star className="w-4 h-4 mr-2" /> Rate & Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 focus:bg-red-50"
                              onClick={() => {
                                setReviewApp(app);
                                setReviewData({ rating: 1, comment: 'Did not show up.', didNotShow: true });
                                setReviewOpen(true);
                              }}
                            >
                              <AlertTriangle className="w-4 h-4 mr-2" /> Did Not Show Up
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                </Card>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewData.didNotShow ? 'Report No-Show' : 'Review & Complete Internship'}
            </DialogTitle>
            <DialogDescription>
              {reviewData.didNotShow 
                ? 'Mark this intern as Did Not Show. This will impact their profile visibly.'
                : `Rate and leave a comment for ${reviewApp?.student?.user?.name}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!reviewData.didNotShow && (
              <div className="space-y-2">
                <Label>Rating (1-5)</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className={`p-1 rounded-full hover:bg-muted ${reviewData.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Comments</Label>
              <Textarea 
                placeholder={reviewData.didNotShow ? "Briefly explain..." : "How was working with this intern?"}
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)} disabled={submittingReview}>
              Cancel
            </Button>
            <Button 
              onClick={handleReviewSubmit} 
              disabled={submittingReview}
              className={reviewData.didNotShow ? "bg-red-600 hover:bg-red-700" : "bg-teal-600 hover:bg-teal-700"}
            >
              {submittingReview && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {reviewData.didNotShow ? 'Confirm No-Show' : 'Complete Internship'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
