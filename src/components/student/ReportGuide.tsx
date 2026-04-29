'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Download,
  Lightbulb,
  FileText,
  ListOrdered,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { ReportGuide as ReportGuideType } from '@/types';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const recommendedStructure = [
  'Cover Page',
  'Acknowledgements',
  'Table of Contents',
  'Introduction',
  'Organization Overview',
  'Daily Log / Activities',
  'Tasks & Projects',
  'Challenges Faced',
  'Lessons Learned',
  'Conclusion',
  'Bibliography',
  'Appendices',
];

const tips = [
  {
    title: 'Be Specific',
    description:
      'Include concrete examples of tasks you performed and technologies you used. Generic descriptions make it hard for reviewers.',
    icon: CheckCircle2,
  },
  {
    title: 'Document Weekly',
    description:
      'Write your reports at the end of each week while the details are fresh. Waiting until the end of the internship leads to vague reports.',
    icon: FileText,
  },
  {
    title: 'Include Reflection',
    description:
      'Don\'t just list tasks — reflect on what you learned, how you grew, and what skills you developed.',
    icon: Lightbulb,
  },
  {
    title: 'Follow the Template',
    description:
      'Use the official report template to ensure you cover all required sections and maintain proper formatting.',
    icon: BookOpen,
  },
];

export default function ReportGuide() {
  const [guideSections, setGuideSections] = useState<ReportGuideType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGuide() {
      try {
        const res = await fetch('/api/guide');
        const data = await res.json();
        if (data.success) setGuideSections(data.data);
      } catch (err) {
        console.error('Failed to fetch guide:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGuide();
  }, []);

  const handleDownloadTemplate = () => {
    toast.info('Template download will be available soon!');
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 md:p-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Internship Report Guide
          </h1>
          <p className="text-muted-foreground mt-1">
            Everything you need to write a great internship report.
          </p>
        </div>
        <Button variant="outline" onClick={handleDownloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </motion.div>

      {/* Guide Sections Accordion */}
      {guideSections.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Guide Sections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {guideSections.map((section) => (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="text-sm font-medium hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 font-normal"
                        >
                          {section.order}
                        </Badge>
                        {section.title}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground pl-8"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recommended Structure */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ListOrdered className="h-5 w-5 text-primary" />
              Recommended Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {recommendedStructure.map((section, index) => (
                <li key={section} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{section}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Tips for a Great Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tips.map((tip) => (
                <div
                  key={tip.title}
                  className="rounded-lg border bg-muted/30 p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <tip.icon className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">{tip.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
