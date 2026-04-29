'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavStore } from '@/store';
import { useAuthStore } from '@/store';
import { ArrowRight, Info } from 'lucide-react';

export default function CTASection() {
  const navigate = useNavStore((s) => s.navigate);
  const { isAuthenticated, user } = useAuthStore();

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      navigate('register');
      return;
    }
    if (user?.role === 'COMPANY') {
      navigate('company-dashboard');
    } else {
      navigate('student-offers');
    }
  };

  const handleLearnMore = () => {
    // Scroll to features section smoothly
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80 animate-gradient" />

          {/* Animated border/glow effect */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))',
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-20 text-center">
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Ready to Start Your Journey?
            </motion.h2>
            <motion.p
              className="text-lg text-primary-foreground/80 max-w-xl mx-auto mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              Join thousands of Cameroonian students and companies already using InternLink to connect, grow, and succeed together.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button
                size="lg"
                className="h-12 px-8 text-base font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg group"
                onClick={handleGetStarted}
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base font-semibold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all duration-300"
                onClick={handleLearnMore}
              >
                <Info className="w-4 h-4 mr-2" />
                Learn More
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
