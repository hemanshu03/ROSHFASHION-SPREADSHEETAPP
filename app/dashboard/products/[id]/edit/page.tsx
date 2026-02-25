'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/forms/product-form';
import { getProduct } from '@/lib/api';
import { Loader } from 'lucide-react';

export default function EditProductPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProduct(params.id as string);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="p-4 text-destructive bg-destructive/10 rounded-md border border-destructive/20">
            {error || 'Product not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
          <p className="text-muted-foreground mt-1">Update product details</p>
        </div>
        <ProductForm product={product} />
      </div>
    </div>
  );
}
