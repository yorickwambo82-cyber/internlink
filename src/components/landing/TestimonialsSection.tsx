'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote, TrendingUp } from 'lucide-react';
import { Marquee } from '@/components/ui/marquee';

const testimonials = [
  {
    name: 'Nkoulou Mbarga Sarah',
    role: 'Computer Science Student',
    university: 'University of Yaoundé I',
    quote: 'InternLink found me a tech internship in Douala within a week. The report system saved me from 3 trips to campus. I got my certificate digitally — first in my class to do it.',
    rating: 5,
    initials: 'NS',
    outcome: 'Landed a full-time role after internship',
  },
  {
    name: 'Tchinda Arnaud',
    role: 'Software Engineering Student',
    university: 'University of Buea',
    quote: "The smart matching is real. I didn't apply to 50 companies — InternLink showed me 6 that fit perfectly. Got 2 interviews, accepted one. WhatsApp notifications made everything seamless.",
    rating: 5,
    initials: 'TA',
    outcome: 'Matched in 4 days, hired in 2 weeks',
  },
  {
    name: 'Fotso Kamga Elise',
    role: 'HR Director',
    university: 'Afritech Solutions SA',
    quote: "We used to spend weeks reviewing CVs. With InternLink, we post once and get pre-screened, motivated candidates. We've hired 8 interns this year and plan to double that.",
    rating: 5,
    initials: 'FE',
    outcome: '8 interns hired through InternLink',
  },
  {
    name: 'Nganou Djibril',
    role: 'Business Administration Student',
    university: 'University of Dschang',
    quote: "My certificate used to require 4 office visits and a 3-week wait. InternLink generated mine the same day my supervisor validated. Game changer doesn't even cover it.",
    rating: 5,
    initials: 'ND',
    outcome: 'Certificate in 24 hours vs. 3 weeks',
  },
  {
    name: 'Ewane Brenda',
    role: 'Accounting Intern',
    university: 'Standard Chartered Cameroon',
    quote: "Creating my profile was quick and the application process was simple. I tracked my status directly on WhatsApp. I already have a contract for next year!",
    rating: 5,
    initials: 'EB',
    outcome: 'Contract signed post-internship',
  },
  {
    name: 'Bello Ousmanou',
    role: 'Telecom Student',
    university: 'National Polytechnic Bamenda',
    quote: "Finding an internship outside of Yaoundé or Douala was hard. This platform connected me to a company in Bafoussam. Validation was completely digital.",
    rating: 5,
    initials: 'BO',
    outcome: 'Found regional opportunity in 5 days',
  },
  {
    name: 'Amadou Halima',
    role: 'HR Assistant',
    university: 'Orange Cameroun',
    quote: "The interface makes tracking student weekly reports incredibly simple. We approved 12 students' completion certificates instantly. Highly recommended!",
    rating: 5,
    initials: 'AH',
    outcome: 'Approved 12 completions digitally',
  },
  {
    name: 'Nguea Samuel',
    role: 'Electrical Student',
    university: 'IUT de Douala',
    quote: "No paper chase, no long lines. My supervisor signed off on my reports from his phone. Got my certificate generated and shared on my LinkedIn in one click.",
    rating: 5,
    initials: 'NS',
    outcome: '0 paper reports, fully digital sign-off',
  },
];

const firstRow = testimonials.slice(0, testimonials.length / 2);
const secondRow = testimonials.slice(testimonials.length / 2);

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-white/10'}`} />
      ))}
    </div>
  );
}

function ReviewCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="w-[360px] sm:w-[420px] shrink-0 px-2">
      <div className="group relative h-full rounded-2xl border border-white/5 bg-white/[0.03] p-8 overflow-hidden transition-all duration-300 hover:border-white/10">
        <div className="inline-flex p-2.5 rounded-xl bg-white/5 border border-white/10 mb-5">
          <Quote className="w-4 h-4 text-white/60" />
        </div>
        <div className="mb-4">
          <StarRating rating={t.rating} />
        </div>
        <blockquote className="text-white/70 leading-relaxed text-sm mb-6 min-h-[72px]">
          &ldquo;{t.quote}&rdquo;
        </blockquote>
        <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-emerald-400 text-xs font-semibold">{t.outcome}</span>
        </div>
        <div className="flex items-center gap-3 pt-5 border-t border-white/5">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
            {t.initials}
          </div>
          <div>
            <div className="text-white font-semibold text-sm">{t.name}</div>
            <div className="text-white/30 text-xs">{t.role} · {t.university}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 bg-[#070f0b] overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(52,211,153,0.5), transparent 70%)' }}
      />
      
      <div className="relative w-full max-w-[100vw] overflow-hidden">
        {/* Section Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/40 text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-6">
              Real Stories
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              People Who Said<br />
              <span className="hero-gradient-text">&ldquo;This Changed Everything&rdquo;</span>
            </h2>
            <p className="max-w-xl mx-auto text-white/40 text-lg">
              Real results from real Cameroonians — students and companies alike.
            </p>
          </motion.div>

          <motion.div
            className="flex justify-center mb-14"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-white font-bold text-lg">4.9</span>
              <span className="text-white/30 text-sm">from 500+ students &amp; companies</span>
            </div>
          </motion.div>
        </div>

        {/* Marquee Rows */}
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden gap-4 py-4">
          <Marquee reverse pauseOnHover className="[--duration:40s]">
            {firstRow.map((t) => (
              <ReviewCard key={t.name} t={t} />
            ))}
          </Marquee>
          <Marquee pauseOnHover className="[--duration:40s]">
            {secondRow.map((t) => (
              <ReviewCard key={t.name} t={t} />
            ))}
          </Marquee>
          
          {/* Side Fades */}
          <div className="from-[#070f0b] pointer-events-none absolute inset-y-0 left-0 w-1/12 bg-gradient-to-r z-10"></div>
          <div className="from-[#070f0b] pointer-events-none absolute inset-y-0 right-0 w-1/12 bg-gradient-to-l z-10"></div>
        </div>
      </div>
    </section>
  );
}
