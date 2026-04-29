'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Nkoulou Mbarga Sarah',
    role: 'Computer Science Student',
    university: 'University of Yaoundé I',
    quote:
      'InternLink made finding my internship at a tech company in Douala so easy! The report submission system saved me countless trips to campus.',
    rating: 5,
    initials: 'NS',
  },
  {
    name: 'Tchinda Arnaud',
    role: 'Software Engineering Student',
    university: 'University of Buea',
    quote:
      'I was matched with a startup in Buea through the smart matching feature. The WhatsApp notifications kept me updated on every step of the process.',
    rating: 5,
    initials: 'TA',
  },
  {
    name: 'Fotso Kamga Elise',
    role: 'HR Director',
    university: 'Afritech Solutions SA',
    quote:
      'As a company, InternLink streamlined our intern recruitment. We can now post opportunities and manage applications all in one place. Highly recommended!',
    rating: 5,
    initials: 'FE',
  },
  {
    name: 'Nganou Djibril',
    role: 'Business Administration Student',
    university: 'University of Dschang',
    quote:
      'Getting my certificate was seamless. No more running between offices for signatures. Everything was validated digitally — a game changer for Cameroonian students.',
    rating: 4,
    initials: 'ND',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? 'text-amber fill-amber'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
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
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Trusted by{' '}
            <span className="gradient-text">Students & Companies</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Hear from those who have experienced the InternLink difference across Cameroon.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.name} variants={cardVariants}>
              <Card className="h-full border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300 group">
                <CardContent className="p-6 pt-6">
                  {/* Quote icon */}
                  <Quote className="w-8 h-8 text-primary/15 mb-4" />

                  {/* Quote text */}
                  <p className="text-foreground/90 leading-relaxed mb-6">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  {/* Rating */}
                  <StarRating rating={testimonial.rating} />

                  {/* Author */}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">
                        {testimonial.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role} · {testimonial.university}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
