import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  cost_price: z.coerce.number().min(0, 'Cost price must be positive').optional(),
  stock: z.coerce.number().int().min(0, 'Stock must be non-negative'),
  min_stock: z.coerce.number().int().min(0, 'Min stock must be non-negative'),
  image_url: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean(),
})

const categories = ['Bakery', 'Chips', 'Cold Drink', 'Tobacco Items', 'Fast Food', 'Grocery', 'Ice Cream', 'Chocolates', 'Battery', 'Other']

function ProductForm({ product, onSubmit, onCancel, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      category: product?.category || 'Other',
      price: product?.price || 0,
      cost_price: product?.cost_price || 0,
      stock: product?.stock || 0,
      min_stock: product?.min_stock || 10,
      image_url: product?.image_url || '',
      is_active: product?.is_active ?? true,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Product Name *</label>
          <input {...register('name')} className="input" placeholder="e.g., Coca-Cola 300ml" />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label">Category *</label>
          <select {...register('category')} className="input">
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
        </div>

        <div>
          <label className="label">Selling Price (₹) *</label>
          <input {...register('price')} type="number" step="0.01" className="input" placeholder="25.00" />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
        </div>

        <div>
          <label className="label">Cost Price (₹)</label>
          <input {...register('cost_price')} type="number" step="0.01" className="input" placeholder="18.00" />
          {errors.cost_price && <p className="text-red-500 text-sm mt-1">{errors.cost_price.message}</p>}
        </div>

        <div>
          <label className="label">Current Stock *</label>
          <input {...register('stock')} type="number" className="input" placeholder="100" />
          {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
        </div>

        <div>
          <label className="label">Minimum Stock Level</label>
          <input {...register('min_stock')} type="number" className="input" placeholder="10" />
          {errors.min_stock && <p className="text-red-500 text-sm mt-1">{errors.min_stock.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="label">Image URL (optional)</label>
          <input {...register('image_url')} type="url" className="input" placeholder="https://..." />
          {errors.image_url && <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('is_active')} type="checkbox" className="w-4 h-4 rounded border-gray-300" />
            <span className="text-sm text-gray-700">Product is active and available for sale</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}

export default ProductForm
