'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Brain, FileCheck, Award, MessageCircle, ShieldCheck, BookOpen, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Smart Matching',
    tagline: 'Stop searching. Start landing.',
    description: 'Our AI engine reads your skills, field of study, and career goals — then surfaces only the internships where you actually have a shot.',
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'rgba(52,211,153,0.25)',
    border: 'hover:border-emerald-500/40',
    tag: 'AI-Powered',
  },
  {
    icon: FileCheck,
    title: 'Report Validation',
    tagline: 'Zero paperwork. Full credit.',
    description: 'Submit your weekly internship reports digitally. Supervisors validate online. No more running from office to office chasing signatures.',
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'rgba(99,102,241,0.25)',
    border: 'hover:border-blue-500/40',
    tag: 'Paperless',
  },
  {
    icon: Award,
    title: 'Instant Certificate',
    tagline: 'Your proof. Download-ready.',
    description: 'The moment your internship is validated, your official completion certificate is generated and ready to share on LinkedIn or attach to your CV.',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'rgba(245,158,11,0.25)',
    border: 'hover:border-amber-500/40',
    tag: 'Auto-generated',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Integration',
    tagline: 'Updates on the app you already use.',
    description: 'Receive real-time alerts on new offers, application status, and report feedback directly to your WhatsApp — no app download required.',
    gradient: 'from-green-500 to-emerald-600',
    glow: 'rgba(34,197,94,0.25)',
    border: 'hover:border-green-500/40',
    tag: 'Real-time',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Companies Only',
    tagline: 'Apply with 100% confidence.',
    description: 'Every company on InternLink is manually vetted and verified. You will never waste time on ghost listings or fake opportunities again.',
    gradient: 'from-purple-500 to-violet-600',
    glow: 'rgba(168,85,247,0.25)',
    border: 'hover:border-purple-500/40',
    tag: 'Trust & Safety',
  },
  {
    icon: BookOpen,
    title: 'Career Guidance',
    tagline: 'Turn your internship into a career.',
    description: 'Access curated report templates, writing guides, and career resources crafted for Cameroonian students to make every internship count.',
    gradient: 'from-rose-500 to-pink-600',
    glow: 'rgba(244,63,94,0.25)',
    border: 'hover:border-rose-500/40',
    tag: 'Resources',
  },
];

export default function FeaturesSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="features" ref={sectionRef} className="relative py-24 sm:py-32 bg-[#070f0b] overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(52,211,153,1) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Radial gradient spotlight */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(52,211,153,0.4) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/40 text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-6">
            Platform Features
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Everything You Need to{' '}
            <span className="hero-gradient-text">Succeed</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-white/40 leading-relaxed">
            A complete end-to-end platform designed for Cameroon's internship ecosystem — from discovery to your first career opportunity.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className={`group relative h-full rounded-2xl border border-white/5 bg-white/[0.03] p-7 cursor-default overflow-hidden transition-all duration-500 ${feature.border}`}
                  whileHover={{ y: -6, transition: { duration: 0.3 } }}
                  style={{ '--glow-color': feature.glow } as React.CSSProperties}
                >
                  {/* Hover glow background */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${feature.glow} 0%, transparent 60%)` }}
                  />

                  {/* Tag */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 transition-colors duration-300 group-hover:border-white/20">
                      <Icon className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-white/30 border border-white/10 rounded-full px-3 py-1">
                      {feature.tag}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="text-xs font-bold tracking-wider uppercase text-emerald-500/80 mb-2">
                    {feature.tagline}
                  </p>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Bottom arrow */}
                  <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-white/20 group-hover:text-emerald-400 transition-colors duration-300">
                    <span>Learn more</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA teaser */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <p className="text-white/30 text-sm">
            All features are available from day one. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
