'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, Building2, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore, useNavStore } from '@/store';
import { toast } from 'sonner';
import type { UserRole, PageView } from '@/types';

const testAccounts = [
  { label: 'Student', email: 'student@test.com', password: 'student123', icon: GraduationCap },
  { label: 'Company', email: 'company@test.com', password: 'company123', icon: Building2 },
  { label: 'Admin', email: 'admin@internlink.cm', password: 'admin123', icon: ShieldCheck },
];

const roleDashboards: Record<UserRole, PageView> = {
  STUDENT: 'student-dashboard',
  COMPANY: 'company-dashboard',
  SUPERVISOR: 'supervisor-dashboard',
  ADMIN: 'admin-dashboard',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavStore((s) => s.navigate);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || 'Login failed');
        return;
      }

      const { user, token } = data.data;
      login(user, token);

      const dashboard = roleDashboards[user.role as UserRole] || 'landing';
      toast.success(`Welcome back, ${user.name}!`);
      navigate(dashboard);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side – Branding & illustration */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-1/2 relative bg-primary text-primary-foreground overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="max-w-md text-center space-y-6"
          >
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-14 w-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold tracking-tight">InternLink</h1>
                <p className="text-primary-foreground/70 text-sm">Cameroon</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold leading-tight">
              Bridge the Gap Between Education and Employment
            </h2>
            <p className="text-primary-foreground/80 text-base leading-relaxed">
              Connect with verified companies, find meaningful internships, submit reports, and earn your certificate — all in one place.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 gap-3 text-left pt-4">
              {[
                { icon: '🎯', text: 'Verified internship opportunities' },
                { icon: '📊', text: 'Track your application progress' },
                { icon: '📜', text: 'Earn recognized certificates' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 bg-primary-foreground/10 rounded-lg px-4 py-2.5">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side – Login form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12"
      >
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">InternLink</h1>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground text-sm">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9 h-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline font-medium"
                  onClick={() => toast.info('Password reset feature coming soon!')}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-9 pr-10 h-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(v) => setRememberMe(v === true)}
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Remember me
              </Label>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <button
              className="text-primary font-medium hover:underline"
              onClick={() => navigate('register')}
            >
              Register
            </button>
          </p>

          {/* Test accounts */}
          <Card className="border-dashed">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium mb-3">
                🧪 Quick test accounts
              </p>
              <div className="space-y-2">
                {testAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleTestLogin(account.email, account.password)}
                    className="flex items-center gap-2.5 w-full text-left p-2 rounded-md hover:bg-muted/80 transition-colors text-sm group"
                  >
                    <account.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="font-medium text-xs">{account.label}:</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {account.email} / {account.password}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
