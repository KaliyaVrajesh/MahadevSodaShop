import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

function Layout() {
  const { user, profile, isAdmin, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/sales', label: 'Sales/POS', icon: '🛒' },
    ...(isAdmin ? [{ path: '/inventory', label: 'Inventory', icon: '📦' }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-soda-red to-soda-orange text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🥤</span>
              <div>
                <h1 className="text-xl font-bold">Mahadav Soda Shop</h1>
                <p className="text-xs opacity-80">Rajkot, Gujarat</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">
                {profile?.username || user?.email}
                {isAdmin && <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">Admin</span>}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-soda-red text-soda-red'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
