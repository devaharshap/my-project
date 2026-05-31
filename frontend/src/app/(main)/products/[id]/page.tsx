'use client'

import Image from 'next/image'
import Link from 'next/link'
import { use, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api'
import { Product } from '@/types'
import { formatPrice, getDiscountPercent } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Star, ArrowLeft, Minus, Plus } from 'lucide-react'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(Number(id)),
  })

  const product: Product = data?.data?.data

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-200 rounded-lg" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  )

  if (error || !product) return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-center">
      <p className="text-gray-500">Product not found.</p>
      <Link href="/products"><Button variant="outline" className="mt-4">Back to Products</Button></Link>
    </div>
  )

  const discount = getDiscountPercent(product.price, product.originalPrice)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/products" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={product.imageUrl || `https://picsum.photos/seed/${product.id}/600/600`}
            alt={product.name} fill className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {discount && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full">
              -{discount}% OFF
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {product.categoryName && (
            <Link href={`/products?categoryId=${product.categoryId}`}>
              <Badge variant="secondary">{product.categoryName}</Badge>
            </Link>
          )}
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-5 w-5 ${i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            ))}
            <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xl text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          {product.description && (
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Availability:</span>
            {product.stockQuantity > 0 ? (
              <span className="text-green-600 text-sm font-medium">{product.stockQuantity} in stock</span>
            ) : (
              <span className="text-red-500 text-sm font-medium">Out of Stock</span>
            )}
          </div>

          {product.sku && <p className="text-sm text-gray-500">SKU: {product.sku}</p>}

          {product.stockQuantity > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center border rounded-md">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-gray-100"><Minus className="h-4 w-4" /></button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                  className="px-3 py-2 hover:bg-gray-100"><Plus className="h-4 w-4" /></button>
              </div>
              <Button size="lg" className="flex-1" onClick={() => addItem(product.id, quantity)}>
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
