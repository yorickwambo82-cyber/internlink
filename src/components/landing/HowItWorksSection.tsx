'use client';

import { motion } from 'framer-motion';
import { UserPlus, Search, FileCheck } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Profile',
    description:
      'Students register and build their profile with skills, university, field of study, and career preferences. Companies set up their organization profile.',
  },
  {
    number: '02',
    icon: Search,
    title: 'Find & Apply',
    description:
      'Browse curated internship opportunities from verified companies across Cameroon. Apply with one click — no lengthy processes.',
  },
  {
    number: '03',
    icon: FileCheck,
    title: 'Track & Validate',
    description:
      'Submit weekly reports, get supervisor feedback, track your progress, and earn your validated completion certificate — all digitally.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function HowItWorksSection() {
  return (
    <section className="py-20 sm:py-28 relative bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold tracking-wider uppercase text-primary mb-3 block">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Three Simple{' '}
            <span className="gradient-text">Steps</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            From registration to certification — we&apos;ve streamlined the entire internship journey.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {/* Connecting line - desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-amber/40 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={stepVariants}
                  className="relative"
                >
                  <div className="text-center">
                    {/* Number circle */}
                    <div className="relative inline-flex mb-6">
                      <div className="w-20 h-20 rounded-2xl bg-background border-2 border-primary/20 shadow-lg shadow-primary/10 flex items-center justify-center group-hover:border-primary/50 transition-colors duration-300 relative z-10">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      {/* Step number badge */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-md">
                        {step.number}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                      {step.description}
                    </p>

                    {/* Arrow for mobile (between items) */}
                    {index < steps.length - 1 && (
                      <div className="md:hidden flex justify-center my-6">
                        <motion.div
                          className="w-6 h-6 text-primary/40"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + index * 0.2 }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 5v14M19 12l-7 7-7-7" />
                          </svg>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
