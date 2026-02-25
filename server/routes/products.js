import express from 'express';
import multer from 'multer';
import { requireAuth } from './auth.js';
import { getProductsSheet, getAllRows, addRow, updateRow, deleteRow } from '../utils/sheets.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all products
router.get('/', async (req, res) => {
  try {
    const sheet = await getProductsSheet();
    const products = await getAllRows(sheet);
    
    // Parse image URLs and process data
    const processedProducts = products.map((product, index) => ({
      ...product,
      id: product.id || index,
      images: product.images ? product.images.split(',').map(url => url.trim()) : [],
      sizes: product.sizes ? product.sizes.split(',').map(size => size.trim()) : [],
      price: parseFloat(product.price) || 0,
      discount: parseFloat(product.discount) || 0,
      discountedPrice: parseFloat(product.price) * (1 - (parseFloat(product.discount) || 0) / 100),
    }));
    
    res.json(processedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const sheet = await getProductsSheet();
    const products = await getAllRows(sheet);
    const product = products[parseInt(req.params.id)];
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    product.images = product.images ? product.images.split(',').map(url => url.trim()) : [];
    product.sizes = product.sizes ? product.sizes.split(',').map(size => size.trim()) : [];
    product.price = parseFloat(product.price) || 0;
    product.discount = parseFloat(product.discount) || 0;
    product.discountedPrice = product.price * (1 - product.discount / 100);
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product
router.post('/', requireAuth, upload.array('images', 4), async (req, res) => {
  try {
    const { name, description, category, price, discount, sizes, sku } = req.body;
    
    // Upload images to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const publicId = `product-${Date.now()}-${i}`;
        const uploadedImage = await uploadImage(file.buffer, publicId);
        imageUrls.push(uploadedImage.secure_url);
      }
    }
    
    const sheet = await getProductsSheet();
    const newProduct = {
      id: Date.now().toString(),
      name: name || '',
      description: description || '',
      category: category || '',
      price: parseFloat(price) || 0,
      discount: parseFloat(discount) || 0,
      sizes: sizes || '',
      sku: sku || '',
      images: imageUrls.join(', '),
      createdAt: new Date().toISOString(),
    };
    
    const result = await addRow(sheet, newProduct);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', requireAuth, upload.array('images', 4), async (req, res) => {
  try {
    const { name, description, category, price, discount, sizes, sku, existingImages } = req.body;
    
    const sheet = await getProductsSheet();
    const products = await getAllRows(sheet);
    const productIndex = parseInt(req.params.id);
    const existingProduct = products[productIndex];
    
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Handle existing images
    let imageUrls = existingImages ? existingImages.split(',').map(url => url.trim()) : [];
    
    // Upload new images
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const publicId = `product-${Date.now()}-${i}`;
        const uploadedImage = await uploadImage(file.buffer, publicId);
        imageUrls.push(uploadedImage.secure_url);
      }
    }
    
    const updatedProduct = {
      ...existingProduct,
      name: name || existingProduct.name,
      description: description || existingProduct.description,
      category: category || existingProduct.category,
      price: parseFloat(price) !== 0 ? parseFloat(price) : existingProduct.price,
      discount: parseFloat(discount) !== 0 ? parseFloat(discount) : existingProduct.discount,
      sizes: sizes || existingProduct.sizes,
      sku: sku || existingProduct.sku,
      images: imageUrls.join(', '),
      updatedAt: new Date().toISOString(),
    };
    
    const result = await updateRow(sheet, productIndex, updatedProduct);
    res.json(result);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const sheet = await getProductsSheet();
    const products = await getAllRows(sheet);
    const product = products[parseInt(req.params.id)];
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete images from Cloudinary
    if (product.images) {
      const imageUrls = product.images.split(',').map(url => url.trim());
      for (const imageUrl of imageUrls) {
        try {
          const publicId = imageUrl.split('/').pop().split('.')[0];
          await deleteImage(`admin-portal/products/${publicId}`);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }
    }
    
    await deleteRow(sheet, parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
