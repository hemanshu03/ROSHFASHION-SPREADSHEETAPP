import ProductForm from '@/components/forms/product-form';

export default function NewProductPage() {
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create Product</h1>
          <p className="text-muted-foreground mt-1">Add a new product to your catalog</p>
        </div>
        <ProductForm />
      </div>
    </div>
  );
}
