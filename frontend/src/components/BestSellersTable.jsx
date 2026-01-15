function BestSellersTable({ data }) {
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

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No sales data available
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Rank</th>
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Product</th>
            <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Category</th>
            <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Units Sold</th>
            <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.product_id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3 px-2">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {index + 1}
                </span>
              </td>
              <td className="py-3 px-2 font-medium text-gray-800">{item.product_name}</td>
              <td className="py-3 px-2">
                <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                  {getCategoryEmoji(item.category)} {item.category}
                </span>
              </td>
              <td className="py-3 px-2 text-right font-medium">{item.total_sold}</td>
              <td className="py-3 px-2 text-right font-medium text-green-600">
                {formatCurrency(item.total_revenue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BestSellersTable
