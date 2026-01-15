import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export function useAuth(requireAuth = true) {
  const { user, loading, initialize } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      navigate('/login')
    }
  }, [user, loading, requireAuth, navigate])

  return { user, loading }
}

export function useRequireAdmin() {
  const { isAdmin, loading } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/dashboard')
    }
  }, [isAdmin, loading, navigate])

  return { isAdmin, loading }
}
