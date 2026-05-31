import Link from 'next/link'
import { Package } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-xl mb-3">
            <Package className="h-5 w-5" /> ShopNow
          </div>
          <p className="text-sm text-gray-600">Your one-stop shop for everything you need.</p>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Shop</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link href="/products" className="hover:text-primary">All Products</Link></li>
            <li><Link href="/products?featured=true" className="hover:text-primary">Featured</Link></li>
            <li><Link href="/cart" className="hover:text-primary">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Account</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link href="/profile" className="hover:text-primary">Profile</Link></li>
            <li><Link href="/orders" className="hover:text-primary">Orders</Link></li>
            <li><Link href="/login" className="hover:text-primary">Login</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Support</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><a href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noreferrer" className="hover:text-primary">API Docs</a></li>
            <li><span className="text-gray-400">contact@shopnow.com</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t text-center py-4 text-sm text-gray-500">
        © 2025 ShopNow. All rights reserved.
      </div>
    </footer>
  )
}
