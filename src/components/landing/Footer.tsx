'use client';

import { motion } from 'framer-motion';
import { Linkedin, Twitter, Facebook, Instagram, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import { useNavStore } from '@/store';

const quickLinks = [
  { label: 'For Students', action: 'student-offers' },
  { label: 'For Companies', action: 'company-dashboard' },
  { label: 'Browse Offers', action: 'student-offers' },
  { label: 'Report Guide', action: 'student-guide' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Cookie Policy', href: '#' },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:bg-blue-600' },
  { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:bg-sky-500' },
  { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:bg-pink-600' },
  { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:bg-blue-700' },
];

export default function Footer() {
  const navigate = useNavStore((s) => s.navigate);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#030907] border-t border-white/5 overflow-hidden">
      {/* Subtle top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px opacity-40"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.6), transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <button onClick={() => navigate('landing')} className="flex items-center gap-3 mb-5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/50">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <span className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">InternLink</span>
            </button>
            <p className="text-sm text-white/30 leading-relaxed mb-6">
              Cameroon&apos;s premier internship platform. Bridging the gap between education and employment since 2024.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-white/30">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Yaoundé, Cameroon</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/30">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>hello@internlink.cm</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/30">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>+237 655 022 702</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Platform</h4>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.action as Parameters<typeof navigate>[0])}
                    className="group flex items-center gap-2 text-sm text-white/30 hover:text-emerald-400 transition-colors duration-200"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-white/30 hover:text-emerald-400 transition-colors duration-200"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Community</h4>
            <div className="flex gap-3 mb-6">
              {socialLinks.map(s => {
                const Icon = s.icon;
                return (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className={`w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white ${s.color} hover:border-transparent transition-all duration-300`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                );
              })}
            </div>
            <p className="text-xs text-white/25 leading-relaxed">
              Follow us for internship tips, career advice, and new opportunities across Cameroon.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">
            &copy; {currentYear} InternLink Cameroon. All rights reserved.
          </p>
      
        </div>
      </div>
    </footer>
  );
}
