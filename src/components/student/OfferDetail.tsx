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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuthStore, useNavStore } from '@/store';
import StatusBadge from '@/components/shared/StatusBadge';
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

export default function OfferDetail() {
  const token = useAuthStore((s) => s.token);
  const selectedOfferId = useNavStore((s) => s.selectedOfferId);
  const navigate = useNavStore((s) => s.navigate);

  const [offer, setOffer] = useState<Offer | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch offer and applications
  useEffect(() => {
    async function fetchData() {
      if (!selectedOfferId) return;
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const [offerRes, appRes] = await Promise.all([
          fetch(`/api/offers/${selectedOfferId}`),
          fetch('/api/applications', { headers }),
        ]);

        const offerData = await offerRes.json();
        const appData = await appRes.json();

        if (offerData.success) setOffer(offerData.data);
        if (appData.success) setApplications(appData.data);
      } catch (err) {
        console.error('Failed to fetch offer detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedOfferId, token]);

  const alreadyApplied = applications.some(
    (a) => a.offerId === selectedOfferId
  );

  const handleApply = async () => {
    if (!selectedOfferId || !token) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          offerId: selectedOfferId,
          coverLetter: coverLetter || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Failed to apply');
        return;
      }

      toast.success('Application submitted successfully!');
      setApplyDialogOpen(false);
      setCoverLetter('');
      // Refresh applications
      setApplications((prev) => [...prev, data.data]);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
                <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="shrink-0">Apply Now</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply for {offer.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="coverLetter">Cover Letter</Label>
                        <Textarea
                          id="coverLetter"
                          placeholder="Write a brief cover letter explaining why you're interested in this position..."
                          rows={6}
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Optional but recommended. Explain your motivation and relevant experience.
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setApplyDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleApply} disabled={submitting}>
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Application'
                          )}
                        </Button>
                      </div>
                    </div>
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
              {offer.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium text-sm">{offer.duration}</p>
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
              {offer.deadline && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Deadline</p>
                    <p className="font-medium text-sm">
                      {format(new Date(offer.deadline), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )}
              {offer.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="font-medium text-sm">
                      {format(new Date(offer.startDate), 'MMM d, yyyy')}
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
    </motion.div>
  );
}
