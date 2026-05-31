'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/lib/api'
import { Address } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [profileForm, setProfileForm] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: '' })
  const [addrForm, setAddrForm] = useState({ street: '', city: '', state: '', zipCode: '', country: 'US', isDefault: false })

  const { data: addressesRes } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => usersApi.getAddresses(),
    enabled: !!user,
  })
  const addresses: Address[] = addressesRes?.data?.data ?? []

  const updateProfileMutation = useMutation({
    mutationFn: (data: typeof profileForm) => usersApi.updateProfile(data),
    onSuccess: () => toast.success('Profile updated'),
    onError: () => toast.error('Update failed'),
  })

  const addAddressMutation = useMutation({
    mutationFn: (data: typeof addrForm) => usersApi.addAddress(data),
    onSuccess: () => {
      toast.success('Address added')
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setAddrForm({ street: '', city: '', state: '', zipCode: '', country: 'US', isDefault: false })
    },
    onError: () => toast.error('Failed to add address'),
  })

  const deleteAddressMutation = useMutation({
    mutationFn: (id: number) => usersApi.deleteAddress(id),
    onSuccess: () => { toast.success('Address deleted'); queryClient.invalidateQueries({ queryKey: ['addresses'] }) },
  })

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p>Please <Link href="/login" className="text-primary">sign in</Link>.</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Profile */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="font-bold mb-4">Personal Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">First Name</label>
            <Input value={profileForm.firstName} onChange={e => setProfileForm(f => ({ ...f, firstName: e.target.value }))} className="mt-1" /></div>
          <div><label className="text-sm font-medium">Last Name</label>
            <Input value={profileForm.lastName} onChange={e => setProfileForm(f => ({ ...f, lastName: e.target.value }))} className="mt-1" /></div>
          <div className="col-span-2"><label className="text-sm font-medium">Email</label>
            <Input value={user.email} disabled className="mt-1 bg-gray-50" /></div>
          <div className="col-span-2"><label className="text-sm font-medium">Phone</label>
            <Input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} className="mt-1" /></div>
        </div>
        <Button className="mt-4" isLoading={updateProfileMutation.isPending}
          onClick={() => updateProfileMutation.mutate(profileForm)}>Save Changes</Button>
      </div>

      {/* Addresses */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="font-bold mb-4">Addresses</h2>
        {addresses.length === 0 ? (
          <p className="text-sm text-gray-500 mb-4">No addresses saved.</p>
        ) : (
          <div className="space-y-3 mb-6">
            {addresses.map((addr) => (
              <div key={addr.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="text-sm">
                  <p className="font-medium">{addr.street}</p>
                  <p className="text-gray-600">{addr.city}, {addr.state} {addr.zipCode} — {addr.country}</p>
                  {addr.isDefault && <span className="text-xs text-green-600 font-medium">Default</span>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteAddressMutation.mutate(addr.id)}
                  className="text-red-500 hover:text-red-700">Delete</Button>
              </div>
            ))}
          </div>
        )}
        <h3 className="font-semibold mb-3 text-sm">Add New Address</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Input placeholder="Street address" value={addrForm.street}
            onChange={e => setAddrForm(f => ({ ...f, street: e.target.value }))} /></div>
          <Input placeholder="City" value={addrForm.city} onChange={e => setAddrForm(f => ({ ...f, city: e.target.value }))} />
          <Input placeholder="State" value={addrForm.state} onChange={e => setAddrForm(f => ({ ...f, state: e.target.value }))} />
          <Input placeholder="ZIP Code" value={addrForm.zipCode} onChange={e => setAddrForm(f => ({ ...f, zipCode: e.target.value }))} />
          <Input placeholder="Country" value={addrForm.country} onChange={e => setAddrForm(f => ({ ...f, country: e.target.value }))} />
        </div>
        <div className="flex items-center gap-2 mt-3">
          <input type="checkbox" id="default" checked={addrForm.isDefault}
            onChange={e => setAddrForm(f => ({ ...f, isDefault: e.target.checked }))} />
          <label htmlFor="default" className="text-sm">Set as default</label>
        </div>
        <Button className="mt-3" isLoading={addAddressMutation.isPending}
          onClick={() => addAddressMutation.mutate(addrForm)}>Add Address</Button>
      </div>
    </div>
  )
}
