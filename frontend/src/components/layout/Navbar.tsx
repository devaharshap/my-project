'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, User, Search, Menu, X, Package } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Package className="h-6 w-6 text-primary" />
            ShopNow
          </Link>

          <div className="hidden md:flex flex-1 max-w-md">
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery) window.location.href = `/products?search=${encodeURIComponent(searchQuery)}` }} className="flex w-full">
              <input
                type="search" placeholder="Search products..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-l-md border border-r-0 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="rounded-r-md border bg-primary px-3 py-2 text-white">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={cn('px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100',
                  pathname === link.href ? 'text-primary' : 'text-gray-700')}>
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className="px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-md">
                Admin
              </Link>
            )}
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-md">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile" className="flex items-center gap-1 px-3 py-2 text-sm hover:bg-gray-100 rounded-md">
                  <User className="h-4 w-4" />
                  {user.firstName}
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login"><Button variant="outline" size="sm">Login</Button></Link>
                <Link href="/register"><Button size="sm">Sign Up</Button></Link>
              </div>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-2">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100">
              {link.label}
            </Link>
          ))}
          <Link href="/cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm">
            <ShoppingCart className="h-4 w-4" /> Cart ({itemCount})
          </Link>
          {user ? (
            <>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm">Profile</Link>
              <Link href="/orders" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm">Orders</Link>
              <button onClick={() => { logout(); setMenuOpen(false) }} className="block w-full text-left px-3 py-2 text-sm text-red-600">
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/login"><Button variant="outline" size="sm">Login</Button></Link>
              <Link href="/register"><Button size="sm">Sign Up</Button></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
