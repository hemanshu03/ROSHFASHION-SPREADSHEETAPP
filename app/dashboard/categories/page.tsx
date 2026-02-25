'use client';

import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Edit2, Trash2, Plus, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', slug: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      console.log('[v0] loadCategories - Starting to load categories');
      setLoading(true);
      const data = await getCategories();
      console.log('[v0] loadCategories - Data received:', data);
      setCategories(Array.isArray(data) ? data : []);
      console.log('[v0] loadCategories - Categories set');
    } catch (err) {
      console.error('[v0] loadCategories - Error loading categories:', err);
      console.log('[v0] loadCategories - Error type:', typeof err);
      console.log('[v0] loadCategories - Error message:', err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[v0] handleSubmit - Form submitted');
    console.log('[v0] handleSubmit - Editing ID:', editingId);
    console.log('[v0] handleSubmit - Form data:', formData);
    
    setError('');
    setSubmitting(true);

    try {
      if (editingId) {
        console.log('[v0] handleSubmit - Updating category');
        await updateCategory(editingId, formData);
        console.log('[v0] handleSubmit - Category updated successfully');
        setCategories(categories.map(c => c.id === editingId ? { ...c, ...formData } : c));
      } else {
        console.log('[v0] handleSubmit - Creating new category');
        const result = await createCategory(formData);
        console.log('[v0] handleSubmit - Category created successfully:', result);
        setCategories([...categories, result]);
      }
      console.log('[v0] handleSubmit - Resetting form');
      resetForm();
    } catch (err) {
      console.error('[v0] handleSubmit - Error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to save category';
      console.log('[v0] handleSubmit - Error message:', errorMsg);
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    console.log('[v0] handleDelete - Delete requested for ID:', id);
    if (!confirm('Are you sure you want to delete this category?')) {
      console.log('[v0] handleDelete - Delete cancelled by user');
      return;
    }

    try {
      console.log('[v0] handleDelete - Deleting category');
      await deleteCategory(id);
      console.log('[v0] handleDelete - Category deleted successfully');
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      console.error('[v0] handleDelete - Error deleting category:', err);
      alert('Failed to delete category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description,
      slug: category.slug,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', description: '', slug: '' });
    setError('');
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Categories</h1>
            <p className="text-muted-foreground mt-1">{categories.length} categories</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          )}
        </div>

        {showForm && (
          <Card className="border-border mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{editingId ? 'Edit' : 'New'} Category</CardTitle>
                <CardDescription>Add or update a product category</CardDescription>
              </div>
              <button
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Category Name *
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({
                        ...formData,
                        name: value,
                        slug: value.toLowerCase().replace(/\s+/g, '-'),
                      });
                    }}
                    placeholder="e.g., T-Shirts"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Category description"
                    className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="slug" className="text-sm font-medium">
                    Slug (auto-generated)
                  </label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated-slug"
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Category'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {categories.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No categories yet</p>
              <Button onClick={() => setShowForm(true)} variant="outline">
                Create your first category
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <Card key={category.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">Slug: {category.slug}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="flex items-center gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
