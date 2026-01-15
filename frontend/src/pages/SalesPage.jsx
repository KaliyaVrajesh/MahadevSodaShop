import { useState, useEffect, useCallback } from 'react'
import { inventoryApi, salesApi } from '../utils/api'
import { useCartStore } from '../stores/cartStore'
import { useSalesRealtime } from '../hooks/useSupabaseRealtime'
import toast from 'react-hot-toast'

function SalesPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  
  const { items, addItem, updateQuantity, removeItem, clearCart, getTotal } = useCartStore()

  const fetchProducts = useCallback(async () => {
    try {
      const params = { is_active: 'true' }
      if (search) params.search = search
      if (category) params.category = category
      
      const response = await inventoryApi.getProducts(params)
      setProducts(response.data)
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [search, category])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Real-time stock updates
  useSalesRealtime(() => {
    fetchProducts()
  })

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      toast.error('Product out of stock')
      return
    }
    
    const cartItem = items.find(item => item.product.id === product.id)
    if (cartItem && cartItem.quantity >= product.stock) {
      toast.error(`Only ${product.stock} available`)
      return
    }
    
    addItem(product)
    toast.success(`Added ${product.name}`)
  }

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Cart is empty')
      return
    }

    setCheckoutLoading(true)
    try {
      const saleItems = items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }))
      
      const response = await salesApi.bulkSale(saleItems)
      toast.success(`Sale completed! Total: ₹${response.data.total.toFixed(2)}`)
      clearCart()
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Checkout failed')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getCategoryEmoji = (cat) => {
    const emojis = { Bakery: '🍞', Chips: '🥔', 'Cold Drink': '🥤', 'Tobacco Items': '🚬', 'Fast Food': '🍔', Grocery: '🛒', 'Ice Cream': '🍦', Chocolates: '🍫', Battery: '🔋', Other: '📦' }
    return emojis[cat] || '📦'
  }

  const categories = ['Bakery', 'Chips', 'Cold Drink', 'Tobacco Items', 'Fast Food', 'Grocery', 'Ice Cream', 'Chocolates', 'Battery', 'Other']

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      {/* Products Grid */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Point of Sale</h2>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input flex-1"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input w-auto"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Products */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soda-red"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                  className={`card p-3 text-left transition-all hover:shadow-md ${
                    product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-soda-red'
                  }`}
                >
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-full h-24 bg-gray-100 rounded-lg mb-2 flex items-center justify-center text-4xl ${product.image_url ? 'hidden' : ''}`}
                  >
                    {getCategoryEmoji(product.category)}
                  </div>
                  <p className="font-medium text-gray-800 text-sm truncate">{product.name}</p>
                  <p className="text-lg font-bold text-soda-red mt-1">{formatCurrency(product.price)}</p>
                  <p className={`text-xs mt-1 ${product.stock < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                    Stock: {product.stock}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="w-80 flex flex-col">
        <div className="card flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🛒 Cart ({items.length})</h3>
          
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <span className="text-4xl">🛒</span>
                <p className="mt-2">Cart is empty</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-2">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(item.product.price)} each</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => {
                          if (item.quantity < item.product.stock) {
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                        }}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4 space-y-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-soda-red">{formatCurrency(getTotal())}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="btn-primary w-full py-3"
                >
                  {checkoutLoading ? 'Processing...' : '💳 Complete Sale'}
                </button>
                <button
                  onClick={clearCart}
                  className="btn-secondary w-full"
                >
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SalesPage
