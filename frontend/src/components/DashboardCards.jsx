function StatCard({ title, value, icon, trend, color = 'blue' }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from yesterday
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function DashboardCards({ stats }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Today's Sales"
        value={formatCurrency(stats?.today_sales || 0)}
        icon="💰"
        color="blue"
      />
      <StatCard
        title="Today's Profit"
        value={formatCurrency(stats?.today_profit || 0)}
        icon="📈"
        color="green"
      />
      <StatCard
        title="Items Sold Today"
        value={stats?.today_items_sold || 0}
        icon="📦"
        color="orange"
      />
      <StatCard
        title="Low Stock Alerts"
        value={stats?.low_stock_count || 0}
        icon="⚠️"
        color={stats?.low_stock_count > 0 ? 'red' : 'purple'}
      />
    </div>
  )
}

export default DashboardCards
