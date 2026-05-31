'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, categoriesApi } from '@/lib/api'
import { Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

interface CatForm { name: string; description: string; slug: string; imageUrl: string; parentId: string }
const emptyForm: CatForm = { name: '', description: '', slug: '', imageUrl: '', parentId: '' }

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState<CatForm>(emptyForm)

  const { data } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.getAll() })
  const categories: Category[] = data?.data?.data ?? []

  const saveMutation = useMutation({
    mutationFn: (d: unknown) => editing ? adminApi.updateCategory(editing.id, d) : adminApi.createCategory(d),
    onSuccess: () => { toast.success('Saved'); queryClient.invalidateQueries({ queryKey: ['categories'] }); setShowForm(false); setEditing(null); setForm(emptyForm) },
    onError: () => toast.error('Failed to save category'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCategory(id),
    onSuccess: () => { toast.success('Deleted'); queryClient.invalidateQueries({ queryKey: ['categories'] }) },
  })

  const openEdit = (c: Category) => {
    setEditing(c)
    setForm({ name: c.name, description: c.description ?? '', slug: c.slug ?? '', imageUrl: c.imageUrl ?? '', parentId: String(c.parentId ?? '') })
    setShowForm(true)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories ({categories.length})</h1>
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm) }}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold">{editing ? 'Edit' : 'New'} Category</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <Input placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input placeholder="Slug (auto-generated if empty)" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
              <Input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <Input placeholder="Image URL" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.parentId}
                onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}>
                <option value="">No parent (root category)</option>
                {categories.filter(c => c.id !== editing?.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <Button className="flex-1" isLoading={saveMutation.isPending}
                onClick={() => saveMutation.mutate({ name: form.name, description: form.description, slug: form.slug, imageUrl: form.imageUrl, parentId: form.parentId ? parseInt(form.parentId) : null })}>
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
            <tr>{['Name', 'Slug', 'Parent', 'Status', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.slug}</td>
                <td className="px-4 py-3 text-gray-600">{c.parentName ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="text-blue-500 hover:text-blue-700"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => deleteMutation.mutate(c.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
