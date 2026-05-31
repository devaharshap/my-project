'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, categoriesApi } from '@/lib/api'
import { Product, PageResponse, Category } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

interface ProductForm {
  name: string; description: string; price: string; originalPrice: string;
  categoryId: string; sku: string; imageUrl: string; stockQuantity: string; featured: boolean
}

const emptyForm: ProductForm = { name: '', description: '', price: '', originalPrice: '', categoryId: '', sku: '', imageUrl: '', stockQuantity: '0', featured: false }

export default function AdminProductsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)

  const { data } = useQuery({
    queryKey: ['admin-products', page],
    queryFn: () => adminApi.getProducts({ page, size: 20 }),
  })
  const { data: catData } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.getAll() })

  const pageData: PageResponse<Product> = data?.data?.data ?? { content: [], totalPages: 0, totalElements: 0, pageNumber: 0, pageSize: 20, first: true, last: true }
  const categories: Category[] = catData?.data?.data ?? []

  const saveMutation = useMutation({
    mutationFn: (data: unknown) => editing
      ? adminApi.updateProduct(editing.id, data)
      : adminApi.createProduct(data),
    onSuccess: () => {
      toast.success(editing ? 'Product updated' : 'Product created')
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      setShowForm(false); setEditing(null); setForm(emptyForm)
    },
    onError: () => toast.error('Failed to save product'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteProduct(id),
    onSuccess: () => { toast.success('Product deleted'); queryClient.invalidateQueries({ queryKey: ['admin-products'] }) },
  })

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({ name: p.name, description: p.description ?? '', price: String(p.price),
      originalPrice: String(p.originalPrice ?? ''), categoryId: String(p.categoryId ?? ''),
      sku: p.sku ?? '', imageUrl: p.imageUrl ?? '', stockQuantity: String(p.stockQuantity), featured: p.featured })
    setShowForm(true)
  }

  const handleSave = () => {
    saveMutation.mutate({
      name: form.name, description: form.description,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      categoryId: parseInt(form.categoryId), sku: form.sku,
      imageUrl: form.imageUrl, stockQuantity: parseInt(form.stockQuantity), featured: form.featured
    })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products ({pageData.totalElements})</h1>
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm) }}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-lg">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <Input placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <textarea className="w-full border rounded-md p-2 text-sm resize-none" rows={3} placeholder="Description"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Price *" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                <Input type="number" placeholder="Original Price" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} />
              </div>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                <option value="">Select Category *</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="SKU" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
                <Input type="number" placeholder="Stock Qty" value={form.stockQuantity} onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))} />
              </div>
              <Input placeholder="Image URL" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
                Featured product
              </label>
            </div>
            <div className="flex gap-3 mt-4">
              <Button className="flex-1" isLoading={saveMutation.isPending} onClick={handleSave}>
                {editing ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {pageData.content.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.sku}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.categoryName}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">{p.stockQuantity}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {p.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-blue-500 hover:text-blue-700"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => deleteMutation.mutate(p.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                  </div>
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
