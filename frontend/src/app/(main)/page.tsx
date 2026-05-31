'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { productsApi, categoriesApi } from '@/lib/api'
import { Product, Category } from '@/types'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShoppingBag, Truck, Shield, RefreshCw } from 'lucide-react'

export default function HomePage() {
  const { data: featuredRes } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.getFeatured(),
  })
  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  })

  const featured: Product[] = featuredRes?.data?.data ?? []
  const categories: Category[] = (categoriesRes?.data?.data ?? []).slice(0, 8)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Shop the Best Products</h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover thousands of products across all categories. Quality guaranteed.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                Shop Now <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                Join Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
            { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
            { icon: RefreshCw, title: 'Easy Returns', desc: '30-day policy' },
            { icon: ShoppingBag, title: '1000+ Products', desc: 'Curated selection' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-2">
              <Icon className="h-8 w-8 text-primary" />
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12 px-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <Link href="/products" className="text-primary text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/products?categoryId=${cat.id}`}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                  <Image src={cat.imageUrl || `https://picsum.photos/seed/${cat.slug}/100/100`}
                    alt={cat.name} width={64} height={64} className="object-cover w-full h-full" />
                </div>
                <span className="text-xs font-medium line-clamp-2">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-12 px-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link href="/products?featured=true" className="text-primary text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
