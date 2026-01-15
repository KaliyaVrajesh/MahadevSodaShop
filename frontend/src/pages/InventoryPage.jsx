import { useState, useEffect, useCallback } from 'react'
import { inventoryApi } from '../utils/api'
import { useProductsRealtime } from '../hooks/useSupabaseRealtime'
import ProductTable from '../components/ProductTable'
import ProductForm from '../components/ProductForm'
import toast from 'react-hot-toast'

function InventoryPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [filters, setFilters] = useState({ category: '', search: '', low_stock: false })

  const fetchProducts = useCallback(async () => {
    try {
      const params = {}
      if (filters.category) params.category = filters.category
      if (filters.search) params.search = filters.search
      if (filters.low_stock) params.low_stock = 'true'
      
      const response = await inventoryApi.getProducts(params)
      setProducts(response.data)
    } catch (error) {
      console.error('Fetch products error:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Real-time updates
  useProductsRealtime(() => {
    fetchProducts()
  })

  const handleSubmit = async (data) => {
    setFormLoading(true)
    try {
      if (editingProduct) {
        await inventoryApi.updateProduct(editingProduct.id, data)
        toast.success('Product updated successfully')
      } else {
        await inventoryApi.createProduct(data)
        toast.success('Product added successfully')
      }
      setShowForm(false)
      setEditingProduct(null)
      fetchProducts()
    } catch (error) {
      console.error('Save product error:', error)
      toast.error(error.response?.data?.error || 'Failed to save product')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = async (product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return
    
    try {
      await inventoryApi.deleteProduct(product.id)
      toast.success('Product deleted')
      fetchProducts()
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const handleAdjustStock = async (product, adjustment) => {
    try {
      await inventoryApi.adjustStock(product.id, adjustment)
      toast.success(`Stock ${adjustment > 0 ? 'increased' : 'decreased'}`)
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to adjust stock')
    }
  }

  const categories = ['Bakery', 'Chips', 'Cold Drink', 'Tobacco Items', 'Fast Food', 'Grocery', 'Ice Cream', 'Chocolates', 'Battery', 'Other']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true) }}
          className="btn-primary"
        >
          ➕ Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input"
            />
          </div>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="input w-auto"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.low_stock}
              onChange={(e) => setFilters({ ...filters, low_stock: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Low Stock Only</span>
          </label>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <ProductForm
              product={editingProduct}
              onSubmit={handleSubmit}
              onCancel={() => { setShowForm(false); setEditingProduct(null) }}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soda-red"></div>
          </div>
        ) : (
          <ProductTable
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdjustStock={handleAdjustStock}
          />
        )}
      </div>
    </div>
  )
}

export default InventoryPage
