'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Upload,
  Globe,
  MapPin,
  FileText,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store';
import type { CompanyProfile as CompanyProfileType } from '@/types';
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

interface ProfileFormData {
  companyName: string;
  industry: string;
  registrationNum: string;
  description: string;
  website: string;
  location: string;
  city: string;
  logoUrl: string;
}

export default function CompanyProfile() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<CompanyProfileType | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    companyName: '',
    industry: '',
    registrationNum: '',
    description: '',
    website: '',
    location: '',
    city: '',
    logoUrl: '',
  });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data.companyProfile) {
        const cp = data.data.companyProfile;
        setProfile(cp);
        setFormData({
          companyName: cp.companyName || '',
          industry: cp.industry || '',
          registrationNum: cp.registrationNum || '',
          description: cp.description || '',
          website: cp.website || '',
          location: cp.location || '',
          city: cp.city || '',
          logoUrl: cp.logoUrl || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!formData.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.companyName,
          companyName: formData.companyName,
          industry: formData.industry,
          registrationNum: formData.registrationNum,
          description: formData.description,
          website: formData.website,
          location: formData.location,
          city: formData.city,
          logoUrl: formData.logoUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Profile updated successfully');
        // Update the auth store with new profile data
        if (data.data) {
          updateUser(data.data);
        }
        setProfile((prev) =>
          prev ? { ...prev, ...formData } : null
        );
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = () => {
    // Placeholder for logo upload functionality
    toast.info('Logo upload feature coming soon');
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-32 rounded-full" />
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-10" />
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
      className="space-y-6 p-4 md:p-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Company Profile
          </h1>
          {profile?.verified && (
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-1">
          Manage your company information and branding.
        </p>
      </motion.div>

      {/* Logo Upload */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="h-24 w-24 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted flex items-center justify-center overflow-hidden">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt={formData.companyName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-10 w-10 text-muted-foreground/50" />
                  )}
                </div>
                <button
                  onClick={handleLogoUpload}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Upload className="h-5 w-5 text-white" />
                </button>
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h3 className="font-semibold text-lg">{formData.companyName || 'Company Name'}</h3>
                {formData.industry && (
                  <p className="text-sm text-muted-foreground">{formData.industry}</p>
                )}
                {formData.city && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center sm:justify-start">
                    <MapPin className="h-3 w-3" />
                    {formData.city}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Form */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  placeholder="Your company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  placeholder="e.g. Technology, Finance, Healthcare"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationNum">Registration Number</Label>
                <Input
                  id="registrationNum"
                  value={formData.registrationNum}
                  onChange={(e) =>
                    setFormData({ ...formData, registrationNum: e.target.value })
                  }
                  placeholder="e.g. RC-123456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Website
                  </span>
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g. Business District, Tower A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="e.g. Casablanca"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Description
                  </span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Tell students about your company, culture, and what makes it a great place to intern..."
                  rows={5}
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => fetchProfile()}
                disabled={saving}
              >
                Reset
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
