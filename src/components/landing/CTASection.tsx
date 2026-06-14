'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useNavStore, useAuthStore } from '@/store';

type CTAParticle = { id: number; left: string; top: string; width: number; height: number; duration: number; delay: number };

function generateCTAParticles(count: number): CTAParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: Math.random() * 4 + 2,
    height: Math.random() * 4 + 2,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 3,
  }));
}

const perks = [
  'Free for students, always',
  'No credit card required',
  'Setup in under 3 minutes',
  'Verified companies only',
];

export default function CTASection() {
  const navigate = useNavStore((s) => s.navigate);
  const { isAuthenticated, user } = useAuthStore();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  // Client-side only — avoids SSR/CSR hydration mismatch from Math.random()
  const [ctaParticles, setCtaParticles] = useState<CTAParticle[]>([]);
  useEffect(() => {
    setCtaParticles(generateCTAParticles(12));
  }, []);

  const handleGetStarted = () => {
    if (!isAuthenticated) { navigate('register'); return; }
    navigate(user?.role === 'COMPANY' ? 'company-dashboard' : 'student-offers');
  };

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 overflow-hidden bg-[#050d0a]">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative rounded-3xl overflow-hidden"
          initial={{ opacity: 0, x: -60 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* BG image with heavy overlay */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "url('/impossible-bg.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#050d0a]/95 via-emerald-950/80 to-[#050d0a]/95" />
          </div>

          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ border: '1px solid rgba(52,211,153,0.2)' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Spotlight */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(52,211,153,0.15) 0%, transparent 70%)' }}
          />

          {/* Floating particles inside card — client-side only, no SSR */}
          {ctaParticles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-emerald-400/20"
              style={{ left: p.left, top: p.top, width: p.width, height: p.height }}
              animate={{ y: [0, -20, 0], opacity: [0, 0.6, 0] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity }}
            />
          ))}

          {/* Content */}
          <div className="relative z-10 px-8 py-20 sm:px-16 sm:py-24 text-center">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/60 text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
            >
              Start Today. It's Free.
            </motion.div>

            <motion.h2
              className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              Your Career Doesn&apos;t Start<br />
              <span className="hero-gradient-text">After Graduation.</span><br />
              It Starts Now.
            </motion.h2>

            <motion.p
              className="max-w-xl mx-auto text-white/50 text-lg mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.45 }}
            >
              Join thousands of Cameroonian students who stopped waiting for opportunity and started building their future on InternLink.
            </motion.p>

            {/* Perks list */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-4 mb-10"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.55 }}
            >
              {perks.map(perk => (
                <div key={perk} className="flex items-center gap-2 text-white/40 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{perk}</span>
                </div>
              ))}
            </motion.div>

            {/* Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.65 }}
            >
              <motion.button
                onClick={handleGetStarted}
                className="group relative h-14 px-10 rounded-xl text-base font-bold text-[#050d0a] overflow-hidden"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-300 group-hover:from-emerald-300 group-hover:to-teal-300" />
                <span className="relative flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </motion.button>

              <motion.button
                onClick={() => {
                  const el = document.getElementById('features');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="h-14 px-10 rounded-xl text-base font-bold text-white border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                See All Features
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
