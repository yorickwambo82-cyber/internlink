'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { UserPlus, Search, FileCheck, ArrowDown } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Your Profile',
    subtitle: '3 minutes to get started',
    description: 'Register as a student or company. Build your profile with your skills, university, field of study, and career goals. It takes less time than brewing coffee.',
    color: 'from-emerald-400 to-teal-500',
    glow: 'rgba(52,211,153,0.3)',
    benefits: ['Free forever for students', 'Instant access', 'Bilingual (FR/EN)'],
  },
  {
    number: '02',
    icon: Search,
    title: 'Find & Apply in 1 Click',
    subtitle: 'Curated, not overwhelming',
    description: 'Browse internships from verified Cameroonian companies matched to your profile. One-click applications — no lengthy forms, no repeated uploads.',
    color: 'from-amber-400 to-orange-500',
    glow: 'rgba(245,158,11,0.3)',
    benefits: ['Smart filtering', 'No double data entry', 'WhatsApp status updates'],
  },
  {
    number: '03',
    icon: FileCheck,
    title: 'Track, Validate & Certify',
    subtitle: 'Your proof of experience',
    description: 'Submit weekly reports, receive supervisor feedback, and track your progress — all digitally. At the end: an official validated certificate, ready to download.',
    color: 'from-blue-400 to-indigo-500',
    glow: 'rgba(99,102,241,0.3)',
    benefits: ['Digital supervisor sign-off', 'Auto-generated certificate', 'Share on LinkedIn'],
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 bg-[#050d0a] overflow-hidden">
      {/* Gradient fade from above */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#070f0b] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#070f0b] to-transparent" />

      {/* Ambient light */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(52,211,153,0.4), transparent)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/40 text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-6">
            How It Works
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            From Zero to{' '}
            <span className="hero-gradient-text">Certified</span>
            <br />in Three Steps
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-white/40">
            We've eliminated every pointless step in the Cameroonian internship process. What used to take weeks now takes days.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical connecting line on desktop */}
          <div className="hidden lg:block absolute left-1/2 top-16 bottom-16 w-px -translate-x-1/2">
            <motion.div
              className="h-full w-full origin-top"
              style={{ background: 'linear-gradient(to bottom, rgba(52,211,153,0.4), rgba(99,102,241,0.4))' }}
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
            />
          </div>

          <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ 
                    opacity: 0, 
                    x: index === 0 ? -60 : index === 2 ? 60 : 0, 
                    y: index === 1 ? 60 : 0 
                  }}
                  animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  <motion.div
                    className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 overflow-hidden h-full"
                    whileHover={{ y: -5, transition: { duration: 0.3 } }}
                  >
                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `radial-gradient(circle at 30% 30%, ${step.glow} 0%, transparent 60%)` }}
                    />

                    {/* Step number — large background */}
                    <div className="absolute top-4 right-6 text-[80px] font-black text-white/[0.03] leading-none select-none pointer-events-none">
                      {step.number}
                    </div>

                    <div className="relative">
                      {/* Icon + step badge */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 transition-colors duration-300 group-hover:border-white/20">
                          <Icon className="w-7 h-7 text-white/60 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <div className="text-xs font-black tracking-widest uppercase text-emerald-500/80">
                            Step {step.number}
                          </div>
                          <div className="text-white/30 text-xs mt-0.5">{step.subtitle}</div>
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-2xl font-black text-white mb-3">{step.title}</h3>
                      <p className="text-white/40 text-sm leading-relaxed mb-6">{step.description}</p>

                      {/* Benefits checklist */}
                      <ul className="space-y-2">
                        {step.benefits.map(b => (
                          <li key={b} className="flex items-center gap-2.5 text-sm text-white/50">
                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.color} flex-shrink-0`} />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>

                  {/* Mobile arrow between steps */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center mt-4">
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.5 + index * 0.2 }}
                      >
                        <ArrowDown className="w-5 h-5 text-emerald-500/40" />
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
