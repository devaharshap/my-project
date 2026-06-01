'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, User, Search, Menu, X, Package, ChevronDown, LayoutDashboard, ClipboardList, LogOut, UserCircle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false)
    setMenuOpen(false)
  }, [pathname])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl shrink-0">
            <Package className="h-6 w-6 text-primary" />
            ShopNow
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (searchQuery) window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
              }}
              className="flex w-full"
            >
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-l-md border border-r-0 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="rounded-r-md border bg-primary px-3 py-2 text-white hover:bg-primary/90">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100',
                  pathname === link.href ? 'text-primary font-semibold' : 'text-gray-700'
                )}>
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <Link href="/admin"
                className="px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-md">
                Admin
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-md ml-1">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User dropdown / Auth buttons */}
            {user ? (
              <div className="relative ml-1" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(prev => !prev)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 text-gray-700"
                >
                  <User className="h-4 w-4" />
                  {user.firstName}
                  <ChevronDown className={cn('h-4 w-4 transition-transform', dropdownOpen && 'rotate-180')} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl border shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-semibold">{user.firstName} {user.lastName ?? ''}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link href="/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <UserCircle className="h-4 w-4 text-gray-400" /> My Profile
                    </Link>
                    <Link href="/orders"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <ClipboardList className="h-4 w-4 text-gray-400" /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link href="/admin"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-purple-600 hover:bg-purple-50">
                        <LayoutDashboard className="h-4 w-4" /> Admin Panel
                      </Link>
                    )}
                    <div className="border-t mt-1">
                      <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2 ml-1">
                <Link href="/login"><Button variant="outline" size="sm">Login</Button></Link>
                <Link href="/register"><Button size="sm">Sign Up</Button></Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-md hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
              className={cn(
                'block px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100',
                pathname === link.href ? 'text-primary' : 'text-gray-700'
              )}>
              {link.label}
            </Link>
          ))}

          <Link href="/cart" onClick={() => setMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-gray-100">
            <span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Cart</span>
            {itemCount > 0 && <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5">{itemCount}</span>}
          </Link>

          {user ? (
            <>
              <div className="px-3 py-2 border-t mt-1">
                <p className="text-xs text-gray-500">Signed in as</p>
                <p className="text-sm font-semibold">{user.firstName} {user.lastName ?? ''}</p>
              </div>
              <Link href="/profile" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100">
                <UserCircle className="h-4 w-4 text-gray-400" /> My Profile
              </Link>
              <Link href="/orders" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100">
                <ClipboardList className="h-4 w-4 text-gray-400" /> My Orders
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 rounded-md hover:bg-purple-50">
                  <LayoutDashboard className="h-4 w-4" /> Admin Panel
                </Link>
              )}
              <button
                onClick={() => { logout(); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2 px-1">
              <Link href="/login" className="flex-1"><Button variant="outline" className="w-full" size="sm">Login</Button></Link>
              <Link href="/register" className="flex-1"><Button className="w-full" size="sm">Sign Up</Button></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
