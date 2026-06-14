'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  MapPin,
  Code,
  Globe,
  Loader2,
  Camera,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store';
import type { User as UserType } from '@/types';
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

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  university: string;
  fieldOfStudy: string;
  year: string;
  bio: string;
  location: string;
  skills: string;
  portfolioUrl: string;
}

export default function StudentProfile() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    email: '',
    phone: '',
    university: '',
    fieldOfStudy: '',
    year: '',
    bio: '',
    location: '',
    skills: '',
    portfolioUrl: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const u: UserType = data.data;
          setForm({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            university: u.studentProfile?.university || '',
            fieldOfStudy: u.studentProfile?.fieldOfStudy || '',
            year: u.studentProfile?.year || '',
            bio: u.studentProfile?.bio || '',
            location: u.studentProfile?.location || '',
            skills: u.studentProfile?.skills || '',
            portfolioUrl: u.studentProfile?.portfolioUrl || '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [token]);

  const updateField = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          university: form.university,
          fieldOfStudy: form.fieldOfStudy,
          year: form.year,
          bio: form.bio,
          location: form.location,
          skills: form.skills,
          portfolioUrl: form.portfolioUrl,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Failed to update profile');
        return;
      }

      // Update auth store with new user data
      updateUser(data.data);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const initials = form.name
    ? form.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    : 'ST';

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-24" />
        <Skeleton className="h-96" />
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
          My Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and preferences.
        </p>
      </motion.div>

      {/* Avatar Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatar} alt={form.name} />
                  <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 rounded-full bg-primary text-primary-foreground p-1.5 shadow-md hover:bg-primary/90 transition-colors"
                  onClick={() => toast.info('Avatar upload coming soon!')}
                >
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{form.name || 'Student'}</h2>
                <p className="text-sm text-muted-foreground">{form.email}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 bg-primary/10 text-primary">
                    <GraduationCap className="h-3 w-3 mr-0.5" />
                    Student
                  </Badge>
                  {form.university && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {form.university}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Form */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-[10px] text-muted-foreground">
                  Email cannot be changed.
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Phone
              </Label>
              <Input
                id="phone"
                placeholder="+237 655022702"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>

            <Separator />

            {/* University & Field */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university" className="flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" />
                  University
                </Label>
                <Input
                  id="university"
                  placeholder="University of Buea"
                  value={form.university}
                  onChange={(e) => updateField('university', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fieldOfStudy" className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  Field of Study
                </Label>
                <Input
                  id="fieldOfStudy"
                  placeholder="Computer Science"
                  value={form.fieldOfStudy}
                  onChange={(e) => updateField('fieldOfStudy', e.target.value)}
                />
              </div>
            </div>

            {/* Year & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year" className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Year
                </Label>
                <Input
                  id="year"
                  placeholder="3rd Year"
                  value={form.year}
                  onChange={(e) => updateField('year', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="Buea, Cameroon"
                  value={form.location}
                  onChange={(e) => updateField('location', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Bio
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself, your interests, and career goals..."
                rows={4}
                value={form.bio}
                onChange={(e) => updateField('bio', e.target.value)}
              />
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label htmlFor="skills" className="flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5" />
                Skills
              </Label>
              <Input
                id="skills"
                placeholder="React, Node.js, Python, Data Analysis (comma-separated)"
                value={form.skills}
                onChange={(e) => updateField('skills', e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">
                Separate multiple skills with commas.
              </p>
              {form.skills && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.skills
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {skill}
                      </Badge>
                    ))}
                </div>
              )}
            </div>

            {/* Portfolio */}
            <div className="space-y-2">
              <Label htmlFor="portfolioUrl" className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Portfolio URL
              </Label>
              <Input
                id="portfolioUrl"
                placeholder="https://your-portfolio.com"
                value={form.portfolioUrl}
                onChange={(e) => updateField('portfolioUrl', e.target.value)}
              />
            </div>

            <Separator />

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
