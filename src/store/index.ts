'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, PageView, Notification } from '@/types';

// ─── AUTH STORE ────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  plan: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setPlan: (plan: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      plan: null,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false, plan: null }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setPlan: (plan) => set({ plan }),
    }),
    {
      name: 'internlink-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        plan: state.plan,
      }),
    }
  )
);

// ─── NAVIGATION STORE ─────────────────────────────────────

interface NavState {
  currentPage: PageView;
  selectedOfferId: string | null;
  selectedApplicationId: string | null;
  sidebarOpen: boolean;
  navigate: (page: PageView, options?: { offerId?: string; applicationId?: string }) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useNavStore = create<NavState>()((set) => ({
  currentPage: 'landing',
  selectedOfferId: null,
  selectedApplicationId: null,
  sidebarOpen: false,
  navigate: (page, options = {}) =>
    set({
      currentPage: page,
      selectedOfferId: options.offerId ?? null,
      selectedApplicationId: options.applicationId ?? null,
      sidebarOpen: false,
    }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

// ─── NOTIFICATIONS STORE ──────────────────────────────────

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (ids: string[]) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.read ? 0 : 1),
    })),
  markAsRead: (ids) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        ids.includes(n.id) ? { ...n, read: true } : n
      ),
      unreadCount: state.notifications.filter(
        (n) => !n.read && !ids.includes(n.id)
      ).length,
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));

// ─── THEME STORE ──────────────────────────────────────────

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
          }
          return { theme: newTheme };
        }),
      setTheme: (theme) => {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
        set({ theme });
      },
    }),
    {
      name: 'internlink-theme',
    }
  )
);

// ─── LANGUAGE STORE ───────────────────────────────────────

export type Language = 'en' | 'fr';

interface LangState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'fr' : 'en' })),
    }),
    {
      name: 'internlink-lang',
    }
  )
);

