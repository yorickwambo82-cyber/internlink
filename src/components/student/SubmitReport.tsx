'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Loader2,
  FileText,
  AlertCircle,
  Paperclip,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore, useNavStore } from '@/store';
import EmptyState from '@/components/shared/EmptyState';
import type { Application } from '@/types';
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

interface SubmitReportProps {
  onComplete?: () => void;
}

export default function SubmitReport({ onComplete }: SubmitReportProps = {}) {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavStore((s) => s.navigate);

  const [activeApps, setActiveApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedAppId, setSelectedAppId] = useState('');
  const [weekNumber, setWeekNumber] = useState('');
  const [activities, setActivities] = useState('');
  const [challenges, setChallenges] = useState('');
  const [nextPlan, setNextPlan] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    async function fetchActiveApps() {
      try {
        const res = await fetch('/api/applications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const filtered = data.data.filter(
            (a: Application) =>
              a.status === 'ACCEPTED' || a.status === 'IN_PROGRESS'
          );
          setActiveApps(filtered);
        }
      } catch (err) {
        console.error('Failed to fetch active applications:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchActiveApps();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAppId) {
      toast.error('Please select an application');
      return;
    }
    if (!weekNumber || parseInt(weekNumber) < 1) {
      toast.error('Please enter a valid week number');
      return;
    }
    if (!activities.trim()) {
      toast.error('Activities field is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId: selectedAppId,
          weekNumber: parseInt(weekNumber),
          activities: activities.trim(),
          challenges: challenges.trim() || undefined,
          nextPlan: nextPlan.trim() || undefined,
          fileName: fileName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Failed to submit report');
        return;
      }

      toast.success('Report submitted successfully!');
      // Reset form
      setSelectedAppId('');
      setWeekNumber('');
      setActivities('');
      setChallenges('');
      setNextPlan('');
      setFileName('');
      // Go back to reports list
      if (onComplete) {
        onComplete();
      } else {
        navigate('student-reports');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (activeApps.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          icon={FileText}
          title="No active applications"
          description="You can only submit reports for accepted or in-progress internships."
          actionLabel="View Applications"
          onAction={() => navigate('student-applications')}
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 md:p-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Submit Report
        </h1>
        <p className="text-muted-foreground mt-1">
          Submit your weekly internship progress report.
        </p>
      </motion.div>

      {/* Form */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Report</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Application Select */}
              <div className="space-y-2">
                <Label htmlFor="application">
                  Application <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedAppId}
                  onValueChange={setSelectedAppId}
                >
                  <SelectTrigger id="application">
                    <SelectValue placeholder="Select an active application..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeApps.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.offer?.title ?? 'Untitled'} —{' '}
                        {app.offer?.company?.companyName ?? 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Week Number */}
              <div className="space-y-2">
                <Label htmlFor="weekNumber">
                  Week Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="weekNumber"
                  type="number"
                  min="1"
                  max="52"
                  placeholder="e.g. 1"
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(e.target.value)}
                />
              </div>

              <Separator />

              {/* Activities */}
              <div className="space-y-2">
                <Label htmlFor="activities">
                  Activities <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="activities"
                  placeholder="Describe the activities you performed this week..."
                  rows={4}
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Describe in detail what you worked on during the week.
                </p>
              </div>

              {/* Challenges */}
              <div className="space-y-2">
                <Label htmlFor="challenges">Challenges Faced</Label>
                <Textarea
                  id="challenges"
                  placeholder="What challenges did you encounter? (optional)"
                  rows={3}
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                />
              </div>

              {/* Next Plan */}
              <div className="space-y-2">
                <Label htmlFor="nextPlan">Plan for Next Week</Label>
                <Textarea
                  id="nextPlan"
                  placeholder="What do you plan to work on next week? (optional)"
                  rows={3}
                  value={nextPlan}
                  onChange={(e) => setNextPlan(e.target.value)}
                />
              </div>

              {/* File Attachment (display only) */}
              <div className="space-y-2">
                <Label htmlFor="fileAttachment">
                  <Paperclip className="h-3.5 w-3.5 inline mr-1" />
                  File Attachment
                </Label>
                <Input
                  id="fileAttachment"
                  type="file"
                  className="text-sm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFileName(file.name);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Optionally attach a supporting document (PDF, DOCX, etc.).
                </p>
              </div>

              <Separator />

              {/* Info note */}
              <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Your report will be reviewed by your supervisor. If revision is needed,
                  you&apos;ll be notified with comments.
                </p>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (onComplete) {
                      onComplete();
                    } else {
                      navigate('student-dashboard');
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
