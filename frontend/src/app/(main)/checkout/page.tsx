'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { usersApi, ordersApi } from '@/lib/api'
import { Address, PaymentMethod } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'PAYPAL', label: 'PayPal' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CASH_ON_DELIVERY', label: 'Cash on Delivery' },
]

export default function CheckoutPage() {
  const { cart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT_CARD')
  const [notes, setNotes] = useState('')

  const { data: addressesRes } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => usersApi.getAddresses(),
    enabled: !!user,
  })
  const addresses: Address[] = addressesRes?.data?.data ?? []

  const shipping = cart && cart.total >= 50 ? 0 : 5.99
  const tax = (cart?.total ?? 0) * 0.08
  const total = (cart?.total ?? 0) + tax + (shipping ?? 0)

  const placeMutation = useMutation({
    mutationFn: () => ordersApi.place({ addressId: selectedAddress!, paymentMethod, notes }),
    onSuccess: (res) => {
      const order = res.data.data
      toast.success('Order placed successfully!')
      router.push(`/orders/${order.id}`)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to place order')
    },
  })

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p>Please <Link href="/login" className="text-primary">sign in</Link> to checkout.</p>
    </div>
  )

  if (!cart?.items?.length) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p>Your cart is empty. <Link href="/products" className="text-primary">Shop now</Link></p>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-bold mb-4">Shipping Address</h2>
            {addresses.length === 0 ? (
              <p className="text-gray-500 text-sm">No addresses saved. <Link href="/profile" className="text-primary">Add one</Link></p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label key={addr.id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${selectedAddress === addr.id ? 'border-primary bg-primary/5' : ''}`}>
                    <input type="radio" name="address" value={addr.id}
                      checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      className="mt-1" />
                    <div className="text-sm">
                      <p className="font-medium">{addr.street}</p>
                      <p className="text-gray-600">{addr.city}, {addr.state} {addr.zipCode}</p>
                      <p className="text-gray-600">{addr.country}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-bold mb-4">Payment Method</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <label key={method.value} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${paymentMethod === method.value ? 'border-primary bg-primary/5' : ''}`}>
                  <input type="radio" name="payment" value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value)} />
                  <span className="text-sm font-medium">{method.label}</span>
                </label>
              ))}
            </div>
            {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-md text-sm text-yellow-800">
                This is a demo. No real payment processing occurs.
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-bold mb-4">Order Notes (Optional)</h2>
            <textarea
              className="w-full border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3} placeholder="Special delivery instructions..."
              value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 h-fit space-y-4">
          <h2 className="font-bold text-lg">Order Summary</h2>
          <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
            {cart.items.map(item => (
              <div key={item.id} className="flex justify-between">
                <span className="truncate max-w-[180px]">{item.productName} x{item.quantity}</span>
                <span>{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(cart.total)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatPrice(tax)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>
          <Button
            className="w-full" size="lg"
            disabled={!selectedAddress || placeMutation.isPending}
            isLoading={placeMutation.isPending}
            onClick={() => placeMutation.mutate()}>
            Place Order
          </Button>
          {!selectedAddress && <p className="text-xs text-red-500 text-center">Please select a shipping address</p>}
        </div>
      </div>
    </div>
  )
}
