'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Pencil,
  XCircle,
  Eye,
  Calendar,
  MapPin,
  Clock,
  Briefcase,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuthStore } from '@/store';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import PlanUpgradeModal from '@/components/shared/PlanUpgradeModal';
import type { Offer, Category, OfferType, RemoteType } from '@/types';
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

interface OfferFormData {
  title: string;
  description: string;
  requirements: string;
  skills: string;
  type: OfferType;
  minDuration: number;
  maxDuration: number;
  startDate: string;
  stipend: string;
  location: string;
  city: string;
  remoteType: RemoteType;
  slots: number;
  deadline: string;
  categoryId: string;
}

const emptyForm: OfferFormData = {
  title: '',
  description: '',
  requirements: '',
  skills: '',
  type: 'INTERNSHIP',
  minDuration: 3,
  maxDuration: 6,
  startDate: '',
  stipend: '',
  location: '',
  city: '',
  remoteType: 'ON_SITE',
  slots: 1,
  deadline: '',
  categoryId: '',
};

export default function ManageOffers() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const authPlan = useAuthStore((s) => s.plan) || 'STARTER';
  const setAuthPlan = useAuthStore((s) => s.setPlan);
  const companyId = user?.companyProfile?.id;

  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState<OfferFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);

  // Plan State
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  const fetchOffers = useCallback(async () => {
    try {
      const res = await fetch(`/api/offers?companyId=${companyId}&limit=100`);
      const data = await res.json();
      if (data.success) setOffers(data.data.offers);
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  const fetchPlan = useCallback(async () => {
    try {
      const res = await fetch('/api/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) setAuthPlan(data.data.plan);
    } catch (err) {
      console.error('Failed to fetch plan:', err);
    }
  }, [token, setAuthPlan]);

  useEffect(() => {
    fetchOffers();
    fetchCategories();
    fetchPlan();
  }, [fetchOffers, fetchCategories, fetchPlan]);

  const PLAN_LIMITS: Record<string, number> = { STARTER: 2, SCHOLAR: 10, PRO: Infinity };

  const openCreateDialog = () => {
    const limit = PLAN_LIMITS[authPlan] ?? 2;
    if (offers.length >= limit) {
      setUpgradeReason(`You have reached your limit of ${limit} offers on the ${authPlan} plan.`);
      setUpgradeModalOpen(true);
      return;
    }

    setEditingOffer(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (offer: Offer) => {
    setEditingOffer(offer);

    let parsedStartDate = offer.startDate || '';
    if (parsedStartDate && !isNaN(new Date(parsedStartDate).getTime())) {
      parsedStartDate = format(new Date(parsedStartDate), 'yyyy-MM-dd');
    }

    let parsedDeadline = '';
    if (offer.deadline && !isNaN(new Date(offer.deadline).getTime())) {
      parsedDeadline = format(new Date(offer.deadline), 'yyyy-MM-dd');
    }

    setFormData({
      title: offer.title,
      description: offer.description,
      requirements: offer.requirements || '',
      skills: offer.skills || '',
      type: offer.type,
      minDuration: offer.minDuration || 3,
      maxDuration: offer.maxDuration || 6,
      startDate: parsedStartDate,
      stipend: offer.stipend || '',
      location: offer.location || '',
      city: offer.city || '',
      remoteType: offer.remoteType,
      slots: offer.slots,
      deadline: parsedDeadline,
      categoryId: offer.categoryId || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        skills: formData.skills,
        startDate: formData.startDate || null,
        deadline: formData.deadline || null,
        categoryId: formData.categoryId || null,
      };

      const url = editingOffer
        ? `/api/offers/${editingOffer.id}`
        : '/api/offers';
      const method = editingOffer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          editingOffer ? 'Offer updated successfully' : 'Offer created successfully'
        );
        setDialogOpen(false);
        fetchOffers();
      } else {
        toast.error(data.error || 'Failed to save offer');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseOffer = async (offerId: string) => {
    setClosingId(offerId);
    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Offer closed successfully');
        setOffers((prev) =>
          prev.map((o) => (o.id === offerId ? { ...o, status: 'CLOSED' as const } : o))
        );
      } else {
        toast.error(data.error || 'Failed to close offer');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setClosingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
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
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manage Offers</h1>
          <p className="text-muted-foreground mt-1">
            Create, edit, and manage your internship offers.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Offer
        </Button>
      </motion.div>

      {/* Offers Grid */}
      {offers.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={Briefcase}
            title="No offers yet"
            description="Create your first internship offer to start receiving applications."
            actionLabel="Create Offer"
            onAction={openCreateDialog}
          />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer, i) => (
            <motion.div key={offer.id} variants={itemVariants}>
              <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold line-clamp-2">
                      {offer.title}
                    </CardTitle>
                    <StatusBadge status={offer.status} size="sm" />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 shrink-0" />
                      <span>{offer.type === 'INTERNSHIP' ? 'Internship' : 'Apprenticeship'}</span>
                    </div>
                    {offer.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{offer.city} &middot; {offer.remoteType === 'ON_SITE' ? 'On-site' : offer.remoteType === 'REMOTE' ? 'Remote' : 'Hybrid'}</span>
                      </div>
                    )}
                    {offer.deadline && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>Deadline: {format(new Date(offer.deadline), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {offer.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {offer._count?.applications ?? 0} applications
                    </span>
                  </div>

                  {offer.skills && (
                    <div className="flex flex-wrap gap-1">
                      {offer.skills.split(',').slice(0, 3).map((skill, si) => (
                        <Badge key={si} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {skill.trim()}
                        </Badge>
                      ))}
                      {offer.skills.split(',').length > 3 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          +{offer.skills.split(',').length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 mt-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs h-8"
                      onClick={() => openEditDialog(offer)}
                      disabled={offer.status === 'CLOSED'}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    {offer.status === 'ACTIVE' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={closingId === offer.id}
                          >
                            {closingId === offer.id ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            Close
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Close Offer</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to close &ldquo;{offer.title}&rdquo;? This action cannot be undone. Students will no longer be able to apply.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCloseOffer(offer.id)}>
                              Close Offer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOffer ? 'Edit Offer' : 'Create New Offer'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Software Engineering Intern"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the internship role..."
                  rows={4}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="What are the requirements for this role?"
                  rows={3}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. React, TypeScript, Node.js"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as OfferType })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                    <SelectItem value="APPRENTICESHIP">Apprenticeship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minDuration">Min Duration (Months) *</Label>
                <Input
                  id="minDuration"
                  type="number"
                  min={3}
                  value={formData.minDuration}
                  onChange={(e) => setFormData({ ...formData, minDuration: Math.max(3, parseInt(e.target.value) || 3) })}
                  placeholder="Minimum 3 months"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDuration">Max Duration (Months) *</Label>
                <Input
                  id="maxDuration"
                  type="number"
                  min={3}
                  value={formData.maxDuration}
                  onChange={(e) => setFormData({ ...formData, maxDuration: Math.max(3, parseInt(e.target.value) || 3) })}
                  placeholder="e.g. 6, 12 months"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="text"
                  placeholder="e.g. 2024-09-01 or Flexible"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stipend">Stipend</Label>
                <Input
                  id="stipend"
                  value={formData.stipend}
                  onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                  placeholder="e.g. $500/month, Unpaid"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Tech Park, Building A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Casablanca"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remoteType">Remote Type</Label>
                <Select
                  value={formData.remoteType}
                  onValueChange={(v) => setFormData({ ...formData, remoteType: v as RemoteType })}
                >
                  <SelectTrigger id="remoteType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ON_SITE">On-site</SelectItem>
                    <SelectItem value="REMOTE">Remote</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slots">Slots</Label>
                <Input
                  id="slots"
                  type="number"
                  min={1}
                  value={formData.slots}
                  onChange={(e) =>
                    setFormData({ ...formData, slots: parseInt(e.target.value) || 1 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingOffer ? 'Update Offer' : 'Create Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PlanUpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentPlan={authPlan}
        reason={upgradeReason}
        onSuccess={(plan) => {
          setAuthPlan(plan);
          setUpgradeModalOpen(false);
          toast.success(`Plan upgraded to ${plan}! You can now create more offers.`);
        }}
      />
    </motion.div>
  );
}
