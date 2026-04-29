'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Tag,
  FileText,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import type { Category } from '@/types';
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

interface CategoryForm {
  name: string;
  description: string;
  icon: string;
}

const emptyForm: CategoryForm = { name: '', description: '', icon: '' };

export default function ManageCategories() {
  const token = useAuthStore((s) => s.token);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/categories', { headers });
      const data = await res.json();

      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreateDialog = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setActionLoading('form');
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let res: Response;

      if (editingCategory) {
        // Update
        res = await fetch(`/api/admin/categories?id=${editingCategory.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            name: form.name,
            description: form.description || null,
            icon: form.icon || null,
          }),
        });
      } else {
        // Create
        res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: form.name,
            description: form.description || null,
            icon: form.icon || null,
          }),
        });
      }

      const data = await res.json();
      if (data.success) {
        toast.success(
          editingCategory
            ? 'Category updated successfully'
            : 'Category created successfully'
        );
        setDialogOpen(false);
        setForm(emptyForm);
        setEditingCategory(null);
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to save category');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (categoryId: string) => {
    setActionLoading(categoryId);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/categories?id=${categoryId}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Category deleted successfully');
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to delete category');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  };

  const handleToggleActive = async (category: Category) => {
    setActionLoading(category.id);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/categories?id=${category.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ active: !category.active }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          category.active
            ? 'Category deactivated'
            : 'Category activated'
        );
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to update category');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

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
            Manage Categories
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage offer categories.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Category
        </Button>
      </motion.div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No categories yet"
          description="Create your first category to organize offers."
          actionLabel="Add Category"
          onAction={openCreateDialog}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              custom={index}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`hover:shadow-md transition-shadow ${
                  !category.active ? 'opacity-60' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          {category.icon ? (
                            <span className="text-lg">{category.icon}</span>
                          ) : (
                            <Tag className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm truncate">
                            {category.name}
                          </h3>
                          {!category.active && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 border-gray-400/30 bg-gray-400/10 text-gray-600"
                            >
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>

                      {category.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                      )}

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span>
                          {category._count?.offers ?? 0} offers
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleToggleActive(category)}
                        disabled={actionLoading === category.id}
                        title={category.active ? 'Deactivate' : 'Activate'}
                      >
                        {category.active ? (
                          <ToggleRight className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => openEditDialog(category)}
                        disabled={actionLoading === category.id}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog
                        open={deleteTarget?.id === category.id}
                        onOpenChange={(open) =>
                          !open && setDeleteTarget(null)
                        }
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            disabled={actionLoading === category.id}
                            onClick={() => setDeleteTarget(category)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete{' '}
                              <strong>{category.name}</strong>?
                              {(category._count?.offers ?? 0) > 0 && (
                                <span className="block mt-1 text-amber-600">
                                  This category has {category._count?.offers} associated
                                  offers. Deleting it may affect those offers.
                                </span>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                placeholder="e.g., Software Engineering"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-description">Description</Label>
              <Textarea
                id="cat-description"
                placeholder="Brief description of this category..."
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-icon">Icon (emoji or text)</Label>
              <Input
                id="cat-icon"
                placeholder="e.g., 💻 or code"
                value={form.icon}
                onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={actionLoading === 'form' || !form.name.trim()}
            >
              {actionLoading === 'form' ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
