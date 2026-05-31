'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingCart } from 'lucide-react'
import { Product } from '@/types'
import { formatPrice, getDiscountPercent } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const discount = getDiscountPercent(product.price, product.originalPrice)

  return (
    <div className="group rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.imageUrl || `https://picsum.photos/seed/${product.id}/400/400`}
          alt={product.name}
          fill className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {discount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        {product.featured && (
          <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full">
            Featured
          </span>
        )}
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <p className="text-xs text-gray-500 mb-1">{product.categoryName}</p>
          <h3 className="font-medium text-sm line-clamp-2 hover:text-primary">{product.name}</h3>
        </Link>

        <div className="flex items-center gap-1 my-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3 w-3 ${i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
          ))}
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-primary">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {product.stockQuantity === 0 ? (
          <Badge variant="secondary" className="w-full justify-center">Out of Stock</Badge>
        ) : (
          <Button size="sm" className="w-full" onClick={() => addItem(product.id)}>
            <ShoppingCart className="h-4 w-4" /> Add to Cart
          </Button>
        )}
      </div>
    </div>
  )
}
