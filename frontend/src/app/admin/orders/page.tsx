'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Order, PageResponse, OrderStatus } from '@/types'
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

export default function AdminOrdersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)

  const { data } = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: () => adminApi.getOrders(page),
  })
  const pageData: PageResponse<Order> = data?.data?.data ?? { content: [], totalPages: 0, totalElements: 0, pageNumber: 0, pageSize: 20, first: true, last: true }

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => adminApi.updateOrderStatus(id, status),
    onSuccess: () => { toast.success('Status updated'); queryClient.invalidateQueries({ queryKey: ['admin-orders'] }) },
    onError: () => toast.error('Update failed'),
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Orders ({pageData.totalElements})</h1>
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {pageData.content.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-medium">{order.orderNumber}</td>
                <td className="px-4 py-3 text-gray-600">{order.items.length > 0 ? order.items[0].productName.slice(0, 20) + '...' : '—'}</td>
                <td className="px-4 py-3">{order.items.length}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(order.totalAmount)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3">
                  <select
                    className="text-xs border rounded px-2 py-1"
                    value={order.status}
                    onChange={e => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                  >
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pageData.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4">
            <Button variant="outline" size="sm" disabled={pageData.first} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <span className="text-sm py-2">Page {pageData.pageNumber + 1} of {pageData.totalPages}</span>
            <Button variant="outline" size="sm" disabled={pageData.last} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  )
}
