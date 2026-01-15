function ProductTable({ products, onEdit, onDelete, onAdjustStock }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getCategoryEmoji = (category) => {
    const emojis = {
      Bakery: '🍞',
      Chips: '🥔',
      'Cold Drink': '🥤',
      'Tobacco Items': '🚬',
      'Fast Food': '🍔',
      Grocery: '🛒',
      'Ice Cream': '🍦',
      Chocolates: '🍫',
      Battery: '🔋',
      Other: '📦',
    }
    return emojis[category] || '📦'
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <span className="text-4xl">📦</span>
        <p className="mt-2">No products found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Product</th>
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Category</th>
            <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Price</th>
            <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Cost</th>
            <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Stock</th>
            <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Margin</th>
            <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Status</th>
            <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-2">
                <p className="font-medium text-gray-800">{product.name}</p>
              </td>
              <td className="py-3 px-2">
                <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                  {getCategoryEmoji(product.category)} {product.category}
                </span>
              </td>
              <td className="py-3 px-2 text-right font-medium">{formatCurrency(product.price)}</td>
              <td className="py-3 px-2 text-right text-gray-600">
                {product.cost_price ? formatCurrency(product.cost_price) : '-'}
              </td>
              <td className="py-3 px-2 text-right">
                <span className={`font-medium ${product.is_low_stock ? 'text-red-600' : 'text-gray-800'}`}>
                  {product.stock}
                </span>
                {product.is_low_stock && <span className="ml-1 text-red-500">⚠️</span>}
              </td>
              <td className="py-3 px-2 text-right">
                <span className="text-green-600 font-medium">
                  {product.profit_margin ? `${product.profit_margin}%` : '-'}
                </span>
              </td>
              <td className="py-3 px-2 text-center">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-3 px-2">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => onAdjustStock(product, -1)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Decrease stock"
                  >
                    ➖
                  </button>
                  <button
                    onClick={() => onAdjustStock(product, 1)}
                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                    title="Increase stock"
                  >
                    ➕
                  </button>
                  <button
                    onClick={() => onEdit(product)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProductTable
