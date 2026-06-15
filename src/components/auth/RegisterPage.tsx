'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Building2,
  Phone,
  User,
  BookOpen,
  CalendarDays,
  Hash,
  MapPin,
  Briefcase,
  CheckCircle2,
  Home,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore, useNavStore } from '@/store';
import { toast } from 'sonner';
import type { UserRole, PageView } from '@/types';
import { cn } from '@/lib/utils';

const roleDashboards: Record<UserRole, PageView> = {
  STUDENT: 'student-dashboard',
  COMPANY: 'company-dashboard',
  SUPERVISOR: 'supervisor-dashboard',
  ADMIN: 'admin-dashboard',
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function RegisterPage() {
  const [step, setStep] = useState(0); // 0: role, 1: details
  const [direction, setDirection] = useState(1);
  const [role, setRole] = useState<UserRole | ''>('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Fetch categories for field of study dropdown
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCategories(data.data);
      })
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);
  const [showPassword, setShowPassword] = useState(false);

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Student-specific
  const [university, setUniversity] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [year, setYear] = useState('');

  // Company-specific
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [city, setCity] = useState('');

  const { login } = useAuthStore();
  const navigate = useNavStore((s) => s.navigate);

  const handleSelectRole = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setDirection(1);
    setStep(1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(0);
  };

  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const validateForm = (): string | null => {
    if (!name.trim()) return 'Name is required';
    if (!email.trim()) return 'Email is required';
    if (!validateEmail(email)) return 'Please enter a valid email';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';

    if (role === 'STUDENT') {
      if (!university.trim()) return 'University is required';
      if (!fieldOfStudy.trim()) return 'Field of study is required';
    }
    if (role === 'COMPANY') {
      if (!companyName.trim()) return 'Company name is required';
    }

    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, string> = {
        name,
        email,
        password,
        phone,
        role: role as string,
      };

      if (role === 'STUDENT') {
        body.university = university;
        body.fieldOfStudy = fieldOfStudy;
        body.year = year;
      }
      if (role === 'COMPANY') {
        body.companyName = companyName;
        body.industry = industry;
        body.registrationNumber = registrationNumber;
        body.city = city;
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || 'Registration failed');
        return;
      }

      const { user, token } = data.data;
      login(user, token);

      const dashboard = roleDashboards[user.role as UserRole] || 'landing';
      toast.success('Account created successfully! Welcome aboard!');
      navigate(dashboard);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-6">
          {/* Back to Home */}
          <div className="flex justify-start mb-4">
            <button
              onClick={() => navigate('landing')}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.png" alt="InternLink Logo" className="h-10 w-10 object-contain rounded-xl bg-white shadow-sm p-1" />
            <h1 className="text-2xl font-bold">InternLink</h1>
          </div>
          <h2 className="text-xl font-bold">Create your account</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Join Cameroon&apos;s premier internship platform
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              step >= 0 ? 'w-8 bg-primary' : 'w-2 bg-muted'
            )}
          />
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              step >= 1 ? 'w-8 bg-primary' : 'w-2 bg-muted'
            )}
          />
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 ? (
            <motion.div
              key="step-0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="space-y-4">
                <h3 className="text-center font-semibold text-lg">
                  Choose your role
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Student card */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectRole('STUDENT')}
                    className={cn(
                      'group relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all text-left',
                      'hover:border-primary hover:bg-primary/5',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                    )}
                  >
                    <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <GraduationCap className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">Student</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Find internships & submit reports
                      </p>
                    </div>
                    <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>

                  {/* Company card */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectRole('COMPANY')}
                    className={cn(
                      'group relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all text-left',
                      'hover:border-primary hover:bg-primary/5',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                    )}
                  >
                    <div className="h-14 w-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Building2 className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">Company</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Post offers & manage interns
                      </p>
                    </div>
                    <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                </div>

                <p className="text-center text-sm text-muted-foreground pt-2">
                  Already have an account?{' '}
                  <button
                    className="text-primary font-medium hover:underline"
                    onClick={() => navigate('login')}
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <Badge label={role === 'STUDENT' ? 'Student' : 'Company'} />
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Common fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs">
                          Full Name *
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            id="name"
                            placeholder="...."
                            className="pl-9 h-9 text-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="reg-email" className="text-xs">
                          Email *
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            id="reg-email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-9 h-9 text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="reg-password" className="text-xs">
                          Password *
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            id="reg-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min. 6 characters"
                            className="pl-9 pr-9 h-9 text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="confirm-password" className="text-xs">
                          Confirm Password *
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            id="confirm-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Re-enter password"
                            className="pl-9 h-9 text-sm"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+237 6xx xxx xxx"
                          className="pl-9 h-9 text-sm"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Student-specific fields */}
                    {role === 'STUDENT' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <div className="h-px bg-border" />
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Student Details
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="university" className="text-xs">
                              University *
                            </Label>
                            <div className="relative">
                              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                              <Input
                                id="university"
                                placeholder="University of Yaoundé"
                                className="pl-9 h-9 text-sm"
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="field-of-study" className="text-xs">
                              Field of Study *
                            </Label>
                            <div className="relative">
                              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                              <select
                                id="field-of-study"
                                className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring appearance-none cursor-pointer"
                                value={fieldOfStudy}
                                onChange={(e) => setFieldOfStudy(e.target.value)}
                                required
                              >
                                <option value="">Select your field...</option>
                                {categories.map((cat) => (
                                  <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="year" className="text-xs">
                            Year of Study
                          </Label>
                          <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              id="year"
                              placeholder="e.g. 3rd Year"
                              className="pl-9 h-9 text-sm"
                              value={year}
                              onChange={(e) => setYear(e.target.value)}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Company-specific fields */}
                    {role === 'COMPANY' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <div className="h-px bg-border" />
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Company Details
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="company-name" className="text-xs">
                              Company Name *
                            </Label>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                              <Input
                                id="company-name"
                                placeholder="Acme Corp"
                                className="pl-9 h-9 text-sm"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="industry" className="text-xs">
                              Industry
                            </Label>
                            <div className="relative">
                              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                              <Input
                                id="industry"
                                placeholder="Technology"
                                className="pl-9 h-9 text-sm"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="reg-number" className="text-xs">
                              Registration No. (optional)
                            </Label>
                            <div className="relative">
                              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                              <Input
                                id="reg-number"
                                placeholder="RCCM12345"
                                className="pl-9 h-9 text-sm"
                                value={registrationNumber}
                                onChange={(e) => setRegistrationNumber(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="company-city" className="text-xs">
                              City
                            </Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                              <Input
                                id="company-city"
                                placeholder="Douala"
                                className="pl-9 h-9 text-sm"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Submit */}
                    <Button type="submit" className="w-full h-10" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                      className="text-primary font-medium hover:underline"
                      onClick={() => navigate('login')}
                    >
                      Sign in
                    </button>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Simple inline badge for role display in the register form
function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
      {label}
    </span>
  );
}
