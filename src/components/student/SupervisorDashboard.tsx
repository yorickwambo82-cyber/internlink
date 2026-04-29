'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore, useNavStore } from '@/store';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Report, Application } from '@/types';

export function SupervisorDashboard() {
  const { user, token } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [revisionComment, setRevisionComment] = useState('');
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReports(data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'VALIDATED',
          supervisorComment: 'Report approved',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Report validated successfully');
        fetchReports();
      } else {
        toast.error(data.error || 'Failed to validate report');
      }
    } catch (error) {
      toast.error('Failed to validate report');
    }
  };

  const handleRequestRevision = async () => {
    if (!selectedReport || !revisionComment.trim()) {
      toast.error('Please provide feedback for the revision');
      return;
    }
    try {
      const res = await fetch(`/api/reports/${selectedReport.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'REVISION_NEEDED',
          supervisorComment: revisionComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Revision requested');
        setShowRevisionDialog(false);
        setRevisionComment('');
        setSelectedReport(null);
        fetchReports();
      } else {
        toast.error(data.error || 'Failed to request revision');
      }
    } catch (error) {
      toast.error('Failed to request revision');
    }
  };

  const filteredReports = reports.filter(
    (r) => filterStatus === 'ALL' || r.status === filterStatus
  );

  const submittedCount = reports.filter((r) => r.status === 'SUBMITTED').length;
  const validatedCount = reports.filter((r) => r.status === 'VALIDATED').length;
  const revisionCount = reports.filter((r) => r.status === 'REVISION_NEEDED').length;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold">Welcome back, {user?.name} 👋</h2>
        <p className="text-muted-foreground">
          Review and validate intern reports
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Clock}
          label="Pending Review"
          value={submittedCount}
          accentColor="bg-amber-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Validated"
          value={validatedCount}
          accentColor="bg-emerald-500"
        />
        <StatCard
          icon={AlertCircle}
          label="Revision Needed"
          value={revisionCount}
          accentColor="bg-red-500"
        />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Reports</SelectItem>
            <SelectItem value="SUBMITTED">Pending Review</SelectItem>
            <SelectItem value="VALIDATED">Validated</SelectItem>
            <SelectItem value="REVISION_NEEDED">Revision Needed</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline">{filteredReports.length} reports</Badge>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Reports"
          description="No reports match your current filter"
        />
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">
                          Week {report.weekNumber}
                        </h4>
                        <StatusBadge status={report.status} size="sm" />
                        {report.fileName && (
                          <Badge variant="outline" className="text-xs">
                            📎 {report.fileName}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {report.activities}
                      </p>
                      {report.supervisorComment && (
                        <div className="bg-muted p-2 rounded text-sm">
                          <span className="font-medium">Feedback:</span>{' '}
                          {report.supervisorComment}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Submitted {new Date(report.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {report.status === 'SUBMITTED' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleValidate(report.id)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Validate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedReport(report);
                              setShowRevisionDialog(true);
                            }}
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Request Revision
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Revision Dialog */}
      <Dialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revision - Week {selectedReport?.weekNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Provide feedback for the student..."
              value={revisionComment}
              onChange={(e) => setRevisionComment(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowRevisionDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleRequestRevision}>
                Submit Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
