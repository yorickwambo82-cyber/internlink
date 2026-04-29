'use client';

import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Wifi,
  Building2,
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavStore } from '@/store';
import type { Offer } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

interface OfferCardProps {
  offer: Offer;
  delay?: number;
}

function getRemoteTypeLabel(type: string) {
  switch (type) {
    case 'ON_SITE':
      return 'On-site';
    case 'REMOTE':
      return 'Remote';
    case 'HYBRID':
      return 'Hybrid';
    default:
      return type;
  }
}

function getOfferTypeLabel(type: string) {
  switch (type) {
    case 'INTERNSHIP':
      return 'Internship';
    case 'APPRENTICESHIP':
      return 'Apprenticeship';
    default:
      return type;
  }
}

export default function OfferCard({ offer, delay = 0 }: OfferCardProps) {
  const navigate = useNavStore((s) => s.navigate);

  const skills = offer.skills ? offer.skills.split(',').map((s) => s.trim()) : [];
  const deadlineStr = offer.deadline
    ? formatDistanceToNow(new Date(offer.deadline), { addSuffix: true })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer group">
        <CardContent className="p-4 flex-1 space-y-3">
          {/* Header: Title + Type badges */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
                {offer.title}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] px-1.5 py-0',
                  'border-primary/30 bg-primary/10 text-primary'
                )}
              >
                <Briefcase className="h-3 w-3 mr-0.5" />
                {getOfferTypeLabel(offer.type)}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] px-1.5 py-0',
                  offer.remoteType === 'REMOTE'
                    ? 'border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-400'
                    : offer.remoteType === 'HYBRID'
                    ? 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400'
                    : 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400'
                )}
              >
                <Wifi className="h-3 w-3 mr-0.5" />
                {getRemoteTypeLabel(offer.remoteType)}
              </Badge>
            </div>
          </div>

          {/* Company & Location */}
          <div className="space-y-1.5 text-sm text-muted-foreground">
            {offer.company && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{offer.company.companyName}</span>
              </div>
            )}
            {(offer.city || offer.location) && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{offer.city || offer.location}</span>
              </div>
            )}
          </div>

          {/* Stipend & Duration */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={offer.stipend ? 'font-medium text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}>
                {offer.stipend || 'Unpaid'}
              </span>
            </div>
            {offer.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{offer.duration}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 4).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 font-normal"
                >
                  {skill}
                </Badge>
              ))}
              {skills.length > 4 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                  +{skills.length - 4}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {deadlineStr && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{deadlineStr}</span>
              </div>
            )}
            {(offer._count?.applications ?? 0) > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{offer._count?.applications}</span>
              </div>
            )}
          </div>
          <Button
            size="sm"
            variant="default"
            className="text-xs h-7"
            onClick={(e) => {
              e.stopPropagation();
              navigate('offer-detail', { offerId: offer.id });
            }}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
