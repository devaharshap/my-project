'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api'
import { Order, PageResponse } from '@/types'
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'

export default function OrdersPage() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getAll(),
    enabled: !!user,
  })

  const pageData: PageResponse<Order> = data?.data?.data ?? { content: [], totalPages: 0, totalElements: 0, pageNumber: 0, pageSize: 10, first: true, last: true }

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p>Please <Link href="/login" className="text-primary">sign in</Link> to view orders.</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse h-24 bg-gray-100 rounded-lg" />
        ))}</div>
      ) : pageData.content.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <Link href="/products"><Button className="mt-2">Start Shopping</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pageData.content.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}
              className="block bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-mono font-semibold">{order.orderNumber}</span>
                  <span className={`ml-3 px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <span className="font-bold">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
