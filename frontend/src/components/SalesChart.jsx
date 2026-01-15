import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

function SalesChart({ data, type = 'area' }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })
  }

  const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`

  const chartData = data?.map(item => ({
    ...item,
    date: formatDate(item.date),
    total_sales: parseFloat(item.total_sales) || 0,
    total_profit: parseFloat(item.total_profit) || 0,
  })) || []

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          <Legend />
          <Bar dataKey="total_sales" name="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="total_profit" name="Profit" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
        <Tooltip
          formatter={(value) => formatCurrency(value)}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="total_sales"
          name="Sales"
          stroke="#3b82f6"
          fillOpacity={1}
          fill="url(#colorSales)"
        />
        <Area
          type="monotone"
          dataKey="total_profit"
          name="Profit"
          stroke="#22c55e"
          fillOpacity={1}
          fill="url(#colorProfit)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default SalesChart
