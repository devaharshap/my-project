'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { User, PageResponse } from '@/types'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')

  const { data } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => adminApi.getUsers({ page, size: 20, search: search || undefined }),
  })
  const pageData: PageResponse<User> = data?.data?.data ?? { content: [], totalPages: 0, totalElements: 0, pageNumber: 0, pageSize: 20, first: true, last: true }

  const toggleMutation = useMutation({
    mutationFn: (id: number) => adminApi.toggleUser(id),
    onSuccess: () => { toast.success('User updated'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }) },
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Users ({pageData.totalElements})</h1>
      <div className="mb-4">
        <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      </div>
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Name', 'Email', 'Roles', 'Status', 'Joined', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {pageData.content.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{user.firstName} {user.lastName}</td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {user.roles.map(r => (
                      <span key={r} className={`px-2 py-0.5 rounded-full text-xs ${r === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${user.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.enabled ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm" onClick={() => toggleMutation.mutate(user.id)}>
                    {user.enabled ? 'Disable' : 'Enable'}
                  </Button>
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
