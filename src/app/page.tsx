'use client';

import React, { useEffect } from 'react';
import { useNavStore, useAuthStore, useThemeStore } from '@/store';
import { AppShell } from '@/components/internlink/AppShell';
import LoginPage from '@/components/auth/LoginPage';
import RegisterPage from '@/components/auth/RegisterPage';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
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

// Landing page header with nav
function LandingHeader() {
  const navigate = useNavStore((s) => s.navigate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b glass">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('landing')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <span className="text-xl font-bold gradient-text">InternLink</span>
        </button>

        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => {
            const el = document.getElementById('features');
            el?.scrollIntoView({ behavior: 'smooth' });
          }} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </button>
          <button onClick={() => navigate('student-guide')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Guide
          </button>
          <button onClick={() => navigate('student-offers')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Offers
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
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
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => { logout(); navigate('landing'); }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('login')}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('register')}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Get Started
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
      <div className="min-h-screen flex flex-col">
        <LandingHeader />
        <main className="flex-1">
          <HeroSection />
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
