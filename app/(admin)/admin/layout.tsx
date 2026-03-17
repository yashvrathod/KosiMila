import type { ReactNode } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      <aside className="w-64 bg-gray-950 text-white border-r border-white/10">
        <div className="p-6">
          <h1 className="text-xl font-semibold tracking-tight">Admin Panel</h1>
          <p className="text-sm text-gray-300 mt-1">Manage your store</p>
        </div>

        <nav className="px-3 pb-6 space-y-1">
          <Link
  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-200 bg-white/5 hover:bg-white/10 hover:text-white transition"
  href="/"
>
  ← Go to Home
</Link>

          <Link
            className="block px-3 py-2 rounded-md text-sm text-gray-200 hover:bg-white/10 hover:text-white transition"
            href="/admin"
          >
            Dashboard
          </Link>
          <Link
            className="block px-3 py-2 rounded-md text-sm text-gray-200 hover:bg-white/10 hover:text-white transition"
            href="/admin/products"
          >
            Products
          </Link>
          <Link
            className="block px-3 py-2 rounded-md text-sm text-gray-200 hover:bg-white/10 hover:text-white transition"
            href="/admin/categories"
          >
            Categories
          </Link>
          <Link
            className="block px-3 py-2 rounded-md text-sm text-gray-200 hover:bg-white/10 hover:text-white transition"
            href="/admin/orders"
          >
            Orders
          </Link>
          <Link
            className="block px-3 py-2 rounded-md text-sm text-gray-200 hover:bg-white/10 hover:text-white transition"
            href="/admin/coupons"
          >
            Coupons
          </Link>
          {/* <Link
            className="block px-3 py-2 rounded-md text-sm text-gray-200 hover:bg-white/10 hover:text-white transition"
            href="/admin/settings"
          >
            Settings
          </Link> */}
          <Link
            className="block px-3 py-2 rounded-md text-sm text-gray-200 hover:bg-white/10 hover:text-white transition"
            href="/admin/banners"
          >
            Banners
          </Link>
          <Link
            className="block px-3 py-2 rounded-md text-sm text-gray-200 hover:bg-white/10 hover:text-white transition"
            href="/admin/messages"
          >
            Messages
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 text-gray-900">{children}</main>
    </div>
  );
}
