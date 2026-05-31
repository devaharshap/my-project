'use client'

import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/lib/api'
import { Category, ProductFilters } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ProductFiltersProps {
  filters: ProductFilters
  onFilterChange: (filters: Partial<ProductFilters>) => void
  onReset: () => void
}

export function ProductFiltersPanel({ filters, onFilterChange, onReset }: ProductFiltersProps) {
  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  })
  const categories: Category[] = categoriesRes?.data?.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onFilterChange({ categoryId: undefined })}
              className={`text-sm w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${!filters.categoryId ? 'font-semibold text-primary' : ''}`}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => onFilterChange({ categoryId: cat.id })}
                className={`text-sm w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${filters.categoryId === cat.id ? 'font-semibold text-primary' : ''}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="flex gap-2 items-center">
          <Input
            type="number" placeholder="Min" min={0}
            value={filters.minPrice ?? ''}
            onChange={(e) => onFilterChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
          <span>-</span>
          <Input
            type="number" placeholder="Max" min={0}
            value={filters.maxPrice ?? ''}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Sort By</h3>
        <select
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={`${filters.sortBy}-${filters.sortDir}`}
          onChange={(e) => {
            const [sortBy, sortDir] = e.target.value.split('-')
            onFilterChange({ sortBy, sortDir: sortDir as 'asc' | 'desc' })
          }}
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Top Rated</option>
          <option value="name-asc">Name A-Z</option>
        </select>
      </div>

      <Button variant="outline" className="w-full" onClick={onReset}>Reset Filters</Button>
    </div>
  )
}
