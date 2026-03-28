"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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
import { Sparkles, History, ArrowRight, Package } from "lucide-react";
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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  
  const [userName, setUserName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
    return () => { active = false; };
  }, []);

  // Live Search Logic
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error("Suggestions fetch failed", err);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Recently Viewed from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentlyViewed");
    if (saved) {
      setRecentlyViewed(JSON.parse(saved).slice(0, 3));
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchHref = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return "/products";
    const params = new URLSearchParams({ search: q });
    return `/products?${params.toString()}`;
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100">

      {/* ================= PREMIUM ANNOUNCEMENT BAR ================= */}
      <div className="bg-neutral-900 text-white overflow-hidden border-b border-white/5">
        <div className="whitespace-nowrap flex animate-marquee py-2.5 text-[10px] font-bold uppercase tracking-[0.2em]">
          {[
            "✨ Exclusive Ram Navami Sale: Extra 10% Off",
            "🌿 Farm-to-Table Luxury Makhana",
            "🚚 Complimentary Delivery on Orders Above ₹499",
            "💎 Premium Hand-Picked Quality",
            "✨ Exclusive Ram Navami Sale: Extra 10% Off",
            "🌿 Farm-to-Table Luxury Makhana",
            "🚚 Complimentary Delivery on Orders Above ₹499",
            "💎 Premium Hand-Picked Quality",
          ].map((text, i) => (
            <span key={i} className="mx-12">{text}</span>
          ))}
        </div>
      </div>

      {/* ================= MAIN HEADER ================= */}
      <div className="container-premium">
        <div className="flex items-center justify-between py-5 gap-8">

          {/* LOGO */}
           <Link 
  href="/" 
  className="flex items-center gap-2"
>
  <Image
    src="/images/logo.jpeg"
    alt="Kosimila Logo"
    width={110}
    height={40}
    className="object-cover"
  />
</Link>

          {/* SEARCH - Luxury Live Search */}
          <div className="hidden md:flex flex-1 max-w-xl relative" ref={searchRef}>
            <div className="relative w-full group">
              <input
                type="text"
                placeholder="Search premium collections..."
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") window.location.assign(searchHref);
                }}
                className="w-full bg-neutral-50 border-2 border-transparent focus:border-neutral-900 focus:bg-white rounded-2xl px-6 py-3 text-sm font-medium transition-all outline-none pl-12 shadow-sm"
              />
              <LuSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
              
              {/* Search Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl border border-neutral-100 shadow-2xl overflow-hidden animate-fade-in z-50">
                  <div className="p-6">
                    {searchQuery.length > 0 ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Product Suggestions</h4>
                          {suggestions.length > 0 && <Link href={searchHref} className="text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:underline">View All</Link>}
                        </div>
                        {suggestions.length > 0 ? (
                          <div className="grid gap-4">
                            {suggestions.map((s) => (
                              <Link key={s.id} href={`/products/${s.id}`} className="flex items-center gap-4 group p-2 rounded-2xl hover:bg-neutral-50 transition-colors">
                                <div className="w-14 h-14 bg-neutral-50 rounded-xl overflow-hidden border border-neutral-100 p-2 shrink-0">
                                  <img src={s.images[0]} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-neutral-900 line-clamp-1">{s.name}</p>
                                  <p className="text-[10px] font-bold text-neutral-400 uppercase">{s.category.name}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-neutral-900">₹{s.price}</p>
                                  <p className="text-[10px] font-bold text-success-600 uppercase">In Stock</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="py-4 text-center">
                            <p className="text-sm text-neutral-500 font-medium">No direct matches found. Try searching for "Makhana"</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {recentlyViewed.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                              <History size={12} /> Recently Viewed
                            </div>
                            <div className="grid gap-3">
                              {recentlyViewed.map((v) => (
                                <Link key={v.id} href={`/products/${v.id}`} className="flex items-center gap-3 text-sm font-bold text-neutral-600 hover:text-neutral-900">
                                  <ArrowRight size={14} className="text-neutral-300" /> {v.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="space-y-4 pt-2">
                          <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Popular Collections</h4>
                          <div className="flex flex-wrap gap-2">
                            {["Roasted", "Spicy", "Gift Boxes", "Daily Packs"].map(tag => (
                              <Link key={tag} href={`/products?search=${tag}`} className="px-4 py-2 bg-neutral-50 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-900 hover:text-white transition-all">
                                {tag}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ACTIONS - Desktop */}
          <nav className="hidden lg:flex items-center gap-2">

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-3 rounded-2xl hover:bg-neutral-50 transition-colors relative group"
            >
              <LuHeart size={20} className="text-neutral-600 group-hover:text-neutral-900" />
            </Link>

            {/* User */}
            {userName ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="p-3 rounded-2xl hover:bg-neutral-50 flex items-center gap-3 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-tighter">
                    {userName.charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-neutral-900 truncate max-w-[80px]">
                    {userName.split(' ')[0]}
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl border border-neutral-100 shadow-2xl py-3 animate-fade-in z-50">
                    <div className="px-6 py-4 border-b border-neutral-50">
                      <p className="text-sm font-bold text-neutral-900">{userName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Sparkles size={12} className="text-amber-500" />
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Premium Member</p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="px-6 py-3 text-sm font-bold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 flex items-center gap-4 transition-all"
                    >
                      <Package size={18} /> My Dashboard
                    </Link>
                    <button
                      onClick={async () => {
                        await fetch("/api/auth/logout", { method: "POST" });
                        window.location.assign("/");
                      }}
                      className="w-full text-left px-6 py-3 text-sm font-bold text-error-600 hover:bg-error-50 flex items-center gap-4 transition-all"
                    >
                      <LuLogOut size={18} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="p-3 rounded-2xl hover:bg-neutral-50 transition-colors"
              >
                <LuUser size={20} className="text-neutral-600" />
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="bg-neutral-900 text-white flex items-center gap-3 px-6 py-3 rounded-2xl hover:bg-primary-600 transition-all shadow-lg shadow-neutral-200"
            >
              <LuShoppingCart size={18} />
              <span className="text-sm font-bold uppercase tracking-widest">Cart</span>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-3 rounded-2xl hover:bg-neutral-50"
          >
            {mobileMenuOpen ? <LuX size={24} /> : <LuMenu size={24} />}
          </button>

        </div>
      </div>

      {/* ================= LUXURY NAVIGATION ================= */}
      <div className="hidden md:block bg-white border-t border-neutral-100">
        <div className="container-premium">
          <nav className="flex justify-center gap-8 py-4">
            <Link
              href="/products"
              className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-900 border-b-2 border-neutral-900 pb-1"
            >
              The Collections
            </Link>
            <Link
              href="/recipes"
              className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-900 transition-colors pb-1 border-b-2 border-transparent"
            >
              Culinary Recipes
            </Link>
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-900 transition-colors pb-1 border-b-2 border-transparent"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-neutral-100 animate-fade-in h-[100vh] overflow-y-auto">
          <div className="container-premium py-8 space-y-10 pb-32">
            
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search premium collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") window.location.assign(searchHref);
                }}
                className="w-full bg-neutral-50 rounded-2xl px-6 py-4 pl-12 text-sm font-medium outline-none"
              />
              <LuSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            </div>

            {/* Mobile Navigation */}
            <nav className="grid gap-6">
              <Link href="/products" className="text-xl font-bold text-neutral-900 flex items-center justify-between group">
                The Collections <ArrowRight size={20} className="text-neutral-300" />
              </Link>
              <Link href="/recipes" className="text-xl font-bold text-neutral-900 flex items-center justify-between group">
                Recipes <ArrowRight size={20} className="text-neutral-300" />
              </Link>
              <div className="h-px bg-neutral-100 my-2" />
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="text-lg font-bold text-neutral-500 hover:text-neutral-900"
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Actions */}
            <div className="pt-10 border-t border-neutral-100 grid grid-cols-2 gap-4">
              <Link
                href="/wishlist"
                className="flex items-center justify-center gap-3 py-4 bg-neutral-50 rounded-2xl font-bold text-sm"
              >
                <LuHeart size={18} /> Wishlist
              </Link>
              <Link
                href="/cart"
                className="flex items-center justify-center gap-3 py-4 bg-neutral-900 text-white rounded-2xl font-bold text-sm"
              >
                <LuShoppingCart size={18} /> Cart
              </Link>
              {userName ? (
                <Link
                  href="/profile"
                  className="col-span-2 flex items-center justify-center gap-3 py-4 border-2 border-neutral-100 rounded-2xl font-bold text-sm"
                >
                  <Package size={18} /> My Account
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="col-span-2 flex items-center justify-center gap-3 py-4 border-2 border-neutral-100 rounded-2xl font-bold text-sm"
                >
                  <LuUser size={18} /> Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
