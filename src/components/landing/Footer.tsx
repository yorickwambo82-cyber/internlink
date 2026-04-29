'use client';

import { Separator } from '@/components/ui/separator';
import {
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';

const quickLinks = [
  { label: 'About', href: '#' },
  { label: 'For Students', href: '#' },
  { label: 'For Companies', href: '#' },
  { label: 'Contact', href: '#' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Cookie Policy', href: '#' },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/40 border-t border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">IL</span>
              </div>
              <span className="text-xl font-bold">InternLink</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Cameroon&apos;s premier internship platform bridging the gap between education and employment.
            </p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>Yaoundé, Cameroon</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span>hello@internlink.cm</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <span>+237 6XX XXX XXX</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Community */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Community
            </h4>
            <div className="flex gap-3 mb-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Follow us for internship tips, career advice, and new opportunities across Cameroon.
            </p>
          </div>
        </div>

        <Separator className="my-8 bg-border/50" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} InternLink Cameroon. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ in Cameroon 🇨🇲
          </p>
        </div>
      </div>
    </footer>
  );
}
