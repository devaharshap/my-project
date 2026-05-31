'use client'

import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { DashboardStats } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle, Clock } from 'lucide-react'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard(),
  })

  const stats: DashboardStats = data?.data?.data ?? {}

  const cards = [
    { label: 'Total Users', value: stats.totalUsers?.toLocaleString() ?? '—', icon: Users, color: 'bg-blue-500' },
    { label: 'Total Products', value: stats.totalProducts?.toLocaleString() ?? '—', icon: Package, color: 'bg-green-500' },
    { label: 'Total Orders', value: stats.totalOrders?.toLocaleString() ?? '—', icon: ShoppingCart, color: 'bg-purple-500' },
    { label: 'Total Revenue', value: stats.totalRevenue != null ? formatPrice(stats.totalRevenue) : '—', icon: DollarSign, color: 'bg-yellow-500' },
    { label: "Orders Today", value: stats.ordersToday?.toLocaleString() ?? '—', icon: TrendingUp, color: 'bg-indigo-500' },
    { label: "Revenue Today", value: stats.revenueToday != null ? formatPrice(stats.revenueToday) : '—', icon: DollarSign, color: 'bg-orange-500' },
    { label: 'Pending Orders', value: stats.pendingOrders?.toLocaleString() ?? '—', icon: Clock, color: 'bg-red-500' },
    { label: 'Low Stock', value: stats.lowStockProducts?.toLocaleString() ?? '—', icon: AlertTriangle, color: 'bg-amber-500' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border p-5 flex items-center gap-4">
              <div className={`${color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
