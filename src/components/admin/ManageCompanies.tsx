'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  Eye,
  MapPin,
  Hash,
  Calendar,
  Briefcase,
  ShieldCheck,
  ShieldX,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store';
import EmptyState from '@/components/shared/EmptyState';
import type { CompanyProfile } from '@/types';
import { formatDistanceToNow } from 'date-fns';
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

interface CompanyWithDetails extends CompanyProfile {
  user?: {
    id: string;
    name: string;
    email: string;
    active: boolean;
    verified: boolean;
    createdAt: string;
  };
  _count?: {
    offers: number;
    reviews: number;
    supervisors: number;
  };
}

export default function ManageCompanies() {
  const token = useAuthStore((s) => s.token);

  const [companies, setCompanies] = useState<CompanyWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithDetails | null>(null);

  const fetchCompanies = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let statusParam = '';
      if (tab === 'pending') statusParam = '?status=pending';
      else if (tab === 'verified') statusParam = '?status=verified';

      const res = await fetch(`/api/admin/companies${statusParam}`, { headers });
      const data = await res.json();

      if (data.success) {
        setCompanies(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, [token, tab]);

  useEffect(() => {
    setLoading(true);
    fetchCompanies();
  }, [fetchCompanies]);

  const handleCompanyAction = async (
    userId: string,
    action: 'approve' | 'reject'
  ) => {
    setActionLoading(userId);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/companies', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          userId,
          verified: action === 'approve',
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          action === 'approve'
            ? 'Company approved successfully'
            : 'Company rejected'
        );
        fetchCompanies();
      } else {
        toast.error(data.error || 'Failed to update company');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = companies.filter((c) => !c.verified).length;
  const verifiedCount = companies.filter((c) => c.verified).length;

  const renderCompanyCard = (company: CompanyWithDetails, index: number) => (
    <motion.div
      key={company.id}
      variants={itemVariants}
      custom={index}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.05 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate">
                      {company.companyName}
                    </h3>
                    {company.verified && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {company.user?.email || 'No email'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {company.industry && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    <span>{company.industry}</span>
                  </div>
                )}
                {company.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{company.city}</span>
                  </div>
                )}
                {company.registrationNum && (
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    <span>{company.registrationNum}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(company.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              {company._count && (
                <div className="flex gap-3 text-xs">
                  <span className="text-muted-foreground">
                    {company._count.offers} offers
                  </span>
                  <span className="text-muted-foreground">
                    {company._count.supervisors} supervisors
                  </span>
                  <span className="text-muted-foreground">
                    {company._count.reviews} reviews
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1.5 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setSelectedCompany(company)}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>

              {!company.verified && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                        disabled={actionLoading === company.userId}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approve Company</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to approve{' '}
                          <strong>{company.companyName}</strong>? They will be able to create
                          offers and accept applications.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleCompanyAction(company.userId, 'approve')}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Approve
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        disabled={actionLoading === company.userId}
                      >
                        <ShieldX className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject Company</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reject{' '}
                          <strong>{company.companyName}</strong>? The company will be notified of
                          the rejection.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleCompanyAction(company.userId, 'reject')}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Reject
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 md:p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manage Companies</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage company registrations.
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                {companies.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                {pendingCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="verified">
              Verified
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                {verifiedCount}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            ) : companies.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No companies found"
                description={
                  tab === 'pending'
                    ? 'No companies pending approval.'
                    : tab === 'verified'
                      ? 'No verified companies yet.'
                      : 'No companies registered yet.'
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.map((company, index) =>
                  renderCompanyCard(company, index)
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Company Detail Dialog */}
      <Dialog
        open={!!selectedCompany}
        onOpenChange={(open) => !open && setSelectedCompany(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Details
            </DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">
                      {selectedCompany.companyName}
                    </h3>
                    {selectedCompany.verified ? (
                      <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 text-xs">
                        Pending
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedCompany.user?.email}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3 text-sm">
                {selectedCompany.industry && (
                  <div>
                    <p className="text-muted-foreground text-xs">Industry</p>
                    <p className="font-medium">{selectedCompany.industry}</p>
                  </div>
                )}
                {selectedCompany.city && (
                  <div>
                    <p className="text-muted-foreground text-xs">City</p>
                    <p className="font-medium">{selectedCompany.city}</p>
                  </div>
                )}
                {selectedCompany.registrationNum && (
                  <div>
                    <p className="text-muted-foreground text-xs">Registration #</p>
                    <p className="font-medium">{selectedCompany.registrationNum}</p>
                  </div>
                )}
                {selectedCompany.website && (
                  <div>
                    <p className="text-muted-foreground text-xs">Website</p>
                    <a
                      href={selectedCompany.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline truncate block"
                    >
                      {selectedCompany.website}
                    </a>
                  </div>
                )}
              </div>

              {selectedCompany.description && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Description</p>
                  <p className="text-sm">{selectedCompany.description}</p>
                </div>
              )}

              {selectedCompany._count && (
                <div className="flex gap-4 text-sm pt-2 border-t">
                  <div className="text-center">
                    <p className="font-bold">{selectedCompany._count.offers}</p>
                    <p className="text-xs text-muted-foreground">Offers</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{selectedCompany._count.supervisors}</p>
                    <p className="text-xs text-muted-foreground">Supervisors</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{selectedCompany._count.reviews}</p>
                    <p className="text-xs text-muted-foreground">Reviews</p>
                  </div>
                </div>
              )}

              {!selectedCompany.verified && (
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    disabled={actionLoading === selectedCompany.userId}
                    onClick={() =>
                      handleCompanyAction(selectedCompany.userId, 'approve')
                    }
                  >
                    <ShieldCheck className="h-4 w-4 mr-1.5" />
                    Approve
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        disabled={actionLoading === selectedCompany.userId}
                      >
                        <ShieldX className="h-4 w-4 mr-1.5" />
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject Company</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reject{' '}
                          <strong>{selectedCompany.companyName}</strong>?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleCompanyAction(selectedCompany.userId, 'reject')
                          }
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Reject
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
