import express from 'express';
import { requireAuth } from './auth.js';
import { getCategoriesSheet, getAllRows, addRow, updateRow, deleteRow } from '../utils/sheets.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    console.log('[v0] GET /api/categories - Request received');
    console.log('[v0] GET - Session:', req.session);
    console.log('[v0] GET - User:', req.user);
    
    const sheet = await getCategoriesSheet();
    console.log('[v0] GET - Categories sheet fetched');
    
    const categories = await getAllRows(sheet);
    console.log('[v0] GET - Categories retrieved:', categories);
    
    res.json(categories);
  } catch (error) {
    console.error('[v0] Error fetching categories:', error);
    console.error('[v0] Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch categories', details: error.message });
  }
});

// Create category
router.post('/', requireAuth, async (req, res) => {
  try {
    console.log('[v0] POST /api/categories - Request received');
    console.log('[v0] POST - Session:', req.session);
    console.log('[v0] POST - User:', req.user);
    console.log('[v0] POST - Body:', req.body);
    
    const { name, description, slug } = req.body;
    
    if (!name) {
      console.log('[v0] POST - Name is missing');
      return res.status(400).json({ error: 'Category name required' });
    }
    
    console.log('[v0] POST - Getting categories sheet');
    const sheet = await getCategoriesSheet();
    console.log('[v0] POST - Categories sheet fetched');
    
    const newCategory = {
      id: Date.now().toString(),
      name,
      description: description || '',
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString(),
    };
    
    console.log('[v0] POST - New category object:', newCategory);
    console.log('[v0] POST - Adding row to sheet');
    
    const result = await addRow(sheet, newCategory);
    console.log('[v0] POST - Row added successfully:', result);
    
    res.status(201).json(result);
  } catch (error) {
    console.error('[v0] Error creating category:', error);
    console.error('[v0] Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create category', details: error.message });
  }
});

// Update category
router.put('/:id', requireAuth, async (req, res) => {
  try {
    console.log('[v0] PUT /api/categories/:id - Request received');
    console.log('[v0] PUT - ID:', req.params.id);
    console.log('[v0] PUT - Body:', req.body);
    console.log('[v0] PUT - User:', req.user);
    
    const { name, description, slug } = req.body;
    
    const sheet = await getCategoriesSheet();
    console.log('[v0] PUT - Categories sheet fetched');
    
    const categories = await getAllRows(sheet);
    console.log('[v0] PUT - Categories retrieved:', categories);
    
    const categoryIndex = parseInt(req.params.id);
    const existingCategory = categories[categoryIndex];
    
    console.log('[v0] PUT - Category index:', categoryIndex);
    console.log('[v0] PUT - Existing category:', existingCategory);
    
    if (!existingCategory) {
      console.log('[v0] PUT - Category not found at index:', categoryIndex);
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const updatedCategory = {
      ...existingCategory,
      name: name || existingCategory.name,
      description: description !== undefined ? description : existingCategory.description,
      slug: slug || existingCategory.slug,
      updatedAt: new Date().toISOString(),
    };
    
    console.log('[v0] PUT - Updated category object:', updatedCategory);
    const result = await updateRow(sheet, categoryIndex, updatedCategory);
    console.log('[v0] PUT - Row updated successfully:', result);
    
    res.json(result);
  } catch (error) {
    console.error('[v0] Error updating category:', error);
    console.error('[v0] Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to update category', details: error.message });
  }
});

// Delete category
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    console.log('[v0] DELETE /api/categories/:id - Request received');
    console.log('[v0] DELETE - ID:', req.params.id);
    console.log('[v0] DELETE - User:', req.user);
    
    const sheet = await getCategoriesSheet();
    console.log('[v0] DELETE - Categories sheet fetched');
    
    const categories = await getAllRows(sheet);
    console.log('[v0] DELETE - Categories retrieved:', categories);
    
    const categoryId = parseInt(req.params.id);
    console.log('[v0] DELETE - Category index:', categoryId);
    
    if (!categories[categoryId]) {
      console.log('[v0] DELETE - Category not found at index:', categoryId);
      return res.status(404).json({ error: 'Category not found' });
    }
    
    console.log('[v0] DELETE - Deleting row at index:', categoryId);
    await deleteRow(sheet, categoryId);
    console.log('[v0] DELETE - Row deleted successfully');
    
    res.json({ success: true });
  } catch (error) {
    console.error('[v0] Error deleting category:', error);
    console.error('[v0] Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to delete category', details: error.message });
  }
});

export default router;
