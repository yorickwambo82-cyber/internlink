'use client';

import { motion } from 'framer-motion';
import { Calendar, FileText, Eye, Send, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import { useAuthStore, useNavStore } from '@/store';
import type { Application, UserRole } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface ApplicationCardProps {
  application: Application;
  delay?: number;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

export default function ApplicationCard({
  application,
  delay = 0,
  onAccept,
  onReject,
}: ApplicationCardProps) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavStore((s) => s.navigate);

  const appliedAgo = formatDistanceToNow(new Date(application.appliedAt), {
    addSuffix: true,
  });

  const coverExcerpt =
    application.coverLetter
      ? application.coverLetter.length > 120
        ? application.coverLetter.slice(0, 120) + '...'
        : application.coverLetter
      : null;

  const role = user?.role as UserRole | undefined;
  const isStudent = role === 'STUDENT';
  const isCompany = role === 'COMPANY';
  const showSubmitReport =
    isStudent &&
    (application.status === 'ACCEPTED' || application.status === 'IN_PROGRESS');
  const showCompanyActions =
    isCompany && application.status === 'PENDING';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <h3 className="font-semibold text-base truncate">
                {application.offer?.title ?? 'Untitled Offer'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {application.offer?.company?.companyName ?? 'Unknown Company'}
              </p>
            </div>
            <StatusBadge status={application.status} size="sm" />
          </div>

          {/* Applied date */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Applied {appliedAgo}</span>
          </div>

          {/* Cover letter excerpt */}
          {coverExcerpt && (
            <div className="flex gap-2 items-start">
              <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {coverExcerpt}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center gap-2 flex-wrap">
          {/* Student actions */}
          {isStudent && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={() =>
                navigate('offer-detail', { offerId: application.offerId })
              }
            >
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
          )}
          {showSubmitReport && (
            <Button
              size="sm"
              variant="default"
              className="text-xs h-7"
              onClick={() =>
                navigate('student-reports')
              }
            >
              <Send className="h-3 w-3 mr-1" />
              Submit Report
            </Button>
          )}

          {/* Company actions */}
          {showCompanyActions && (
            <>
              <Button
                size="sm"
                variant="default"
                className="text-xs h-7"
                onClick={() => onAccept?.(application.id)}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="text-xs h-7"
                onClick={() => onReject?.(application.id)}
              >
                <XCircle className="h-3 w-3 mr-1" />
                Reject
              </Button>
            </>
          )}

          {/* Non-student view details */}
          {!isStudent && !showCompanyActions && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={() =>
                navigate('offer-detail', { offerId: application.offerId })
              }
            >
              <Eye className="h-3 w-3 mr-1" />
              View Offer
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
