export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string
  enabled: boolean
  roles: string[]
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  userId: number
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

export interface Category {
  id: number
  name: string
  description?: string
  slug: string
  imageUrl?: string
  parentId?: number
  parentName?: string
  active: boolean
}

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  originalPrice?: number
  sku?: string
  imageUrl?: string
  images?: string[]
  rating: number
  reviewCount: number
  featured: boolean
  active: boolean
  categoryId?: number
  categoryName?: string
  stockQuantity: number
  createdAt: string
}

export interface CartItem {
  id: number
  productId: number
  productName: string
  productImageUrl?: string
  price: number
  quantity: number
  subtotal: number
  stockAvailable: number
}

export interface Cart {
  id: number
  items: CartItem[]
  total: number
  itemCount: number
}

export interface Address {
  id: number
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

export interface OrderItem {
  id: number
  productId?: number
  productName: string
  quantity: number
  price: number
  total: number
}

export interface OrderPayment {
  id: number
  status: string
  method: string
  amount: number
  transactionId?: string
}

export interface Order {
  id: number
  orderNumber: string
  status: OrderStatus
  subtotal: number
  tax: number
  shippingCost: number
  totalAmount: number
  notes?: string
  items: OrderItem[]
  address?: Address
  payment?: OrderPayment
  createdAt: string
  updatedAt: string
}

export type OrderStatus =
  | 'PENDING' | 'CONFIRMED' | 'PROCESSING'
  | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'

export type PaymentMethod =
  | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL'
  | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY'

export interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  ordersToday: number
  revenueToday: number
  activeCustomers: number
  pendingOrders: number
  lowStockProducts: number
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  timestamp: string
}

export interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
}

export interface ProductFilters {
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  search?: string
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}
