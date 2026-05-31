'use client'

import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { productsApi } from '@/lib/api'
import { Product, ProductFilters, PageResponse } from '@/types'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductFiltersPanel } from '@/components/products/ProductFilters'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal, X } from 'lucide-react'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState<ProductFilters>({
    categoryId: searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined,
    search: searchParams.get('search') ?? undefined,
    minPrice: undefined, maxPrice: undefined,
    page: 0, size: 12, sortBy: 'createdAt', sortDir: 'desc',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getAll({
      categoryId: filters.categoryId,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      search: filters.search,
      page: filters.page,
      size: filters.size,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
    }),
  })

  const pageData: PageResponse<Product> = data?.data?.data ?? { content: [], totalPages: 0, totalElements: 0, pageNumber: 0, pageSize: 12, first: true, last: true }

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 0 }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({ page: 0, size: 12, sortBy: 'createdAt', sortDir: 'desc' })
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{pageData.totalElements} products found</p>
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {filters.search && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm">Results for: <strong>"{filters.search}"</strong></span>
          <button onClick={() => updateFilters({ search: undefined })}
            className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="flex gap-8">
        <aside className={`w-64 shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <ProductFiltersPanel filters={filters} onFilterChange={updateFilters} onReset={resetFilters} />
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg border h-64 bg-gray-100" />
              ))}
            </div>
          ) : pageData.content.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No products found.</p>
              <Button variant="outline" className="mt-4" onClick={resetFilters}>Clear Filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {pageData.content.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {pageData.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button variant="outline" disabled={pageData.first} onClick={() => updateFilters({ page: filters.page! - 1 })}>
                    Previous
                  </Button>
                  <span className="text-sm">Page {pageData.pageNumber + 1} of {pageData.totalPages}</span>
                  <Button variant="outline" disabled={pageData.last} onClick={() => updateFilters({ page: filters.page! + 1 })}>
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
