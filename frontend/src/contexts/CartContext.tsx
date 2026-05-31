'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '@/lib/api'
import { Cart } from '@/types'
import { useAuth } from './AuthContext'
import { toast } from 'sonner'

interface CartContextType {
  cart: Cart | null
  isLoading: boolean
  itemCount: number
  addItem: (productId: number, quantity?: number) => void
  updateItem: (itemId: number, quantity: number) => void
  removeItem: (itemId: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await cartApi.getCart()
      return res.data.data as Cart
    },
    enabled: !!user,
  })

  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: ['cart'] })

  const addMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      cartApi.addItem(productId, quantity),
    onSuccess: () => { invalidateCart(); toast.success('Added to cart') },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to add to cart')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      cartApi.updateItem(itemId, quantity),
    onSuccess: invalidateCart,
  })

  const removeMutation = useMutation({
    mutationFn: (itemId: number) => cartApi.removeItem(itemId),
    onSuccess: () => { invalidateCart(); toast.success('Item removed') },
  })

  const clearMutation = useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: invalidateCart,
  })

  return (
    <CartContext.Provider value={{
      cart: cart ?? null,
      isLoading,
      itemCount: cart?.itemCount ?? 0,
      addItem: (productId, quantity = 1) => addMutation.mutate({ productId, quantity }),
      updateItem: (itemId, quantity) => updateMutation.mutate({ itemId, quantity }),
      removeItem: (itemId) => removeMutation.mutate(itemId),
      clearCart: () => clearMutation.mutate(),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
