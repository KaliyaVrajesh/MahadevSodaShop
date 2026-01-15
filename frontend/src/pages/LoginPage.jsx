import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import AuthForm from '../components/AuthForm'

function LoginPage() {
  const { user, loading } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soda-red"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soda-red via-soda-orange to-soda-yellow flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-6xl">🥤</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Mahadav Soda Shop</h1>
          <p className="text-gray-500 mt-1">Rajkot, Gujarat</p>
        </div>
        <AuthForm onSuccess={() => navigate('/dashboard')} />
      </div>
    </div>
  )
}

export default LoginPage
