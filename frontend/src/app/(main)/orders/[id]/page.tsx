'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '@/lib/api'
import { Order } from '@/types'
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(Number(id)),
  })

  const order: Order = data?.data?.data

  const cancelMutation = useMutation({
    mutationFn: () => ordersApi.cancel(Number(id)),
    onSuccess: () => {
      toast.success('Order cancelled')
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: () => toast.error('Cannot cancel this order'),
  })

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">Loading...</div>
  if (!order) return <div className="max-w-3xl mx-auto px-4 py-8">Order not found.</div>

  const cancellable = ['PENDING', 'CONFIRMED'].includes(order.status)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/orders" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
            {order.status}
          </span>
          {cancellable && (
            <Button variant="destructive" size="sm" isLoading={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}>Cancel</Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Items */}
        <div className="bg-white border rounded-lg p-5">
          <h2 className="font-bold mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{item.productName}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                </div>
                <span className="font-semibold">{formatPrice(item.total)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shippingCost)}</span></div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span><span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Address & Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {order.address && (
            <div className="bg-white border rounded-lg p-5">
              <h2 className="font-bold mb-3">Shipping Address</h2>
              <p className="text-sm">{order.address.street}</p>
              <p className="text-sm text-gray-600">{order.address.city}, {order.address.state} {order.address.zipCode}</p>
              <p className="text-sm text-gray-600">{order.address.country}</p>
            </div>
          )}
          {order.payment && (
            <div className="bg-white border rounded-lg p-5">
              <h2 className="font-bold mb-3">Payment</h2>
              <p className="text-sm"><span className="font-medium">Method:</span> {order.payment.method.replace('_', ' ')}</p>
              <p className="text-sm"><span className="font-medium">Status:</span> {order.payment.status}</p>
              {order.payment.transactionId && (
                <p className="text-xs text-gray-500 mt-1 font-mono">{order.payment.transactionId}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
