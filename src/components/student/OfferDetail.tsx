'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Wifi,
  Building2,
  Users,
  Tag,
  CheckCircle2,
  Loader2,
  FileText,
  UploadCloud,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuthStore, useNavStore } from '@/store';
import StatusBadge from '@/components/shared/StatusBadge';
import PlanUpgradeModal from '@/components/shared/PlanUpgradeModal';
import type { Offer, Application } from '@/types';
import { format } from 'date-fns';
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

function getRemoteTypeLabel(type: string) {
  switch (type) {
    case 'ON_SITE': return 'On-site';
    case 'REMOTE': return 'Remote';
    case 'HYBRID': return 'Hybrid';
    default: return type;
  }
}

function getOfferTypeLabel(type: string) {
  switch (type) {
    case 'INTERNSHIP': return 'Internship';
    case 'APPRENTICESHIP': return 'Apprenticeship';
    default: return type;
  }
}

function safeFormatDate(value: string | null | undefined, fmt: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return format(date, fmt);
}

export default function OfferDetail() {
  const token = useAuthStore((s) => s.token);
  const authPlan = useAuthStore((s) => s.plan) || 'STARTER';
  const setAuthPlan = useAuthStore((s) => s.setPlan);
  const selectedOfferId = useNavStore((s) => s.selectedOfferId);
  const navigate = useNavStore((s) => s.navigate);

  const [offer, setOffer] = useState<Offer | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Application Form State
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyStep, setApplyStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverLetter, setCoverLetter] = useState('');
  const [expectedStartDate, setExpectedStartDate] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number>(3);
  
  // Files
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [attestationFile, setAttestationFile] = useState<File | null>(null);
  const [motivationFile, setMotivationFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);

  // Plan State
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  // Fetch offer and applications
  useEffect(() => {
    async function fetchData() {
      if (!selectedOfferId) return;
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const [offerRes, appRes, subRes] = await Promise.all([
          fetch(`/api/offers/${selectedOfferId}`),
          fetch('/api/applications', { headers }),
          fetch('/api/subscriptions', { headers }),
        ]);

        const offerData = await offerRes.json();
        const appData = await appRes.json();
        const subData = await subRes.json();

        if (offerData.success) {
          setOffer(offerData.data);
          setSelectedDuration(offerData.data.minDuration || 3);
          
          // Pre-fill expected start date if offer has a valid date string
          if (offerData.data.startDate && !isNaN(new Date(offerData.data.startDate).getTime())) {
            setExpectedStartDate(new Date(offerData.data.startDate).toISOString().split('T')[0]);
          }
        }
        if (appData.success) setApplications(appData.data);
        if (subData.success && subData.data) setAuthPlan(subData.data.plan);
      } catch (err) {
        console.error('Failed to fetch offer detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedOfferId, token, setAuthPlan]);

  const alreadyApplied = applications.some(
    (a) => a.offerId === selectedOfferId
  );

  const handleFileUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) return data.url;
      toast.error(data.error || 'Failed to upload file');
      return null;
    } catch {
      toast.error('File upload failed');
      return null;
    }
  };

  const handleApply = async () => {
    if (!selectedOfferId || !token) return;
    
    // Validate documents
    if (!cvFile || !attestationFile || !motivationFile || !transcriptFile) {
      toast.error('Please upload all required documents.');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    try {
      // 1. Upload all files in parallel for speed
      const uploadFile = async (file: File) => {
        const url = await handleFileUpload(file);
        setUploadProgress((prev) => prev + 1);
        return url;
      };

      const [cvUrl, schoolAttestationUrl, motivationLetterUrl, transcriptUrl] = await Promise.all([
        uploadFile(cvFile),
        uploadFile(attestationFile),
        uploadFile(motivationFile),
        uploadFile(transcriptFile),
      ]);

      if (!cvUrl || !schoolAttestationUrl || !motivationLetterUrl || !transcriptUrl) {
        setSubmitting(false);
        setUploadProgress(0);
        return; // Stopped because a file failed
      }

      // 2. Submit application
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          offerId: selectedOfferId,
          coverLetter: coverLetter || undefined,
          cvUrl,
          schoolAttestationUrl,
          motivationLetterUrl,
          transcriptUrl,
          expectedStartDate: expectedStartDate || new Date().toISOString().split('T')[0],
          selectedDuration: selectedDuration,
        }),
      });

      const data = await res.json();
      
      if (!data.success) {
        if (data.error === 'PLAN_LIMIT_REACHED') {
          setApplyDialogOpen(false);
          setUpgradeReason('You have reached the maximum number of applications for your current plan.');
          setUpgradeModalOpen(true);
          return;
        }
        toast.error(data.error || 'Failed to apply');
        return;
      }

      toast.success('Application submitted successfully!');
      setApplyDialogOpen(false);
      
      // Reset form
      setCoverLetter('');
      setCvFile(null);
      setAttestationFile(null);
      setMotivationFile(null);
      setTranscriptFile(null);
      setApplyStep(1);

      // Refresh applications
      setApplications((prev) => [...prev, data.data]);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be under 5MB');
        return;
      }
      setter(file);
    }
  };

  const renderFileInput = (
    id: string,
    label: string,
    file: File | null,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm">{label} <span className="text-red-500">*</span></Label>
      {file ? (
        <div className="flex items-center justify-between p-2 border border-emerald-500/30 bg-emerald-500/5 rounded-md">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium truncate">{file.name}</span>
          </div>
          <button type="button" onClick={() => setter(null)} className="p-1 hover:bg-emerald-500/10 rounded-md transition-colors">
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            id={id}
            accept=".pdf,application/pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFileChange(e, setter)}
          />
          <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer">
            <UploadCloud className="w-4 h-4" />
            <span className="text-sm">Click to upload PDF</span>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Offer not found.</p>
          <Button variant="outline" onClick={() => navigate('student-offers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Offers
          </Button>
        </div>
      </div>
    );
  }

  const skills = offer.skills ? offer.skills.split(',').map((s) => s.trim()) : [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto"
    >
      {/* Back button */}
      <motion.div variants={itemVariants}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('student-offers')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Offers
        </Button>
      </motion.div>

      {/* Main Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {offer.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="border-primary/30 bg-primary/10 text-primary"
                  >
                    <Briefcase className="h-3 w-3 mr-1" />
                    {getOfferTypeLabel(offer.type)}
                  </Badge>
                  <StatusBadge status={offer.status} size="sm" />
                  <Badge variant="outline" className="text-xs">
                    <Wifi className="h-3 w-3 mr-1" />
                    {getRemoteTypeLabel(offer.remoteType)}
                  </Badge>
                </div>
              </div>

              {/* Apply Button */}
              {alreadyApplied ? (
                <Button disabled className="shrink-0">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Already Applied
                </Button>
              ) : (
                <Dialog open={applyDialogOpen} onOpenChange={(open) => {
                  setApplyDialogOpen(open);
                  if (!open) setApplyStep(1);
                }}>
                  <DialogTrigger asChild>
                    <Button className="shrink-0">Apply Now</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Apply for {offer.title}</DialogTitle>
                    </DialogHeader>
                    
                    {applyStep === 1 && (
                      <div className="space-y-4 pt-2">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 rounded-md text-sm mb-4">
                          Please provide all required documents in PDF format to proceed with your application.
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {renderFileInput('cv', 'CV / Resume', cvFile, setCvFile)}
                          {renderFileInput('attestation', 'School Attestation', attestationFile, setAttestationFile)}
                          {renderFileInput('motivation', 'Motivation Letter', motivationFile, setMotivationFile)}
                          {renderFileInput('transcript', 'Last Transcript', transcriptFile, setTranscriptFile)}
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                          <Button variant="outline" onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
                          <Button 
                            onClick={() => setApplyStep(2)}
                            disabled={!cvFile || !attestationFile || !motivationFile || !transcriptFile}
                          >
                            Next Step
                          </Button>
                        </div>
                      </div>
                    )}

                    {applyStep === 2 && (
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expectedStartDate">Proposed Start Date *</Label>
                            <Input
                              id="expectedStartDate"
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              value={expectedStartDate}
                              onChange={(e) => setExpectedStartDate(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="selectedDuration">Desired Duration (Months) *</Label>
                            <div className="flex items-center gap-3">
                              <Input
                                id="selectedDuration"
                                type="number"
                                min={offer.minDuration || 3}
                                max={offer.maxDuration || 12}
                                value={selectedDuration}
                                onChange={(e) => setSelectedDuration(parseInt(e.target.value) || 3)}
                              />
                              <span className="text-xs text-muted-foreground shrink-0">
                                Range: {offer.minDuration || 3}-{offer.maxDuration || 12}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="coverLetter">Additional Cover Letter Message</Label>
                          <Textarea
                            id="coverLetter"
                            placeholder="Write a brief message explaining why you're interested in this position..."
                            rows={4}
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Optional. You have already uploaded your formal motivation letter.
                          </p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t mt-4">
                          <Button variant="ghost" onClick={() => setApplyStep(1)}>Back</Button>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleApply} disabled={submitting}>
                              {submitting ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  {uploadProgress < 4
                                    ? `Uploading files (${uploadProgress}/4)...`
                                    : 'Submitting...'}
                                </>
                              ) : (
                                'Submit Application'
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Company Info */}
            {offer.company && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Building2 className="h-5 w-5 shrink-0" />
                <div>
                  <span className="font-medium text-foreground">
                    {offer.company.companyName}
                  </span>
                  {offer.company.verified && (
                    <Badge
                      variant="outline"
                      className="ml-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 text-[10px] px-1.5 py-0"
                    >
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardHeader>

          <Separator />

          <CardContent className="pt-6 space-y-6">
            {/* Key Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {offer.stipend && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Stipend</p>
                    <p className="font-medium text-sm">{offer.stipend}</p>
                  </div>
                </div>
              )}
               {(offer.minDuration || offer.maxDuration) && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration Range</p>
                    <p className="font-medium text-sm">
                      {offer.minDuration === offer.maxDuration 
                        ? `${offer.minDuration} months`
                        : `${offer.minDuration} - ${offer.maxDuration} months`}
                    </p>
                  </div>
                </div>
              )}
              {(offer.city || offer.location) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium text-sm">
                      {offer.city || offer.location}
                    </p>
                  </div>
                </div>
              )}
              {offer.deadline && safeFormatDate(offer.deadline, 'MMM d, yyyy') && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Deadline</p>
                    <p className="font-medium text-sm">
                      {safeFormatDate(offer.deadline, 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )}
              {offer.startDate && safeFormatDate(offer.startDate, 'MMM d, yyyy') && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="font-medium text-sm">
                      {safeFormatDate(offer.startDate, 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Slots</p>
                  <p className="font-medium text-sm">
                    {offer.slots} position{offer.slots > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Category */}
            {offer.category && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Category:</span>
                <Badge variant="secondary" className="text-xs">
                  {offer.category.name}
                </Badge>
              </div>
            )}

            <Separator />

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold text-base">Description</h3>
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: offer.description }}
              />
            </div>

            {/* Requirements */}
            {offer.requirements && (
              <div className="space-y-2">
                <h3 className="font-semibold text-base">Requirements</h3>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: offer.requirements }}
                />
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-base">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Views & Applications */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
              <span>{offer.views} views</span>
              <span>
                {offer._count?.applications ?? 0} application
                {(offer._count?.applications ?? 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <PlanUpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentPlan={authPlan}
        reason={upgradeReason}
        onSuccess={(plan) => {
          setAuthPlan(plan);
          setUpgradeModalOpen(false);
          toast.success(`Plan upgraded to ${plan}! You can now continue your application.`);
        }}
      />
    </motion.div>
  );
}
