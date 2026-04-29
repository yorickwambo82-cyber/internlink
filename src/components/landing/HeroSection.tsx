'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavStore } from '@/store';
import { useAuthStore } from '@/store';
import { Search, Building2, Sparkles, ArrowRight } from 'lucide-react';

// Dynamic import of 3D scene with fallback
const HeroScene = dynamic(
  () => import('@/components/three/HeroScene').then((mod) => ({ default: mod.HeroScene })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-transparent to-amber-50 dark:from-emerald-950/30 dark:via-transparent dark:to-amber-950/20" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-amber-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>
    ),
  }
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const stats = [
  { value: '500+', label: 'Students', icon: '🎓' },
  { value: '200+', label: 'Companies', icon: '🏢' },
  { value: '1000+', label: 'Opportunities', icon: '💼' },
];

export default function HeroSection() {
  const navigate = useNavStore((s) => s.navigate);
  const { isAuthenticated, user } = useAuthStore();

  const handleFindInternships = () => {
    if (!isAuthenticated) {
      navigate('login');
      return;
    }
    if (user?.role === 'COMPANY') {
      navigate('company-dashboard');
    } else {
      navigate('student-offers');
    }
  };

  const handlePostOpportunities = () => {
    if (!isAuthenticated) {
      navigate('register');
      return;
    }
    if (user?.role === 'STUDENT') {
      navigate('student-offers');
    } else {
      navigate('company-dashboard');
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-amber/5" />

      {/* 3D Hero Scene */}
      <HeroScene />

      {/* Animated floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large circle - top right */}
        <motion.div
          className="absolute -top-20 -right-20 w-72 h-72 md:w-96 md:h-96 rounded-full bg-primary/5"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Medium circle - bottom left */}
        <motion.div
          className="absolute -bottom-16 -left-16 w-56 h-56 md:w-80 md:h-80 rounded-full bg-amber/5"
          animate={{
            y: [0, 15, 0],
            x: [0, -10, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Small diamond - center right */}
        <motion.div
          className="absolute top-1/3 right-[15%] w-16 h-16 md:w-24 md:h-24 bg-primary/8 rotate-45"
          animate={{
            rotate: [45, 90, 45],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Small triangle - top left */}
        <motion.div
          className="absolute top-[20%] left-[10%] w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[40px] border-b-primary/10"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 15, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Dotted pattern - decorative */}
        <div className="absolute top-[15%] right-[8%] grid grid-cols-4 gap-3 opacity-20">
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/60"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
        {/* Small hexagonal shapes */}
        <motion.div
          className="absolute bottom-[30%] right-[25%] w-12 h-12 border-2 border-primary/10 rotate-45"
          animate={{
            rotate: [45, 135, 45],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* African pattern decorative line */}
        <svg
          className="absolute bottom-[25%] left-0 w-full h-8 opacity-[0.04] text-primary"
          viewBox="0 0 1200 30"
          preserveAspectRatio="none"
        >
          <pattern id="african-pattern" x="0" y="0" width="60" height="30" patternUnits="userSpaceOnUse">
            <path d="M0 15 L15 0 L30 15 L15 30 Z" fill="currentColor" />
            <path d="M30 15 L45 0 L60 15 L45 30 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="1200" height="30" fill="url(#african-pattern)" />
        </svg>
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center">
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 cursor-default"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              InternLink Cameroon — Empowering Youth
            </Badge>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            <span className="gradient-text">Bridge the Gap</span>
            <br />
            <span className="text-foreground">Between Education</span>
            <br />
            <span className="text-foreground">
              and{' '}
              <span className="relative inline-block">
                Employment
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-1.5 bg-amber/40 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.8, ease: 'easeOut' }}
                  style={{ originX: 0 }}
                />
              </span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed"
          >
            InternLink is Cameroon&apos;s premier internship platform connecting students with verified companies. 
            Find opportunities, submit reports, and earn your certificate — all in one place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              size="lg"
              className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group"
              onClick={handleFindInternships}
            >
              <Search className="w-4 h-4 mr-2" />
              Find Internships
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base font-semibold border-2 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 group"
              onClick={handlePostOpportunities}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Post Opportunities
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.7, ease: 'easeOut' }}
      >
        <div className="glass rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + index * 0.15, duration: 0.5 }}
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
