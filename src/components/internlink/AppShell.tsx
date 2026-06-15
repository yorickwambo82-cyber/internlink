'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useNavStore, useThemeStore, useLangStore } from '@/store';
import { dictionaries } from '@/lib/dictionaries';
import NotificationBell from '@/components/shared/NotificationBell';
import PlanBadge from '@/components/shared/PlanBadge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GraduationCap,
  Building2,
  LayoutDashboard,
  Search,
  FileText,
  BookOpen,
  Users,
  Briefcase,
  ClipboardList,
  FolderOpen,
  Shield,
  Menu,
  Moon,
  Sun,
  LogOut,
  User,
  ChevronRight,
  Home,
  MessageSquare,
} from 'lucide-react';
import type { PageView } from '@/types';

interface NavItem {
  id: PageView;
  labelKey: keyof typeof dictionaries.en.sidebar;
  icon: React.ComponentType<{ className?: string }>;
}

const studentNavItems: NavItem[] = [
  { id: 'student-dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { id: 'student-offers', labelKey: 'browseOffers', icon: Search },
  { id: 'student-applications', labelKey: 'myApplications', icon: Briefcase },
  { id: 'student-reports', labelKey: 'myReports', icon: FileText },
  { id: 'student-guide', labelKey: 'reportGuide', icon: BookOpen },
  { id: 'student-profile', labelKey: 'profile', icon: User },
];

const companyNavItems: NavItem[] = [
  { id: 'company-dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { id: 'company-offers', labelKey: 'myOffers', icon: Briefcase },
  { id: 'company-applications', labelKey: 'applications', icon: ClipboardList },
  { id: 'company-interns', labelKey: 'interns', icon: Users },
  { id: 'company-reports', labelKey: 'validateReports', icon: FileText },
  { id: 'company-profile', labelKey: 'companyProfile', icon: Building2 },
];

const supervisorNavItems: NavItem[] = [
  { id: 'supervisor-dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { id: 'supervisor-reports', labelKey: 'reviewReports', icon: FileText },
];

const adminNavItems: NavItem[] = [
  { id: 'admin-dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { id: 'admin-users', labelKey: 'users', icon: Users },
  { id: 'admin-companies', labelKey: 'companies', icon: Building2 },
  { id: 'admin-categories', labelKey: 'categories', icon: FolderOpen },
  { id: 'admin-audit', labelKey: 'auditLogs', icon: Shield },
  { id: 'admin-guide', labelKey: 'editGuide', icon: BookOpen },
];

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'STUDENT': return studentNavItems;
    case 'COMPANY': return companyNavItems;
    case 'SUPERVISOR': return supervisorNavItems;
    case 'ADMIN': return adminNavItems;
    default: return studentNavItems;
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case 'STUDENT': return 'Student';
    case 'COMPANY': return 'Company';
    case 'SUPERVISOR': return 'Supervisor';
    case 'ADMIN': return 'Administrator';
    default: return role;
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case 'STUDENT': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'COMPANY': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'SUPERVISOR': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'ADMIN': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default: return '';
  }
}

function SidebarContent({
  user,
  token,
  currentPage,
  navigate,
  language,
}: {
  user: { name?: string; role?: string } | null;
  token?: string;
  currentPage: PageView;
  navigate: (page: PageView) => void;
  language: 'en' | 'fr';
}) {
  const navItems = user ? getNavItems(user.role || '') : [];
  const { plan, setPlan } = useAuthStore();
  const dict = dictionaries[language].sidebar;

  React.useEffect(() => {
    if (!token || !user) return;
    fetch('/api/subscriptions', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (data.success && data.data) setPlan(data.data.plan); })
      .catch(() => {});
  }, [token, user, setPlan]);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white shadow-sm p-1 flex items-center justify-center">
          <img src="/logo.png" alt="InternLink Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h2 className="font-bold text-lg leading-tight">InternLink</h2>
          <p className="text-xs text-muted-foreground">Cameroon</p>
        </div>
      </div>

      <Separator />

      {/* Nav Items */}
      <ScrollArea className="flex-1 py-2">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                whileHover={{ x: isActive ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{dict[item.labelKey]}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </motion.button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* WhatsApp Quick Access */}
      <div className="px-3 py-2">
        <motion.button
          onClick={() => window.open('https://wa.me/237655022702?text=STATUS', '_blank')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <MessageSquare className="w-5 h-5" />
          <span>{dict.support}</span>
        </motion.button>
      </div>

      {/* User Info */}
      <div className="p-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 flex flex-col items-start gap-1">
            <p className="text-sm font-medium truncate w-full">{user?.name}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getRoleColor(user?.role || '')}`}>
                {getRoleLabel(user?.role || '')}
              </Badge>
              {plan && (user?.role === 'STUDENT' || user?.role === 'COMPANY') && (
                <PlanBadge plan={plan} size="sm" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, token, logout } = useAuthStore();
  const { currentPage, navigate, sidebarOpen, setSidebarOpen } = useNavStore();
  const { theme, toggleTheme } = useThemeStore();
  const { language, toggleLanguage } = useLangStore();

  const handleLogout = () => {
    logout();
    navigate('landing');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 border-r bg-card flex-col h-screen sticky top-0">
        <SidebarContent user={user} token={token || undefined} currentPage={currentPage} navigate={navigate} language={language} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent user={user} token={token || undefined} currentPage={currentPage} navigate={navigate} language={language} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Mobile Menu */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Page Title */}
              <div>
                <h1 className="text-lg font-semibold capitalize">
                  {currentPage.replace(/-/g, ' ').replace('student ', '').replace('company ', '').replace('admin ', '').replace('supervisor ', '')}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <Button variant="ghost" size="sm" onClick={toggleLanguage} className="font-medium">
                {language.toUpperCase()}
              </Button>

              {/* Theme Toggle */}
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(
                    user?.role === 'STUDENT' ? 'student-profile' :
                    user?.role === 'COMPANY' ? 'company-profile' :
                    'student-profile'
                  )}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(
                    user?.role === 'STUDENT' ? 'student-dashboard' :
                    user?.role === 'COMPANY' ? 'company-dashboard' :
                    user?.role === 'ADMIN' ? 'admin-dashboard' :
                    'supervisor-dashboard'
                  )}>
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t py-3 px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} InternLink Cameroon. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
