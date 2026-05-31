'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'

export default function CartPage() {
  const { cart, isLoading, updateItem, removeItem } = useCart()
  const { user } = useAuth()

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Sign in to view your cart</h2>
      <Link href="/login"><Button className="mt-4">Sign In</Button></Link>
    </div>
  )

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">Loading...</div>

  if (!cart?.items?.length) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Add some products to get started</p>
      <Link href="/products"><Button>Shop Now</Button></Link>
    </div>
  )

  const TAX_RATE = 0.08
  const shipping = cart.total >= 50 ? 0 : 5.99
  const tax = cart.total * TAX_RATE
  const total = cart.total + tax + shipping

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart ({cart.itemCount} items)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white border rounded-lg p-4">
              <div className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden bg-gray-100">
                <Image
                  src={item.productImageUrl || `https://picsum.photos/seed/${item.productId}/100/100`}
                  alt={item.productName} fill className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.productId}`}
                  className="font-medium hover:text-primary line-clamp-2 text-sm">
                  {item.productName}
                </Link>
                <p className="text-primary font-semibold mt-1">{formatPrice(item.price)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center border rounded-md">
                    <button onClick={() => updateItem(item.id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 py-1 text-sm">{item.quantity}</span>
                    <button onClick={() => updateItem(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stockAvailable}
                      className="px-2 py-1 hover:bg-gray-100 disabled:opacity-50">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <span className="ml-auto font-semibold">{formatPrice(item.subtotal)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border rounded-lg p-6 h-fit space-y-4">
          <h2 className="font-bold text-lg">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(cart.total)}</span></div>
            <div className="flex justify-between"><span>Tax (8%)</span><span>{formatPrice(tax)}</span></div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="text-green-600">FREE</span> : formatPrice(shipping)}</span>
            </div>
            {shipping > 0 && <p className="text-xs text-gray-500">Add {formatPrice(50 - cart.total)} more for free shipping</p>}
            <div className="border-t pt-2 flex justify-between font-bold text-base">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>
          <Link href="/checkout" className="block">
            <Button className="w-full" size="lg">Proceed to Checkout</Button>
          </Link>
          <Link href="/products" className="block">
            <Button variant="outline" className="w-full">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
