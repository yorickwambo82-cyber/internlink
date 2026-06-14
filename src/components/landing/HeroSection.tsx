'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavStore, useAuthStore, useLangStore } from '@/store';
import { dictionaries } from '@/lib/dictionaries';
import { Search, Building2, ArrowRight, GraduationCap, Briefcase, TrendingUp, CheckCircle, Star, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ParticleData = { id: number; x: number; y: number; size: number; duration: number; delay: number };

function generateParticles(count: number): ParticleData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 6 + 4,
    delay: Math.random() * 4,
  }));
}

const FLOATING_WORDS = ['Verified Companies', 'Digital Certificates', 'Smart Matching', 'WhatsApp Alerts', 'Report System', 'Career Growth'];

function Particle({ x, y, size, duration, delay }: ParticleData) {
  return (
    <motion.div
      className="absolute rounded-full bg-emerald-400/30"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ y: [0, -30, 0], opacity: [0, 0.8, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

const COUNTER_STATS = [
  { value: 500, suffix: '+', label: 'Active Students', icon: GraduationCap },
  { value: 200, suffix: '+', label: 'Verified Companies', icon: Building2 },
  { value: 1000, suffix: '+', label: 'Opportunities', icon: Briefcase },
  { value: 98, suffix: '%', label: 'Success Rate', icon: TrendingUp },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1800;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, value]);

  return <div ref={ref} className="text-3xl sm:text-4xl font-black">{count}{suffix}</div>;
}

export default function HeroSection() {
  const navigate = useNavStore((s) => s.navigate);
  const { isAuthenticated, user } = useAuthStore();
  const { language } = useLangStore();
  const dict = dictionaries[language].hero;
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Particles are generated client-side only to avoid SSR/CSR hydration mismatch
  const [particles, setParticles] = useState<ParticleData[]>([]);
  useEffect(() => {
    setParticles(generateParticles(40));
  }, []);

  const [wordIndex, setWordIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWordIndex(i => (i + 1) % FLOATING_WORDS.length), 2500);
    return () => clearInterval(t);
  }, []);

  const handleFindInternships = () => {
    if (!isAuthenticated) { navigate('login'); return; }
    navigate(user?.role === 'COMPANY' ? 'company-dashboard' : 'student-offers');
  };
  const handlePostOpportunities = () => {
    if (!isAuthenticated) { navigate('register'); return; }
    navigate(user?.role === 'STUDENT' ? 'student-offers' : 'company-dashboard');
  };

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#050d0a]">
      {/* Parallax BG image layer */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: bgY }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/impossible-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(1px)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050d0a]/85 via-[#050d0a]/75 to-[#050d0a]/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/60 via-transparent to-emerald-950/30" />
      </motion.div>

      {/* Animated particle field — client-side only, no SSR */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {particles.map(p => <Particle key={p.id} {...p} />)}
      </div>

      {/* Scanning line effect */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent z-10 pointer-events-none"
        animate={{ top: ['10%', '90%', '10%'] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(52,211,153,1) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)' }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Main content */}
      <motion.div
        className="relative z-20 w-full px-4 sm:px-6 lg:px-8 pt-28 pb-10"
        style={{ y: contentY, opacity }}
      >
        {/* Top badge */}
        <motion.div
          className="flex justify-start mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-emerald-500/30 bg-emerald-950/50 backdrop-blur-sm text-emerald-400 text-sm font-medium">
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <Zap className="w-3.5 h-3.5" />
            {language === 'fr' ? "Cameroun · N°1 Plateforme de Stages" : "Cameroon · #1 Internship Platform"}
          </div>
        </motion.div>

        {/* Main headline */}
        <div className="text-left mb-6">
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="block text-white">{dict.title1}</span>
            <span className="block text-white/80">{dict.title2}</span>
            <span className="block">
              <span className="text-white/80">{dict.title3}</span>
              <span className="relative inline-block">
                <span className="hero-gradient-text">{dict.titleHighlight}</span>
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-amber-400"
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.8, ease: 'easeOut' }}
                />
              </span>
            </span>
          </motion.h1>
        </div>

        {/* Animated rotating benefit */}
        <motion.div
          className="flex justify-start mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-3 text-white/60">
            <CheckCircle className="w-4 h-4 text-white/60 shrink-0" />
            <span className="text-sm">{language === 'fr' ? 'Accès instantané à' : 'Instant access to'}</span>
            <div className="overflow-hidden h-5 relative w-40">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  className="absolute text-sm font-semibold text-emerald-400 whitespace-nowrap"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {FLOATING_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="max-w-2xl text-left text-lg sm:text-xl text-white/50 mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
        >
          {dict.subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-start justify-start gap-4 mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <motion.button
            onClick={handleFindInternships}
            className="group relative h-14 px-8 rounded-xl text-base font-bold text-white overflow-hidden"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300 group-hover:from-emerald-400 group-hover:to-emerald-500" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.1)' }} />
            <span className="relative flex items-center gap-2">
              <Search className="w-4 h-4" />
              {dict.btnFind}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </motion.button>

          <motion.button
            onClick={handlePostOpportunities}
            className="group h-14 px-8 rounded-xl text-base font-bold text-white border border-white/20 backdrop-blur-sm bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all duration-300"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-white/60" />
              {dict.btnPost}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </motion.button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="flex flex-wrap items-center justify-start gap-6 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          {[
            { icon: Star, text: language === 'fr' ? 'Gratuit pour les étudiants' : 'Free for students' },
            { icon: CheckCircle, text: language === 'fr' ? 'Entreprises vérifiées' : 'Verified companies' },
            { icon: Zap, text: language === 'fr' ? 'Certificats numériques' : 'Digital certificates' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-white/40 text-sm">
              <Icon className="w-3.5 h-3.5 text-white/40" />
              <span>{text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative rounded-2xl overflow-hidden border border-white/10 backdrop-blur-xl bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/30 via-transparent to-amber-900/20" />
          <div className="relative grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/10">
            {COUNTER_STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="group p-6 sm:p-8 text-left hover:bg-white/5 transition-colors duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + i * 0.1 }}
                >
                  <div className="mb-3">
                    <Icon className="w-6 h-6 text-white/60 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div className="font-black text-white">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-white/40 mt-1">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-white/20 text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
