'use client';

import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  className?: string;
  delay?: number;
  accentColor?: string;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changeType = 'neutral',
  className,
  delay = 0,
  accentColor,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      <Card
        className={cn(
          'relative overflow-hidden group hover:shadow-md transition-shadow',
          className
        )}
      >
        {/* Accent gradient */}
        <div
          className={cn(
            'absolute top-0 left-0 w-1 h-full',
            accentColor ?? 'bg-primary'
          )}
        />
        <CardContent className="p-4 pl-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">{label}</p>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              {change && (
                <p
                  className={cn(
                    'text-xs font-medium',
                    changeType === 'positive' && 'text-emerald-600 dark:text-emerald-400',
                    changeType === 'negative' && 'text-red-600 dark:text-red-400',
                    changeType === 'neutral' && 'text-muted-foreground'
                  )}
                >
                  {changeType === 'positive' && '↑ '}
                  {changeType === 'negative' && '↓ '}
                  {change}
                </p>
              )}
            </div>
            <div
              className={cn(
                'rounded-lg p-2.5 transition-transform group-hover:scale-110',
                accentColor
                  ? 'bg-primary/10'
                  : 'bg-primary/10'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  accentColor ? 'text-primary' : 'text-primary'
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
