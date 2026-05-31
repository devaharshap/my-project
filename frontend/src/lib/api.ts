import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('accessToken')
      Cookies.remove('refreshToken')
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    api.post('/auth/register', data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', null, { headers: { 'X-Refresh-Token': refreshToken } }),
}

// Products
export const productsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/products', { params }),
  getById: (id: number) => api.get(`/products/${id}`),
  search: (q: string, page = 0) => api.get('/products/search', { params: { q, page } }),
  getFeatured: () => api.get('/products/featured'),
}

// Categories
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id: number) => api.get(`/categories/${id}`),
}

// Cart
export const cartApi = {
  getCart: () => api.get('/cart'),
  addItem: (productId: number, quantity: number) =>
    api.post('/cart/items', { productId, quantity }),
  updateItem: (itemId: number, quantity: number) =>
    api.put(`/cart/items/${itemId}`, null, { params: { quantity } }),
  removeItem: (itemId: number) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
}

// Orders
export const ordersApi = {
  place: (data: { addressId: number; paymentMethod: string; notes?: string }) =>
    api.post('/orders', data),
  getAll: (page = 0) => api.get('/orders', { params: { page } }),
  getById: (id: number) => api.get(`/orders/${id}`),
  cancel: (id: number) => api.post(`/orders/${id}/cancel`),
}

// Users
export const usersApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: unknown) => api.put('/users/me', data),
  getAddresses: () => api.get('/users/me/addresses'),
  addAddress: (data: unknown) => api.post('/users/me/addresses', data),
  deleteAddress: (id: number) => api.delete(`/users/me/addresses/${id}`),
}

// Admin
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getProducts: (params?: Record<string, unknown>) => api.get('/products', { params }),
  createProduct: (data: unknown) => api.post('/admin/products', data),
  updateProduct: (id: number, data: unknown) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id: number) => api.delete(`/admin/products/${id}`),
  createCategory: (data: unknown) => api.post('/admin/categories', data),
  updateCategory: (id: number, data: unknown) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/admin/categories/${id}`),
  getOrders: (page = 0) => api.get('/admin/orders', { params: { page } }),
  updateOrderStatus: (id: number, status: string) =>
    api.put(`/admin/orders/${id}/status`, null, { params: { status } }),
  getUsers: (params?: Record<string, unknown>) => api.get('/admin/users', { params }),
  toggleUser: (id: number) => api.put(`/admin/users/${id}/toggle`),
}
