import { useState, useEffect, useCallback } from 'react'
import { salesApi, inventoryApi } from '../utils/api'
import { useSalesRealtime, useProductsRealtime } from '../hooks/useSupabaseRealtime'
import DashboardCards from '../components/DashboardCards'
import SalesChart from '../components/SalesChart'
import BestSellersTable from '../components/BestSellersTable'
import toast from 'react-hot-toast'

function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [dailyTrend, setDailyTrend] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, trendRes, sellersRes, lowStockRes] = await Promise.all([
        salesApi.getDashboardStats(),
        salesApi.getDailyTrend({ days: 7 }),
        salesApi.getBestSellers({ days: 30, limit: 5 }),
        inventoryApi.getLowStock(),
      ])
      
      setStats(statsRes.data)
      setDailyTrend(trendRes.data)
      setBestSellers(sellersRes.data)
      setLowStockProducts(lowStockRes.data)
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Real-time updates
  useSalesRealtime(() => {
    fetchData()
    toast.success('New sale recorded!', { icon: '🎉' })
  })

  useProductsRealtime(() => {
    fetchData()
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soda-red"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <button
          onClick={fetchData}
          className="btn-secondary text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <DashboardCards stats={stats} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Trend (Last 7 Days)</h3>
          <SalesChart data={dailyTrend} type="area" />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales vs Profit</h3>
          <SalesChart data={dailyTrend} type="bar" />
        </div>
      </div>

      {/* Best Sellers & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Best Sellers (30 Days)</h3>
          <BestSellersTable data={bestSellers} />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Low Stock Alerts</h3>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl">✅</span>
              <p className="mt-2">All products are well stocked!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                >
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{product.stock} left</p>
                    <p className="text-xs text-gray-500">Min: {product.min_stock}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
