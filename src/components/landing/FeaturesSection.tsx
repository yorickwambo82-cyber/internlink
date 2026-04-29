'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Brain,
  FileCheck,
  Award,
  MessageCircle,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Smart Matching',
    description:
      'AI-powered algorithm matches students with internships that fit their skills, field of study, and career goals.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: FileCheck,
    title: 'Report Validation',
    description:
      'Submit your internship reports digitally and get them validated by supervisors — no more paperwork.',
    color: 'text-emerald',
    bg: 'bg-emerald/10',
  },
  {
    icon: Award,
    title: 'Certificate Generation',
    description:
      'Automatically generate completion certificates once your internship is validated. Download and share instantly.',
    color: 'text-amber',
    bg: 'bg-amber/10',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Integration',
    description:
      'Stay updated on new opportunities, application status, and report feedback directly through WhatsApp.',
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    icon: ShieldCheck,
    title: 'Company Verification',
    description:
      'All companies on InternLink are verified and vetted. Apply with confidence knowing your internship is legitimate.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: BookOpen,
    title: 'Career Guidance',
    description:
      'Access internship report guides, templates, and career resources to make the most of your experience.',
    color: 'text-amber',
    bg: 'bg-amber/10',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function FeaturesSection() {
  return (
    <section className="py-20 sm:py-28 relative">
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
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Succeed</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            A complete platform designed for Cameroon&apos;s internship ecosystem — from discovery to certification.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={cardVariants}>
                <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-default">
                  <CardContent className="p-6 pt-6">
                    <div
                      className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
