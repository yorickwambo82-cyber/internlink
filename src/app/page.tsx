'use client';

import React, { useEffect } from 'react';
import { useNavStore, useAuthStore, useThemeStore, useLangStore } from '@/store';
import { dictionaries } from '@/lib/dictionaries';
import { AppShell } from '@/components/internlink/AppShell';
import LoginPage from '@/components/auth/LoginPage';
import RegisterPage from '@/components/auth/RegisterPage';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import { ScrollVelocityContainer, ScrollVelocityRow } from '@/components/ui/scroll-based-velocity';
import StudentDashboard from '@/components/student/StudentDashboard';
import BrowseOffers from '@/components/student/BrowseOffers';
import OfferDetail from '@/components/student/OfferDetail';
import MyApplications from '@/components/student/MyApplications';
import StudentReportsPage from '@/components/student/StudentReportsPage';
import ReportGuide from '@/components/student/ReportGuide';
import StudentProfile from '@/components/student/StudentProfile';
import { SupervisorDashboard } from '@/components/student/SupervisorDashboard';
import CompanyDashboard from '@/components/company/CompanyDashboard';
import ManageOffers from '@/components/company/ManageOffers';
import ViewApplications from '@/components/company/ViewApplications';
import ManageInterns from '@/components/company/ManageInterns';
import ValidateReports from '@/components/company/ValidateReports';
import CompanyProfile from '@/components/company/CompanyProfile';
import AdminDashboard from '@/components/admin/AdminDashboard';
import ManageUsers from '@/components/admin/ManageUsers';
import ManageCompanies from '@/components/admin/ManageCompanies';
import ManageCategories from '@/components/admin/ManageCategories';
import AuditLogs from '@/components/admin/AuditLogs';
import EditGuide from '@/components/admin/EditGuide';

// Landing page header with nav — dark transparent design
function LandingHeader() {
  const navigate = useNavStore((s) => s.navigate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { language, toggleLanguage } = useLangStore();
  const dict = dictionaries[language].nav;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5" style={{ background: 'rgba(5, 13, 10, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('landing')}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/50 group-hover:shadow-emerald-500/30 transition-shadow">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <span className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">InternLink</span>
        </button>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => { const el = document.getElementById('features'); el?.scrollIntoView({ behavior: 'smooth' }); }}
            className="text-sm font-medium text-white/40 hover:text-white transition-colors duration-200"
          >
            {dict.features}
          </button>
          <button onClick={() => navigate('student-guide')} className="text-sm font-medium text-white/40 hover:text-white transition-colors duration-200">
            {dict.guide}
          </button>
          <button onClick={() => navigate('student-offers')} className="text-sm font-medium text-white/40 hover:text-white transition-colors duration-200">
            {dict.offers}
          </button>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-white/40 hover:text-white hover:border-white/20 transition-all duration-200"
          >
            {language.toUpperCase()}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (user?.role === 'STUDENT') navigate('student-dashboard');
                  else if (user?.role === 'COMPANY') navigate('company-dashboard');
                  else if (user?.role === 'ADMIN') navigate('admin-dashboard');
                  else navigate('supervisor-dashboard');
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold text-[#050d0a] bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all duration-200"
              >
                {dict.dashboard}
              </button>
              <button
                onClick={() => { logout(); navigate('landing'); }}
                className="px-3 py-2 rounded-xl text-sm font-medium text-white/40 hover:text-white border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                {dict.logout}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('login')}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/40 hover:text-white border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                {dict.login}
              </button>
              <button
                onClick={() => navigate('register')}
                className="px-4 py-2 rounded-xl text-sm font-bold text-[#050d0a] bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all duration-200"
              >
                {dict.getStarted}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Render the current page content
function PageContent() {
  const currentPage = useNavStore((s) => s.currentPage);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Auth pages (no shell)
  if (currentPage === 'login') return <LoginPage />;
  if (currentPage === 'register') return <RegisterPage />;

  // Landing page (custom header/footer)
  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen flex flex-col bg-[#050d0a]">
        <LandingHeader />
        <main className="flex-1">
          <HeroSection />
          
          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-10 bg-[#050d0a]">
            <ScrollVelocityContainer className="text-4xl font-black tracking-[-0.02em] md:text-7xl md:leading-[6rem] text-emerald-400/10">
              <ScrollVelocityRow baseVelocity={2} direction={1}>
                FIND YOUR INTERNSHIP • 
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={2} direction={-1}>
                FIND YOUR INTERNSHIP • 
              </ScrollVelocityRow>
            </ScrollVelocityContainer>
            <div className="from-[#050d0a] pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
            <div className="from-[#050d0a] pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
          </div>

          <div id="features">
            <FeaturesSection />
          </div>
          <HowItWorksSection />
          <TestimonialsSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    );
  }

  // All dashboard pages need AppShell
  const renderPage = () => {
    switch (currentPage) {
      // Student pages
      case 'student-dashboard': return <StudentDashboard />;
      case 'student-offers': return <BrowseOffers />;
      case 'offer-detail': return <OfferDetail />;
      case 'student-applications': return <MyApplications />;
      case 'student-reports': return <StudentReportsPage />;
      case 'student-guide': return <ReportGuide />;
      case 'student-profile': return <StudentProfile />;

      // Company pages
      case 'company-dashboard': return <CompanyDashboard />;
      case 'company-offers': return <ManageOffers />;
      case 'company-applications': return <ViewApplications />;
      case 'company-interns': return <ManageInterns />;
      case 'company-reports': return <ValidateReports />;
      case 'company-profile': return <CompanyProfile />;

      // Supervisor pages
      case 'supervisor-dashboard': return <SupervisorDashboard />;
      case 'supervisor-reports': return <SupervisorDashboard />;

      // Admin pages
      case 'admin-dashboard': return <AdminDashboard />;
      case 'admin-users': return <ManageUsers />;
      case 'admin-companies': return <ManageCompanies />;
      case 'admin-categories': return <ManageCategories />;
      case 'admin-audit': return <AuditLogs />;
      case 'admin-guide': return <EditGuide />;

      default: return <StudentDashboard />;
    }
  };

  return <AppShell>{renderPage()}</AppShell>;
}

export default function Home() {
  const { theme } = useThemeStore();

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <PageContent />;
}
