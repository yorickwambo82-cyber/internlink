'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Loader2,
  Mail,
  GraduationCap,
  BookOpen,
  Filter,
  Star,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuthStore, useNavStore } from '@/store';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import type { Application, ApplicationStatus, Offer } from '@/types';
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

const TABS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

export default function ViewApplications() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavStore((s) => s.navigate);
  const companyId = user?.companyProfile?.id;

  const [applications, setApplications] = useState<Application[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filterOfferId, setFilterOfferId] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Accept dialog state
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [acceptTargetId, setAcceptTargetId] = useState<string | null>(null);
  const [supervisorName, setSupervisorName] = useState('');

  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);

  // Complete dialog state
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completeTargetId, setCompleteTargetId] = useState<string | null>(null);

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
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [token, companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredApplications = applications.filter((app) => {
    const matchesTab = activeTab === 'all' || app.status === activeTab;
    const matchesOffer = filterOfferId === 'all' || app.offerId === filterOfferId;
    return matchesTab && matchesOffer;
  });

  const handleUpdateStatus = async (
    applicationId: string,
    status: ApplicationStatus
  ) => {
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
            ? 'Application accepted'
            : status === 'REJECTED'
            ? 'Application rejected'
            : 'Internship completed — certificate generated'
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

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const uniqueOffers = Array.from(
    new Map(applications.map((a) => [a.offerId, a.offer])).values()
  ).filter(Boolean);

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-20" />
          ))}
        </div>
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
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Applications
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and manage student applications for your offers.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-64">
          <Select value={filterOfferId} onValueChange={setFilterOfferId}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by offer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Offers</SelectItem>
              {uniqueOffers.map((offer) => (
                <SelectItem key={offer!.id} value={offer!.id}>
                  {offer!.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1">
            {TABS.map((tab) => {
              const count =
                tab.value === 'all'
                  ? filteredApplications.length
                  : applications.filter(
                      (a) =>
                        a.status === tab.value &&
                        (filterOfferId === 'all' || a.offerId === filterOfferId)
                    ).length;
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
                      ? 'Applications from students will appear here.'
                      : `There are no ${tab.label.toLowerCase()} applications at the moment.`
                  }
                />
              ) : (
                <div className="space-y-3">
                  {filteredApplications.map((app) => {
                    const isExpanded = expandedId === app.id;
                    const isActionLoading = actionLoading === app.id;

                    return (
                      <motion.div key={app.id} variants={itemVariants}>
                        <Card className="overflow-hidden">
                          <CardContent className="p-4 space-y-3">
                            {/* Header row */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 min-w-0 flex-1">
                                <h3 className="font-semibold text-base">
                                  {app.student?.user?.name || 'Unknown Student'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {app.offer?.title || 'Unknown Offer'}
                                </p>
                              </div>
                              <StatusBadge status={app.status} size="sm" />
                            </div>

                            {/* Student info row */}
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              {app.student?.user?.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {app.student.user.email}
                                </span>
                              )}
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
                            </div>

                            {/* Student Metrics */}
                            {app.student && (
                              <div className="flex gap-4 text-xs font-medium pt-1">
                                {app.student.reviews && app.student.reviews.length > 0 && (
                                  <span className="flex items-center text-yellow-600">
                                    <Star className="h-3 w-3 mr-1 fill-current" />
                                    {(app.student.reviews.reduce((acc, rev) => acc + rev.rating, 0) / app.student.reviews.length).toFixed(1)} / 5 ({app.student.reviews.length} reviews)
                                  </span>
                                )}
                                {app.student.applications && (
                                  <span className="text-muted-foreground flex items-center">
                                    <Award className="h-3 w-3 mr-1" />
                                    {app.student.applications.filter(a => a.status === 'COMPLETED').length} Internships Completed
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Date & cover letter excerpt */}
                            <div className="text-xs text-muted-foreground">
                              Applied {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
                            </div>

                            {app.coverLetter && !isExpanded && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {app.coverLetter}
                              </p>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {app.status === 'PENDING' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-8 gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    disabled={isActionLoading}
                                    onClick={() => {
                                      setAcceptTargetId(app.id);
                                      setSupervisorName('');
                                      setAcceptDialogOpen(true);
                                    }}
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    disabled={isActionLoading}
                                    onClick={() => {
                                      setRejectTargetId(app.id);
                                      setRejectDialogOpen(true);
                                    }}
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {['ACCEPTED', 'IN_PROGRESS'].includes(app.status) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-8 gap-1 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                                  disabled={isActionLoading}
                                  onClick={() => {
                                    setCompleteTargetId(app.id);
                                    setCompleteDialogOpen(true);
                                  }}
                                >
                                  <Award className="h-3.5 w-3.5" />
                                  Complete
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-8 ml-auto"
                                onClick={() => toggleExpand(app.id)}
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="h-3 w-3 mr-1" />
                                    Less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-3 w-3 mr-1" />
                                    More
                                  </>
                                )}
                              </Button>
                            </div>

                            {/* Expanded details */}
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ duration: 0.2 }}
                                className="space-y-3 pt-2"
                              >
                                <Separator />
                                {app.coverLetter && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Cover Letter
                                    </p>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                      {app.coverLetter}
                                    </p>
                                  </div>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-3 bg-muted/30 p-3 rounded-lg">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">Student Details</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      {app.student?.user?.phone && (
                                        <div className="col-span-2">
                                          <span className="text-muted-foreground block text-xs">Phone</span>
                                          {app.student.user.phone}
                                        </div>
                                      )}
                                      {app.student?.year && (
                                        <div>
                                          <span className="text-muted-foreground block text-xs">Year of Study</span>
                                          {app.student.year}
                                        </div>
                                      )}
                                      {app.student?.location && (
                                        <div>
                                          <span className="text-muted-foreground block text-xs">Location</span>
                                          {app.student.location}
                                        </div>
                                      )}
                                      {app.student?.skills && (
                                        <div className="col-span-2">
                                          <span className="text-muted-foreground block text-xs">Skills</span>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {(() => {
                                              try {
                                                const parsed = JSON.parse(app.student.skills);
                                                return Array.isArray(parsed) ? parsed.map((s, i) => (
                                                  <Badge key={i} variant="secondary" className="text-[10px]">{s}</Badge>
                                                )) : app.student.skills;
                                              } catch {
                                                return app.student.skills;
                                              }
                                            })()}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-3 bg-muted/30 p-3 rounded-lg">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">Postulated Internship</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      {app.offer?.type && (
                                        <div>
                                          <span className="text-muted-foreground block text-xs">Type</span>
                                          {app.offer.type}
                                        </div>
                                      )}
                                      {app.offer?.remoteType && (
                                        <div>
                                          <span className="text-muted-foreground block text-xs">Work Mode</span>
                                          {app.offer.remoteType.replace('_', ' ')}
                                        </div>
                                      )}
                                      {app.offer?.city && (
                                        <div>
                                          <span className="text-muted-foreground block text-xs">City</span>
                                          {app.offer.city}
                                        </div>
                                      )}
                                      {app.offer?.stipend && (
                                        <div>
                                          <span className="text-muted-foreground block text-xs">Stipend</span>
                                          {app.offer.stipend}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
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
                                <div className="space-y-2 pt-2 border-t">
                                  <p className="text-xs font-medium text-muted-foreground">Documents</p>
                                  <div className="flex flex-wrap gap-2">
                                    {app.cvUrl && (
                                      <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                                        <a href={app.cvUrl} target="_blank" rel="noopener noreferrer">
                                          <FileText className="h-3 w-3 mr-1" /> CV
                                        </a>
                                      </Button>
                                    )}
                                    {app.schoolAttestationUrl && (
                                      <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                                        <a href={app.schoolAttestationUrl} target="_blank" rel="noopener noreferrer">
                                          <FileText className="h-3 w-3 mr-1" /> Attestation
                                        </a>
                                      </Button>
                                    )}
                                    {app.motivationLetterUrl && (
                                      <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                                        <a href={app.motivationLetterUrl} target="_blank" rel="noopener noreferrer">
                                          <FileText className="h-3 w-3 mr-1" /> Motivation Letter
                                        </a>
                                      </Button>
                                    )}
                                    {app.transcriptUrl && (
                                      <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                                        <a href={app.transcriptUrl} target="_blank" rel="noopener noreferrer">
                                          <FileText className="h-3 w-3 mr-1" /> Transcript
                                        </a>
                                      </Button>
                                    )}
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
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* Accept Confirmation Dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Application</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to accept this application? The student will be notified.
          </p>
          <div className="space-y-2 py-2">
            <Label htmlFor="supervisor">Assign Supervisor (optional)</Label>
            <Input
              id="supervisor"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              placeholder="Supervisor name"
            />
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (acceptTargetId) {
                  handleUpdateStatus(acceptTargetId, 'ACCEPTED');
                  setAcceptDialogOpen(false);
                }
              }}
            >
              Accept Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this application? The student will be notified. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (rejectTargetId) {
                  handleUpdateStatus(rejectTargetId, 'REJECTED');
                  setRejectDialogOpen(false);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Application
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Confirmation Dialog */}
      <AlertDialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Internship</AlertDialogTitle>
            <AlertDialogDescription>
              Mark this internship as completed? A certificate will be automatically generated for the student. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (completeTargetId) {
                  handleUpdateStatus(completeTargetId, 'COMPLETED');
                  setCompleteDialogOpen(false);
                }
              }}
            >
              Complete Internship
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
