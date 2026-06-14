'use client';

import { Crown, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLAN_CONFIG = {
  STARTER: { label: 'Starter', icon: Star, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
  SCHOLAR: { label: 'Scholar', icon: Zap, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
  PRO: { label: 'Pro', icon: Crown, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' },
};

interface PlanBadgeProps {
  plan: string;
  size?: 'sm' | 'md';
}

export default function PlanBadge({ plan, size = 'sm' }: PlanBadgeProps) {
  const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG] ?? PLAN_CONFIG.STARTER;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        config.color,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      )}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {config.label}
    </span>
  );
}
