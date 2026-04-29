'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuthStore } from '@/store';
import EmptyState from '@/components/shared/EmptyState';
import type { ReportGuide } from '@/types';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

interface GuideForm {
  title: string;
  content: string;
  order: number;
}

const emptyForm: GuideForm = { title: '', content: '', order: 0 };

export default function EditGuide() {
  const token = useAuthStore((s) => s.token);

  const [guides, setGuides] = useState<ReportGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<ReportGuide | null>(null);
  const [form, setForm] = useState<GuideForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<ReportGuide | null>(null);

  const fetchGuides = useCallback(async () => {
    try {
      // For admin, we need all guides including inactive ones
      // The /api/guide endpoint only returns active=true by default
      // We'll fetch what's available and can extend later
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/guide', { headers });
      const data = await res.json();

      if (data.success) {
        setGuides(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch guide sections:', err);
      toast.error('Failed to load guide sections');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  const openCreateDialog = () => {
    setEditingGuide(null);
    setForm({
      title: '',
      content: '',
      order: guides.length + 1,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (guide: ReportGuide) => {
    setEditingGuide(guide);
    setForm({
      title: guide.title,
      content: guide.content,
      order: guide.order,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.content.trim()) {
      toast.error('Content is required');
      return;
    }

    setActionLoading('form');
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const body: Record<string, unknown> = {
        title: form.title,
        content: form.content,
        order: form.order,
        active: true,
      };

      if (editingGuide) {
        body.id = editingGuide.id;
      }

      const res = await fetch('/api/guide', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          editingGuide
            ? 'Guide section updated successfully'
            : 'Guide section created successfully'
        );
        setDialogOpen(false);
        setForm(emptyForm);
        setEditingGuide(null);
        fetchGuides();
      } else {
        toast.error(data.error || 'Failed to save guide section');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (guide: ReportGuide) => {
    setActionLoading(guide.id);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/guide', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: guide.id,
          active: !guide.active,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(guide.active ? 'Section deactivated' : 'Section activated');
        // Optimistically update local state since the GET endpoint only returns active guides
        setGuides((prev) =>
          prev.map((g) =>
            g.id === guide.id ? { ...g, active: !g.active } : g
          )
        );
      } else {
        toast.error(data.error || 'Failed to update section');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMoveOrder = async (guide: ReportGuide, direction: 'up' | 'down') => {
    const sorted = [...guides].sort((a, b) => a.order - b.order);
    const currentIndex = sorted.findIndex((g) => g.id === guide.id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sorted.length - 1)
    ) {
      return;
    }

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapGuide = sorted[swapIndex];

    // Optimistically update
    setGuides((prev) =>
      prev.map((g) => {
        if (g.id === guide.id) return { ...g, order: swapGuide.order };
        if (g.id === swapGuide.id) return { ...g, order: guide.order };
        return g;
      })
    );

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Update both guides' order
      await Promise.all([
        fetch('/api/guide', {
          method: 'POST',
          headers,
          body: JSON.stringify({ id: guide.id, order: swapGuide.order }),
        }),
        fetch('/api/guide', {
          method: 'POST',
          headers,
          body: JSON.stringify({ id: swapGuide.id, order: guide.order }),
        }),
      ]);
    } catch {
      toast.error('Failed to reorder sections');
      fetchGuides();
    }
  };

  const handleDelete = async (guideId: string) => {
    setActionLoading(guideId);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Use the guide POST endpoint with active: false to deactivate
      // Or we can use a DELETE approach - since there's no dedicated delete,
      // we'll deactivate it
      const res = await fetch('/api/guide', {
        method: 'POST',
        headers,
        body: JSON.stringify({ id: guideId, active: false }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Guide section removed');
        setGuides((prev) => prev.filter((g) => g.id !== guideId));
      } else {
        toast.error(data.error || 'Failed to remove section');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  };

  const sortedGuides = [...guides].sort((a, b) => a.order - b.order);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 md:p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Report Guide Editor
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage the sections students see when writing reports.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Section
        </Button>
      </motion.div>

      {/* Guide Sections */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : sortedGuides.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No guide sections"
          description="Create guide sections to help students write their reports."
          actionLabel="Add Section"
          onAction={openCreateDialog}
        />
      ) : (
        <div className="space-y-4">
          {sortedGuides.map((guide, index) => (
            <motion.div
              key={guide.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`hover:shadow-md transition-shadow ${
                  !guide.active ? 'opacity-60' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Drag handle & order indicator */}
                    <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-5"
                      >
                        #{guide.order}
                      </Badge>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          disabled={index === 0}
                          onClick={() => handleMoveOrder(guide, 'up')}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          disabled={index === sortedGuides.length - 1}
                          onClick={() => handleMoveOrder(guide, 'down')}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base">{guide.title}</h3>
                        {guide.active ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 border-gray-400/30 bg-gray-400/10 text-gray-600"
                          >
                            Inactive
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {guide.content}
                      </p>

                      {guide.templateFileUrl && (
                        <p className="text-xs text-primary hover:underline">
                          📎 {guide.templateFileUrl}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleToggleActive(guide)}
                        disabled={actionLoading === guide.id}
                        title={guide.active ? 'Deactivate' : 'Activate'}
                      >
                        {guide.active ? (
                          <ToggleRight className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openEditDialog(guide)}
                        disabled={actionLoading === guide.id}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog
                        open={deleteTarget?.id === guide.id}
                        onOpenChange={(open) => !open && setDeleteTarget(null)}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            disabled={actionLoading === guide.id}
                            onClick={() => setDeleteTarget(guide)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Section</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the section{' '}
                              <strong>&quot;{guide.title}&quot;</strong>? This action cannot
                              be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(guide.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingGuide ? 'Edit Section' : 'Add New Section'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guide-title">Title *</Label>
              <Input
                id="guide-title"
                placeholder="e.g., Weekly Activities"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guide-content">Content *</Label>
              <Textarea
                id="guide-content"
                placeholder="Describe what students should include in this section..."
                rows={6}
                value={form.content}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, content: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guide-order">Order</Label>
              <Input
                id="guide-order"
                type="number"
                min={1}
                placeholder="Display order (1, 2, 3...)"
                value={form.order}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    order: parseInt(e.target.value) || 0,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first in the guide.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={actionLoading === 'form' || !form.title.trim() || !form.content.trim()}
            >
              {actionLoading === 'form'
                ? 'Saving...'
                : editingGuide
                  ? 'Update Section'
                  : 'Create Section'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
