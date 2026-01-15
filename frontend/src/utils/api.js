import axios from 'axios'
import { supabase } from './supabaseClient'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on auth error
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Inventory API
export const inventoryApi = {
  getProducts: (params) => api.get('/inventory/products/', { params }),
  getProduct: (id) => api.get(`/inventory/products/${id}/`),
  createProduct: (data) => api.post('/inventory/products/', data),
  updateProduct: (id, data) => api.put(`/inventory/products/${id}/`, data),
  deleteProduct: (id) => api.delete(`/inventory/products/${id}/`),
  adjustStock: (id, adjustment) => api.patch(`/inventory/products/${id}/stock/`, { adjustment }),
  getCategories: () => api.get('/inventory/categories/'),
  getLowStock: () => api.get('/inventory/low-stock/'),
}

// Sales API
export const salesApi = {
  getSales: (params) => api.get('/sales/', { params }),
  createSale: (data) => api.post('/sales/create/', data),
  bulkSale: (items) => api.post('/sales/bulk/', { items }),
  getDashboardStats: () => api.get('/sales/dashboard/'),
  getBestSellers: (params) => api.get('/sales/best-sellers/', { params }),
  getDailyTrend: (params) => api.get('/sales/daily-trend/', { params }),
  getProfitLoss: (params) => api.get('/sales/profit-loss/', { params }),
}

// Auth API
export const authApi = {
  getProfile: () => api.get('/auth/profile/'),
  checkAdmin: () => api.get('/auth/check-admin/'),
}

export default api
