"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LuHeart,
  LuSearch,
  LuShoppingCart,
  LuUser,
  LuLogOut,
  LuMenu,
  LuX,
} from "react-icons/lu";
import Image from "next/image";

export type StoreHeaderCategory = {
  id: string;
  name: string;
  slug: string;
};

export default function StoreHeader({
  categories,
  initialSearch,
}: {
  categories: StoreHeaderCategory[];
  initialSearch?: string;
}) {
  const [searchQuery, setSearchQuery] = useState(initialSearch ?? "");
  const [userName, setUserName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        const name = data?.user?.name || null;
        if (active) setUserName(name);
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, []);

  const searchHref = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return "/products";
    const params = new URLSearchParams({ search: q });
    return `/products?${params.toString()}`;
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xs border-b border-neutral-100">

      {/* ================= PREMIUM ANNOUNCEMENT BAR ================= */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white overflow-hidden">
        <div className="whitespace-nowrap flex animate-marquee py-3 text-sm">
          {[
            "✨ Premium Quality Makhana",
            "🌿 100% Natural Ingredients",
            "🚚 Free Delivery on Orders Above ₹499",
            "💚 Healthy & Delicious",
            "✨ Premium Quality Makhana",
            "🌿 100% Natural Ingredients",
            "🚚 Free Delivery on Orders Above ₹499",
            "💚 Healthy & Delicious",
          ].map((text, i) => (
            <span
              key={i}
              className="mx-8 font-medium"
            >
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* ================= MAIN HEADER ================= */}
      <div className="container-premium">
        <div className="flex items-center justify-between">

          {/* LOGO */}
          <Link 
  href="/" 
  className="flex items-center gap-2"
>
  <Image
    src="/images/logo.jpeg"
    alt="Kosimila Logo"
    width={120}
    height={40}
    className="object-cover"
  />
</Link>

          {/* SEARCH - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search premium makhana..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") window.location.assign(searchHref);
                }}
                className="input-premium pr-12 text-sm"
              />
              <Link
                href={searchHref}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-primary-500 transition-colors"
              >
                <LuSearch size={18} />
              </Link>
            </div>
          </div>

          {/* ACTIONS - Desktop */}
          <nav className="hidden lg:flex items-center gap-2">

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="nav-link p-3 rounded-full hover:bg-neutral-50"
            >
              <LuHeart size={20} />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="btn-primary flex items-center gap-2 px-5"
            >
              <LuShoppingCart size={18} />
              <span>Cart</span>
            </Link>

            {/* User */}
            {userName ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="nav-link p-3 rounded-full hover:bg-neutral-50 flex items-center gap-2"
                >
                  <LuUser size={20} />
                  <span className="text-sm font-medium truncate max-w-[80px]">
                    {userName}
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-neutral-200 shadow-premium py-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-neutral-100">
                      <p className="text-sm font-medium text-neutral-900">{userName}</p>
                      <p className="text-xs text-neutral-500">Premium Member</p>
                    </div>
                    <Link
                      href="/profile"
                      className="w-full text-left px-4 py-3 text-sm nav-link hover:bg-neutral-50 flex items-center gap-3"
                    >
                      <LuUser size={16} />
                      My Orders
                    </Link>
                    <button
                      onClick={async () => {
                        await fetch("/api/auth/logout", { method: "POST" });
                        window.location.assign("/");
                      }}
                      className="w-full text-left px-4 py-3 text-sm nav-link hover:bg-neutral-50 flex items-center gap-3"
                    >
                      <LuLogOut size={14} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-secondary flex items-center gap-2 px-5"
              >
                <LuUser size={18} />
                <span>Login</span>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-3 rounded-full hover:bg-neutral-50"
          >
            {mobileMenuOpen ? <LuX size={24} /> : <LuMenu size={24} />}
          </button>

        </div>
      </div>

      {/* ================= CATEGORY NAVIGATION ================= */}
      <div className="hidden md:block bg-neutral-50/50 border-t border-neutral-100">
        <div className="container-premium">
          <nav className="flex gap-1 overflow-x-auto py-3">
            <Link
              href="/products"
              className="nav-link-active px-4 py-2 rounded-full text-sm font-medium"
            >
              All Products
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="nav-link px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-neutral-200 animate-fade-in">
          <div className="container-premium py-4 space-y-4">
            
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search premium makhana..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") window.location.assign(searchHref);
                }}
                className="input-premium pr-12"
              />
              <Link
                href={searchHref}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-primary-500 transition-colors"
              >
                <LuSearch size={18} />
              </Link>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <Link
                href="/products"
                className="block nav-link-active px-4 py-3 rounded-xl text-sm font-medium"
              >
                All Products
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="block nav-link px-4 py-3 rounded-xl text-sm font-medium"
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Actions */}
            <div className="flex gap-2 pt-4 border-t border-neutral-100">
              <Link
                href="/wishlist"
                className="btn-secondary flex-1 justify-center"
              >
                <LuHeart size={18} />
                <span>Wishlist</span>
              </Link>
              <Link
                href="/cart"
                className="btn-primary flex-1 justify-center"
              >
                <LuShoppingCart size={18} />
                <span>Cart</span>
              </Link>
              {userName ? (
                <button
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.assign("/");
                  }}
                  className="btn-ghost flex-1 justify-center"
                >
                  <LuLogOut size={18} />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="btn-secondary flex-1 justify-center"
                >
                  <LuUser size={18} />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

    </header>
  );
}